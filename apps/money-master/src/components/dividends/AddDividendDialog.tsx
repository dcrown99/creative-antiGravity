"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@repo/ui";
import { addDividend } from "@/lib/actions";
import { Asset } from "@/types";
import { Loader2 } from "lucide-react";

interface AddDividendDialogProps {
    isOpen: boolean;
    onClose: () => void;
    assets: Asset[];
}

export function AddDividendDialog({ isOpen, onClose, assets }: AddDividendDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState<string>("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);

            // If asset is selected, set currency based on asset if possible, or let user select
            // For now, we just submit what's in the form

            const result = await addDividend(formData);

            if (result.success) {
                onClose();
                // Reset form or state if needed
                setSelectedAssetId("");
            } else {
                alert("配当の追加に失敗しました");
            }
        } catch (error) {
            console.error(error);
            alert("エラーが発生しました");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAssetChange = (value: string) => {
        setSelectedAssetId(value);
    };

    // Filter assets to only show stocks/ETFs/Trusts
    const investmentAssets = assets.filter(a =>
        ['JP_STOCK', 'US_STOCK', 'TRUST', 'ETF'].includes(a.type)
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>配当を追加</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">日付</Label>
                        <Input
                            id="date"
                            name="date"
                            type="date"
                            required
                            defaultValue={new Date().toISOString().split('T')[0]}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="assetId">銘柄</Label>
                        <Select name="assetId" required onValueChange={handleAssetChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="銘柄を選択" />
                            </SelectTrigger>
                            <SelectContent>
                                {investmentAssets.map((asset) => (
                                    <SelectItem key={asset.id} value={asset.id}>
                                        {asset.ticker ? `[${asset.ticker}] ` : ''}{asset.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">金額</Label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                step="0.01"
                                required
                                placeholder="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="currency">通貨</Label>
                            <Select name="currency" required defaultValue="JPY">
                                <SelectTrigger>
                                    <SelectValue placeholder="通貨" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            キャンセル
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            追加
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
