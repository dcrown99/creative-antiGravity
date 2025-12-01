"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { Download, RefreshCw, Trash2, Upload, Database } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { CategoryRulesManager } from "@/components/settings/CategoryRulesManager";

interface BackupFile {
  name: string;
  size: number;
  date: string;
}

export default function SettingsPage() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const loadBackups = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/backup');
      const data = await res.json();
      if (data.success) {
        setBackups(data.backups);
      } else {
        toast.error('バックアップ一覧の取得に失敗しました');
      }
    } catch (error) {
      toast.error('バックアップ一覧の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const handleCreateBackup = async () => {
    if (!confirm('データベースのバックアップを作成しますか？')) return;

    setIsCreatingBackup(true);
    try {
      const res = await fetch('/api/backup', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        toast.success('バックアップを作成しました');
        loadBackups();
      } else {
        toast.error('バックアップの作成に失敗しました');
      }
    } catch (error) {
      toast.error('バックアップの作成に失敗しました');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleDeleteBackup = async (fileName: string) => {
    if (!confirm(`バックアップ「${fileName}」を削除しますか？`)) return;

    try {
      const res = await fetch(`/api/backup?file=${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        toast.success('バックアップを削除しました');
        loadBackups();
      } else {
        toast.error('バックアップの削除に失敗しました');
      }
    } catch (error) {
      toast.error('バックアップの削除に失敗しました');
    }
  };

  const handleRestoreBackup = async (fileName: string) => {
    if (!confirm(
      `バックアップ「${fileName}」からデータベースを復元しますか？\n\n` +
      '現在のデータベースは自動的にバックアップされます。\n' +
      '復元後、ページをリロードしてください。'
    )) return;

    try {
      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success('データベースを復元しました。ページをリロードしてください。');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(`復元に失敗しました: ${data.error}`);
      }
    } catch (error) {
      toast.error('復元に失敗しました');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">設定</h1>
      </div>

      <CategoryRulesManager />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            データベース バックアップ
          </CardTitle>
          <CardDescription>
            データベースをバックアップ・復元できます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleCreateBackup}
              disabled={isCreatingBackup}
            >
              <Download className="mr-2 h-4 w-4" />
              {isCreatingBackup ? 'バックアップ中...' : 'バックアップを作成'}
            </Button>
            <Button
              variant="outline"
              onClick={loadBackups}
              disabled={isLoading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              再読込
            </Button>
          </div>

          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ファイル名</TableHead>
                  <TableHead>サイズ</TableHead>
                  <TableHead>作成日時</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {isLoading ? '読み込み中...' : 'バックアップファイルがありません'}
                    </TableCell>
                  </TableRow>
                ) : (
                  backups.map((backup) => (
                    <TableRow key={backup.name}>
                      <TableCell className="font-mono text-sm">
                        {backup.name}
                      </TableCell>
                      <TableCell>{formatFileSize(backup.size)}</TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(backup.date), {
                          addSuffix: true,
                          locale: ja,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestoreBackup(backup.name)}
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            復元
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteBackup(backup.name)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>💡 ヒント:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>バックアップは自動的に毎日午前9時に作成されます</li>
              <li>30日以上前のバックアップは自動的に削除されます</li>
              <li>復元前に現在のデータベースは自動バックアップされます</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
