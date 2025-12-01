'use client';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { processVideo } from '@/lib/api';
import { Input, Button, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui"
import { Loader2 } from "lucide-react"

export default function UrlInput({ onJobCreated }: { onJobCreated: (jobId: string) => void }) {
    const [url, setUrl] = useState('');

    const mutation = useMutation({
        mutationFn: processVideo,
        onSuccess: (data) => {
            onJobCreated(data.id);
            setUrl('');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url) mutation.mutate(url);
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>新しいクリップを作成</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        placeholder="YouTube URL を入力"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={mutation.isPending}
                    />
                    <Button type="submit" className="w-full" disabled={mutation.isPending}>
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : '動画を分析'}
                    </Button>
                    {mutation.isError && (
                        <Alert variant="destructive">
                            <AlertTitle>エラー ({mutation.error.name})</AlertTitle>
                            <AlertDescription>
                                {mutation.error.message}
                                <br />
                                <span className="text-xs text-gray-500">
                                    Check console for details. API: {process.env.NEXT_PUBLIC_API_URL || 'default'}
                                </span>
                            </AlertDescription>
                        </Alert>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
