-- RenameIndex
ALTER TABLE `transactions` RENAME INDEX `transactions_accountId_idx` TO `transactions_accountId_fkey`;
