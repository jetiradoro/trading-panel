-- AlterTable
ALTER TABLE `users` ADD COLUMN `refresh_token` VARCHAR(191) NULL,
    ADD COLUMN `token_expiration` DATETIME(3) NULL;
