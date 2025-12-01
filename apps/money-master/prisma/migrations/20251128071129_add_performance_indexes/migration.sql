-- CreateIndex
CREATE INDEX "Asset_type_idx" ON "Asset"("type");

-- CreateIndex
CREATE INDEX "Asset_isArchived_idx" ON "Asset"("isArchived");

-- CreateIndex
CREATE INDEX "Dividend_date_idx" ON "Dividend"("date");

-- CreateIndex
CREATE INDEX "Dividend_assetId_idx" ON "Dividend"("assetId");

-- CreateIndex
CREATE INDEX "Transaction_date_idx" ON "Transaction"("date");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Transaction_assetId_idx" ON "Transaction"("assetId");
