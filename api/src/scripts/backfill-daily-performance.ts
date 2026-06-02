import { PrismaClient, operations, operation_entries, price_history } from '@prisma/client';

const prisma = new PrismaClient();
const dailyPerformance = (prisma as any).analytics_daily_performance;

type Scope = 'trading' | 'etf';

type OperationWithHistory = operations & {
  entries: operation_entries[];
  symbol: {
    priceHistory: price_history[];
  } | null;
};

const SCOPES: Scope[] = ['trading', 'etf'];

function getMadridDay(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function dayStartUtc(day: string): Date {
  return new Date(`${day}T00:00:00.000Z`);
}

function dayEndUtc(day: string): Date {
  return new Date(`${day}T23:59:59.999Z`);
}

function nextDay(day: string): string {
  const date = dayStartUtc(day);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function minDay(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return a <= b ? a : b;
}

function getProductWhere(scope: Scope) {
  if (scope === 'etf') {
    return { product: 'etf' as const };
  }
  return { product: { not: 'etf' as const } };
}

function getOperationCloseDate(op: OperationWithHistory): Date | null {
  if (op.status !== 'closed') {
    return null;
  }
  const latestEntry = op.entries.length
    ? op.entries.reduce((latest, entry) =>
        entry.date > latest.date ? entry : latest,
      )
    : null;
  return latestEntry?.date || op.updatedAt || null;
}

function getPriceAtDay(op: OperationWithHistory, dayEnd: Date): number | null {
  if (!op.symbol?.priceHistory?.length) return null;
  const prices = op.symbol.priceHistory;
  for (let i = prices.length - 1; i >= 0; i -= 1) {
    if (prices[i].date <= dayEnd) {
      return Number(prices[i].price);
    }
  }
  return null;
}

function calculateDailyPerformance(
  operations: OperationWithHistory[],
  day: string,
) {
  const dayEnd = dayEndUtc(day);

  let realizedPnL = 0;
  let unrealizedPnL = 0;
  let totalCurrentInvestment = 0;
  let closedCount = 0;
  let wins = 0;
  let losses = 0;

  for (const op of operations) {
    if (op.createdAt > dayEnd) continue;

    const closeDate = getOperationCloseDate(op);
    const closedByDay = !!closeDate && closeDate <= dayEnd;

    const entriesUntilDay = op.entries.filter((entry) => entry.date <= dayEnd);
    if (!entriesUntilDay.length) continue;

    if (closedByDay) {
      const balance = Number(op.balance || 0);
      realizedPnL += balance;
      closedCount += 1;
      if (balance > 0) wins += 1;
      if (balance < 0) losses += 1;
      continue;
    }

    const buyEntries = entriesUntilDay.filter((e) => e.entryType === 'buy');
    const sellEntries = entriesUntilDay.filter((e) => e.entryType === 'sell');

    const buyQty = buyEntries.reduce((sum, e) => sum + Number(e.quantity), 0);
    const sellQty = sellEntries.reduce((sum, e) => sum + Number(e.quantity), 0);

    const isDerivative = op.product === 'derivative';
    const isLongLike = isDerivative || op.type === 'long';
    const netQty = buyQty - sellQty;
    const currentQty = isDerivative ? Math.abs(netQty) : isLongLike ? netQty : -netQty;

    if (currentQty <= 0) continue;

    const entryEntries = isDerivative
      ? netQty >= 0
        ? buyEntries
        : sellEntries
      : isLongLike
        ? buyEntries
        : sellEntries;

    const entryQty = isDerivative ? (netQty >= 0 ? buyQty : sellQty) : isLongLike ? buyQty : sellQty;
    const entryTotal = entryEntries.reduce(
      (sum, e) => sum + Number(e.quantity) * Number(e.price),
      0,
    );
    const avgEntryPrice = entryQty > 0 ? entryTotal / entryQty : 0;

    totalCurrentInvestment += avgEntryPrice * currentQty;

    const priceAtDay = getPriceAtDay(op, dayEnd) ?? avgEntryPrice;
    const pnl = isLongLike
      ? (priceAtDay - avgEntryPrice) * currentQty
      : (avgEntryPrice - priceAtDay) * currentQty;

    unrealizedPnL += pnl;
  }

  const totalPnL = realizedPnL + unrealizedPnL;
  const totalPnLPercentage =
    totalCurrentInvestment > 0 ? (totalPnL / totalCurrentInvestment) * 100 : 0;
  const winRate = closedCount > 0 ? (wins / closedCount) * 100 : 0;

  return {
    realizedPnL,
    unrealizedPnL,
    totalPnL,
    totalPnLPercentage,
    winningOperations: wins,
    losingOperations: losses,
    winRate,
  };
}

async function getScopeStartDay(accountId: string, userId: string, scope: Scope) {
  const productWhere = getProductWhere(scope);

  const [firstEntry, firstOperation] = await Promise.all([
    prisma.operation_entries.findFirst({
      where: {
        operation: {
          accountId,
          userId,
          ...productWhere,
        },
      },
      orderBy: { date: 'asc' },
      select: { date: true },
    }),
    prisma.operations.findFirst({
      where: {
        accountId,
        userId,
        ...productWhere,
      },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    }),
  ]);

  const fromEntry = firstEntry ? getMadridDay(firstEntry.date) : null;
  const fromOperation = firstOperation ? getMadridDay(firstOperation.createdAt) : null;

  return minDay(fromEntry, fromOperation);
}

async function backfillScope(accountId: string, userId: string, scope: Scope, fromDay: string, toDay: string) {
  const productWhere = getProductWhere(scope);
  const toDayEnd = dayEndUtc(toDay);

  const operations = (await prisma.operations.findMany({
    where: {
      accountId,
      userId,
      ...productWhere,
      createdAt: { lte: toDayEnd },
    },
    include: {
      entries: {
        orderBy: { date: 'asc' },
      },
      symbol: {
        include: {
          priceHistory: {
            where: { date: { lte: toDayEnd } },
            orderBy: { date: 'asc' },
          },
        },
      },
    },
  })) as OperationWithHistory[];

  let day = fromDay;
  let inserted = 0;

  while (day <= toDay) {
    const perf = calculateDailyPerformance(operations, day);

    await dailyPerformance.upsert({
      where: {
        userId_accountId_product_snapshotDay: {
          userId,
          accountId,
          product: scope,
          snapshotDay: day,
        },
      },
      create: {
        userId,
        accountId,
        product: scope,
        snapshotDay: day,
        totalPnL: perf.totalPnL,
        totalPnLPercentage: perf.totalPnLPercentage,
        realizedPnL: perf.realizedPnL,
        unrealizedPnL: perf.unrealizedPnL,
        winRate: perf.winRate,
      },
      update: {
        totalPnL: perf.totalPnL,
        totalPnLPercentage: perf.totalPnLPercentage,
        realizedPnL: perf.realizedPnL,
        unrealizedPnL: perf.unrealizedPnL,
        winRate: perf.winRate,
      },
    });

    inserted += 1;
    day = nextDay(day);
  }

  return inserted;
}

async function main() {
  const toDayArg = process.env.BACKFILL_TO;
  const fromDayArg = process.env.BACKFILL_FROM;
  const toDay = toDayArg || getMadridDay(new Date());

  const accounts = await prisma.accounts.findMany({
    select: { id: true, userId: true, name: true },
    orderBy: { createdAt: 'asc' },
  });

  let totalRows = 0;

  for (const account of accounts) {
    for (const scope of SCOPES) {
      const scopeStartDay = fromDayArg || (await getScopeStartDay(account.id, account.userId, scope));
      if (!scopeStartDay) {
        continue;
      }

      if (scopeStartDay > toDay) {
        continue;
      }

      console.log(
        `[backfill] account=${account.name} (${account.id}) scope=${scope} from=${scopeStartDay} to=${toDay}`,
      );

      const inserted = await backfillScope(
        account.id,
        account.userId,
        scope,
        scopeStartDay,
        toDay,
      );
      totalRows += inserted;
    }
  }

  console.log(`[backfill] completed rows_upserted=${totalRows}`);
}

main()
  .catch((error) => {
    console.error('[backfill] failed', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
