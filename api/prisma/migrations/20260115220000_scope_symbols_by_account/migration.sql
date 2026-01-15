-- Add account/user scoping to symbols and price history
ALTER TABLE `symbols`
  ADD COLUMN `userId` VARCHAR(191) NULL,
  ADD COLUMN `accountId` VARCHAR(191) NULL;

ALTER TABLE `price_history`
  ADD COLUMN `userId` VARCHAR(191) NULL,
  ADD COLUMN `accountId` VARCHAR(191) NULL;

-- Backfill symbols from operations; fallback to active account for single-user setup
UPDATE `symbols` s
LEFT JOIN `operations` o ON o.`symbolId` = s.`id`
SET
  s.`userId` = COALESCE(o.`userId`, (SELECT `userId` FROM `accounts` WHERE `active` = 1 LIMIT 1)),
  s.`accountId` = COALESCE(o.`accountId`, (SELECT `id` FROM `accounts` WHERE `active` = 1 LIMIT 1))
WHERE s.`userId` IS NULL OR s.`accountId` IS NULL;

-- Backfill price history from symbols
UPDATE `price_history` ph
JOIN `symbols` s ON s.`id` = ph.`symbolId`
SET
  ph.`userId` = s.`userId`,
  ph.`accountId` = s.`accountId`
WHERE ph.`userId` IS NULL OR ph.`accountId` IS NULL;

-- Enforce not null after backfill
ALTER TABLE `symbols`
  MODIFY `userId` VARCHAR(191) NOT NULL,
  MODIFY `accountId` VARCHAR(191) NOT NULL;

ALTER TABLE `price_history`
  MODIFY `userId` VARCHAR(191) NOT NULL,
  MODIFY `accountId` VARCHAR(191) NOT NULL;

-- Replace global unique code with account-scoped unique
DROP INDEX `symbols_code_key` ON `symbols`;
CREATE UNIQUE INDEX `symbols_accountId_code_key` ON `symbols`(`accountId`, `code`);

-- Indexes
CREATE INDEX `symbols_userId_idx` ON `symbols`(`userId`);
CREATE INDEX `symbols_accountId_idx` ON `symbols`(`accountId`);
CREATE INDEX `price_history_userId_idx` ON `price_history`(`userId`);
CREATE INDEX `price_history_accountId_idx` ON `price_history`(`accountId`);
CREATE INDEX `price_history_accountId_date_idx` ON `price_history`(`accountId`, `date`);

-- Foreign keys
ALTER TABLE `symbols`
  ADD CONSTRAINT `symbols_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`) ON DELETE CASCADE;

ALTER TABLE `price_history`
  ADD CONSTRAINT `price_history_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`) ON DELETE CASCADE;
