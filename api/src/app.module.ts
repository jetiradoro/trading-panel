import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { LogsMiddleware } from './logs/logs.middleware';
import { ConfigModule } from '@nestjs/config';
import config from './config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { SymbolsModule } from './symbols/symbols.module';
import { OperationsModule } from './operations/operations.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MarketDataModule } from './market-data/market-data.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MarketSyncCron } from './market-data/market-sync.cron';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
      load: [config],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    PrismaModule,
    AccountsModule,
    TransactionsModule,
    SymbolsModule,
    OperationsModule,
    AnalyticsModule,
    MarketDataModule,
  ],
  controllers: [AppController],
  providers: [AppService, MarketSyncCron],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogsMiddleware).forRoutes('*');
  }
}
