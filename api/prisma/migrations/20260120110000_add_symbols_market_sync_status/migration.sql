-- Add market sync status to symbols
ALTER TABLE `symbols`
  ADD COLUMN `marketSyncStatus` VARCHAR(20) NULL,
  ADD COLUMN `marketSyncError` VARCHAR(500) NULL;
