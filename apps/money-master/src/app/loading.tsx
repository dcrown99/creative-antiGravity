import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center min-h-[60vh] space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary/60" />
            <p className="text-sm text-muted-foreground animate-pulse">データを読み込んでいます...</p>
        </div>
    );
}
