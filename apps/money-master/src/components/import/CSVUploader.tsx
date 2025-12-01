'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from "@repo/ui";
import { Upload, FileText } from 'lucide-react';
import { toast } from "sonner";

import { detectFormat } from '@/lib/csv-parsers';

interface CSVUploaderProps {
    onFileLoaded: (content: string, filename: string) => void;
}

export function CSVUploader({ onFileLoaded }: CSVUploaderProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        const readFile = (encoding: string): Promise<string> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(reader.error);
                reader.readAsText(file, encoding);
            });
        };

        const processFile = async () => {
            try {
                // Try UTF-8 first
                let content = await readFile('UTF-8');
                let format = detectFormat(content);

                if (format === 'unknown') {
                    // Try Shift-JIS if UTF-8 failed to detect format
                    console.log('UTF-8 detection failed, trying Shift-JIS...');
                    const contentShiftJIS = await readFile('Shift_JIS');
                    const formatShiftJIS = detectFormat(contentShiftJIS);

                    if (formatShiftJIS !== 'unknown') {
                        content = contentShiftJIS;
                        format = formatShiftJIS;
                        console.log('Detected Shift-JIS format:', format);
                    } else {
                        // Both failed
                        const firstLine = contentShiftJIS.split('\n')[0]?.trim();
                        console.error('Unknown format. Header:', firstLine);
                        toast.error("フォーマットが不明です", {
                            description: `ヘッダー: ${firstLine?.substring(0, 50)}...`,
                        });
                    }
                }

                onFileLoaded(content, file.name);
            } catch (error) {
                console.error('Error reading file:', error);
                toast.error("ファイルの読み込みに失敗しました");
            }
        };

        processFile();
    }, [onFileLoaded]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.csv'],
        },
        multiple: false,
    });

    return (
        <Card className="cursor-pointer border-dashed hover:bg-muted/50 transition-colors" {...getRootProps()}>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <input {...getInputProps()} />
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                    <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-1">
                    {isDragActive ? "ドロップしてアップロード" : "CSVファイルをアップロード"}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    クリックまたはドラッグ＆ドロップでファイルを選択してください
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    <FileText className="h-3 w-3" />
                    <span>対応: 楽天証券, SBI証券</span>
                </div>
            </CardContent>
        </Card>
    );
}
