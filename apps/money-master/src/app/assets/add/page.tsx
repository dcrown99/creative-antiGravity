"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addAssetAction } from "@/lib/actions";
import { Button, Card } from "@repo/ui";

export default function AddAssetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const data = {
      name: formData.get("name"),
      ticker: formData.get("code"),
      type: formData.get("type"),
      quantity: Number(formData.get("quantity")),
      currentPrice: Number(formData.get("currentPrice")),
      currency: 'JPY', // Default to JPY for now
      avgCost: Number(formData.get("currentPrice")), // Default avgCost to currentPrice
    };

    await addAssetAction(data);
    setLoading(false);
    router.push("/assets");
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">資産を追加</h1>
      <Card className="p-6">
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">資産名</label>
            <input name="name" id="name" required className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="code" className="block text-sm font-medium mb-1">コード/ティッカー</label>
            <input name="code" id="code" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-1">種類</label>
            <select name="type" id="type" className="w-full p-2 border rounded">
              <option value="stock">株式</option>
              <option value="cash">現金</option>
              <option value="bank">銀行</option>
              <option value="trust">投資信託</option>
            </select>
          </div>
          <div>
            <label htmlFor="currentPrice" className="block text-sm font-medium mb-1">現在の価格</label>
            <input name="currentPrice" id="currentPrice" type="number" className="w-full p-2 border rounded" />
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium mb-1">保有数量</label>
            <input name="quantity" id="quantity" type="number" className="w-full p-2 border rounded" />
          </div>
          <div className="pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
