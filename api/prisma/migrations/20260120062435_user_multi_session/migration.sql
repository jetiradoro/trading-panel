-- DropForeignKey
ALTER TABLE `price_history` DROP FOREIGN KEY `price_history_accountId_fkey`;

-- DropForeignKey
ALTER TABLE `symbols` DROP FOREIGN KEY `symbols_accountId_fkey`;

-- CreateIndex
CREATE INDEX `symbols_accountId_sortOrder_idx` ON `symbols`(`accountId`, `sortOrder`);

-- AddForeignKey
ALTER TABLE `symbols` ADD CONSTRAINT `symbols_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `price_history` ADD CONSTRAINT `price_history_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `accounts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
