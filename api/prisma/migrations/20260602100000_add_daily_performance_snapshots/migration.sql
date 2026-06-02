-- Create daily analytics snapshots table
CREATE TABLE `analytics_daily_performance` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `accountId` VARCHAR(191) NOT NULL,
  `product` VARCHAR(191) NOT NULL,
  `snapshotDay` VARCHAR(10) NOT NULL,
  `totalPnL` DOUBLE NOT NULL,
  `totalPnLPercentage` DOUBLE NOT NULL,
  `realizedPnL` DOUBLE NOT NULL,
  `unrealizedPnL` DOUBLE NOT NULL,
  `winRate` DOUBLE NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE INDEX `idx_daily_perf_unique`(`userId`, `accountId`, `product`, `snapshotDay`),
  INDEX `idx_daily_perf_lookup`(`userId`, `accountId`, `product`, `snapshotDay`),
  CONSTRAINT `analytics_daily_performance_accountId_fkey`
    FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
