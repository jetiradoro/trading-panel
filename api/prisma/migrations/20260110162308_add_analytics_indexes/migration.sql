-- CreateIndex
CREATE INDEX `operation_entries_operationId_date_idx` ON `operation_entries`(`operationId`, `date`);

-- CreateIndex
CREATE INDEX `operation_entries_operationId_entryType_idx` ON `operation_entries`(`operationId`, `entryType`);

-- CreateIndex
CREATE INDEX `operations_userId_status_idx` ON `operations`(`userId`, `status`);

-- CreateIndex
CREATE INDEX `operations_userId_status_updatedAt_idx` ON `operations`(`userId`, `status`, `updatedAt`);

-- CreateIndex
CREATE INDEX `operations_accountId_status_idx` ON `operations`(`accountId`, `status`);

-- CreateIndex
CREATE INDEX `price_history_symbolId_date_idx` ON `price_history`(`symbolId`, `date`);

-- CreateIndex
CREATE INDEX `transactions_userId_date_idx` ON `transactions`(`userId`, `date`);

-- CreateIndex
CREATE INDEX `transactions_accountId_date_idx` ON `transactions`(`accountId`, `date`);
