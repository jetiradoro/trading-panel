/*
  Warnings:

  - You are about to drop the column `operationId` on the `price_history` table. All the data in the column will be lost.
  - Added the required column `symbolId` to the `price_history` table without a default value. This is not possible if the table is not empty.

*/

-- Paso 1: Agregar columna symbolId temporal (puede ser NULL)
ALTER TABLE `price_history` ADD COLUMN `symbolId` VARCHAR(191);

-- Paso 2: Poblar symbolId con los datos de las operaciones existentes
UPDATE `price_history` ph
INNER JOIN `operations` o ON ph.operationId = o.id
SET ph.symbolId = o.symbolId;

-- Paso 3: Hacer symbolId NOT NULL
ALTER TABLE `price_history` MODIFY `symbolId` VARCHAR(191) NOT NULL;

-- Paso 4: Eliminar foreign key y el índice de operationId
ALTER TABLE `price_history` DROP FOREIGN KEY `price_history_operationId_fkey`;
DROP INDEX `price_history_operationId_idx` ON `price_history`;

-- Paso 5: Eliminar la columna operationId
ALTER TABLE `price_history` DROP COLUMN `operationId`;

-- Paso 6: Crear índice en symbolId
CREATE INDEX `price_history_symbolId_idx` ON `price_history`(`symbolId`);

-- Paso 7: Agregar foreign key a symbols
ALTER TABLE `price_history` ADD CONSTRAINT `price_history_symbolId_fkey` FOREIGN KEY (`symbolId`) REFERENCES `symbols`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
