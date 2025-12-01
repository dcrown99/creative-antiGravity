"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Button,
    Input,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@repo/ui";
import { Plus, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";
import { getCategoryRules, addCategoryRule, deleteCategoryRule } from "@/lib/actions";
import { CategoryRule } from "@/lib/classifier";

export function CategoryRulesManager() {
    const [rules, setRules] = useState<CategoryRule[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newPattern, setNewPattern] = useState("");
    const [newCategory, setNewCategory] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const loadRules = async () => {
        setIsLoading(true);
        try {
            const data = await getCategoryRules();
            // Prismaの型とCategoryRule型を合わせるためのキャスト（必要であれば）
            // ここではdataはPrismaのCategoryRule[]なので、classifier.tsのCategoryRuleと互換性があるはず
            setRules(Array.isArray(data) ? (data as unknown as CategoryRule[]) : []);
        } catch (error) {
            console.error("Failed to load rules:", error);
            setRules([]);
            toast.error("ルールの取得に失敗しました");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRules();
    }, []);

    const handleAddRule = async () => {
        if (!newPattern || !newCategory) {
            toast.error("キーワードとカテゴリを入力してください");
            return;
        }

        setIsAdding(true);
        try {
            const result = await addCategoryRule(newPattern, newCategory);
            if (result.success) {
                toast.success("ルールを追加しました");
                setNewPattern("");
                setNewCategory("");
                loadRules();
            } else {
                toast.error(result.error || "ルールの追加に失敗しました");
            }
        } catch (error) {
            toast.error("ルールの追加に失敗しました");
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteRule = async (id: string) => {
        if (!confirm("このルールを削除しますか？")) return;

        try {
            const result = await deleteCategoryRule(id);
            if (result.success) {
                toast.success("ルールを削除しました");
                loadRules();
            } else {
                toast.error(result.error || "ルールの削除に失敗しました");
            }
        } catch (error) {
            toast.error("ルールの削除に失敗しました");
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    カテゴリ自動化ルール
                </CardTitle>
                <CardDescription>
                    取引明細のキーワードに基づいて、カテゴリを自動的に割り当てるルールを管理します。
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* 追加フォーム */}
                <div className="flex gap-4 items-end">
                    <div className="grid gap-2 flex-1">
                        <label className="text-sm font-medium">キーワード (部分一致)</label>
                        <Input
                            placeholder="例: セブンイレブン"
                            value={newPattern}
                            onChange={(e) => setNewPattern(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2 flex-1">
                        <label className="text-sm font-medium">カテゴリ</label>
                        <Input
                            placeholder="例: 食費"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                        />
                    </div>
                    <Button onClick={handleAddRule} disabled={isAdding}>
                        <Plus className="mr-2 h-4 w-4" />
                        追加
                    </Button>
                </div>

                {/* ルール一覧 */}
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>キーワード</TableHead>
                                <TableHead>カテゴリ</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rules.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                        {isLoading ? "読み込み中..." : "ルールが登録されていません"}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rules.map((rule) => (
                                    <TableRow key={rule.id || rule.pattern.toString()}>
                                        <TableCell className="font-mono text-sm">
                                            {typeof rule.pattern === 'string' ? rule.pattern : rule.pattern.source}
                                        </TableCell>
                                        <TableCell>{rule.category}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => rule.id && handleDeleteRule(rule.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
