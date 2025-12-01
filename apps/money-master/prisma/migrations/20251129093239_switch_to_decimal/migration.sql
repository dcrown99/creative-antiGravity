/*
  Warnings:

  - You are about to alter the column `avgCost` on the `Asset` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `balance` on the `Asset` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `currentPrice` on the `Asset` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `dividendRate` on the `Asset` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `dividendYield` on the `Asset` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `manualPrice` on the `Asset` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `quantity` on the `Asset` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `amount` on the `Dividend` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `totalCost` on the `HistoryEntry` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `totalPL` on the `HistoryEntry` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `totalValue` on the `HistoryEntry` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.
  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Decimal`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Asset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticker" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "account" TEXT,
    "quantity" DECIMAL,
    "avgCost" DECIMAL,
    "currency" TEXT NOT NULL,
    "currentPrice" DECIMAL,
    "dividendRate" DECIMAL,
    "dividendYield" DECIMAL,
    "nextDividendDate" TEXT,
    "sector" TEXT,
    "manualPrice" DECIMAL,
    "balance" DECIMAL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Asset" ("account", "avgCost", "balance", "createdAt", "currency", "currentPrice", "description", "dividendRate", "dividendYield", "id", "isArchived", "manualPrice", "name", "nextDividendDate", "quantity", "sector", "ticker", "type", "updatedAt") SELECT "account", "avgCost", "balance", "createdAt", "currency", "currentPrice", "description", "dividendRate", "dividendYield", "id", "isArchived", "manualPrice", "name", "nextDividendDate", "quantity", "sector", "ticker", "type", "updatedAt" FROM "Asset";
DROP TABLE "Asset";
ALTER TABLE "new_Asset" RENAME TO "Asset";
CREATE INDEX "Asset_type_idx" ON "Asset"("type");
CREATE INDEX "Asset_isArchived_createdAt_idx" ON "Asset"("isArchived", "createdAt");
CREATE TABLE "new_Dividend" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "assetId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL,
    CONSTRAINT "Dividend_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Dividend" ("amount", "assetId", "currency", "date", "id") SELECT "amount", "assetId", "currency", "date", "id" FROM "Dividend";
DROP TABLE "Dividend";
ALTER TABLE "new_Dividend" RENAME TO "Dividend";
CREATE INDEX "Dividend_date_idx" ON "Dividend"("date");
CREATE INDEX "Dividend_assetId_idx" ON "Dividend"("assetId");
CREATE TABLE "new_HistoryEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "totalValue" DECIMAL NOT NULL,
    "totalCost" DECIMAL NOT NULL,
    "totalPL" DECIMAL NOT NULL,
    "data" TEXT
);
INSERT INTO "new_HistoryEntry" ("date", "id", "totalCost", "totalPL", "totalValue") SELECT "date", "id", "totalCost", "totalPL", "totalValue" FROM "HistoryEntry";
DROP TABLE "HistoryEntry";
ALTER TABLE "new_HistoryEntry" RENAME TO "HistoryEntry";
CREATE UNIQUE INDEX "HistoryEntry_date_key" ON "HistoryEntry"("date");
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "assetId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "assetId", "category", "createdAt", "date", "description", "id", "type") SELECT "amount", "assetId", "category", "createdAt", "date", "description", "id", "type" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE INDEX "Transaction_date_createdAt_idx" ON "Transaction"("date", "createdAt");
CREATE INDEX "Transaction_type_date_idx" ON "Transaction"("type", "date");
CREATE INDEX "Transaction_assetId_idx" ON "Transaction"("assetId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
