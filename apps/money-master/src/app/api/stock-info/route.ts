import { NextResponse } from "next/server";
import { getStockInfo } from "@/services/stock.service";

/**
 * Stock & FX price fetching API
 * Supports Japanese stocks (7203.T), US stocks (AAPL), and FX rates (USDJPY=X)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
  }

  const result = await getStockInfo(symbol);

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}

