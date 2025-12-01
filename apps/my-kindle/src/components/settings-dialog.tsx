'use client';

import { useState, useEffect } from 'react';
import { Button } from '@repo/ui';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from '@repo/ui';
import { Input } from '@repo/ui';
import { Label } from '@repo/ui';
import { useRouter } from 'next/navigation';

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
);

export function SettingsDialog() {
    const [open, setOpen] = useState(false);
    const [path, setPath] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (open) {
            setLoading(true);
            fetch('/api/settings')
                .then(async (res) => {
                    if (!res.ok) {
                        const text = await res.text();
                        console.error('API Error:', res.status, text);
                        throw new Error(`Server returned ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    setPath(data.libraryPath || '');
                })
                .catch(err => {
                    console.error('Failed to load settings:', err);
                    alert('設定の読み込みに失敗しました。サーバーログを確認してください。');
                })
                .finally(() => setLoading(false));
        }
    }, [open]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ libraryPath: path }),
            });

            if (res.ok) {
                setOpen(false);
                router.refresh();
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error('Save failed:', errorData);
                alert(`保存に失敗しました: ${errorData.error || '不明なエラー'}`);
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            alert('通信エラーが発生しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <SettingsIcon />
                    <span className="sr-only">設定</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-white border-zinc-800">
                <DialogHeader>
                    <DialogTitle>設定</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        アプリ全体の基本設定を変更します。
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="path" className="text-left">
                            マンガフォルダの場所
                        </Label>
                        <Input
                            id="path"
                            value={path}
                            onChange={(e) => setPath(e.target.value)}
                            className="col-span-3 bg-zinc-800 border-zinc-700 focus-visible:ring-zinc-600"
                            placeholder="H:\DL\MangaDownloads"
                        />
                        <p className="text-xs text-zinc-500">
                            ※サーバー上の絶対パスを指定してください。
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        type="submit"
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-white text-black hover:bg-gray-200"
                    >
                        {loading ? '保存中...' : '保存'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
