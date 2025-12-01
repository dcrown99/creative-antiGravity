import { SeriesGroup } from '@/lib/series-utils';
import { Card, CardContent } from '@repo/ui';
import Image from 'next/image';
import { CheckCircle, Layers } from 'lucide-react';
import Link from 'next/link';

interface SeriesCardProps {
    series: SeriesGroup;
}

export function SeriesCard({ series }: SeriesCardProps) {
    const { coverBook, books, title, isSeries } = series;

    // If it's not a series (single book), we shouldn't use this component ideally,
    // but if we do, handle it gracefully.
    if (!isSeries) {
        return null;
    }

    const unreadCount = books.filter(b => b.progress < 100).length;
    const isFinished = unreadCount === 0;
    // const progress = books.reduce((acc, b) => acc + b.progress, 0) / books.length;

    return (
        <Link href={`/series/${encodeURIComponent(title)}`} className="group relative block h-full">
            {/* Stack Effect Layers */}
            <div className="absolute top-0 left-1 right-1 bottom-2 bg-zinc-800 rounded-md border border-zinc-700 transform -translate-y-2 translate-x-1 z-0" />
            <div className="absolute top-1 left-0.5 right-0.5 bottom-1 bg-zinc-850 rounded-md border border-zinc-700 transform -translate-y-1 translate-x-0.5 z-10" />

            <Card className="bg-zinc-900 border-zinc-800 overflow-hidden hover:ring-2 hover:ring-white transition-all duration-200 h-full flex flex-col relative z-20">
                <div className="aspect-[2/3] relative bg-zinc-800">
                    <Image
                        unoptimized
                        src={`/api/manga/thumbnail?book=${encodeURIComponent(coverBook.name)}`}
                        alt={title}
                        fill
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    />

                    {/* Series Badge */}
                    <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded-md text-xs font-bold backdrop-blur-sm flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {books.length}
                    </div>

                    {/* Status Badge */}
                    {isFinished && (
                        <div className="absolute top-2 right-2 bg-black/60 text-green-400 p-1 rounded-full backdrop-blur-sm">
                            <CheckCircle className="w-4 h-4" />
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60" />
                </div>

                <CardContent className="p-3 flex-1 flex flex-col justify-end relative z-10">
                    <h3 className="font-medium text-sm line-clamp-2 leading-tight group-hover:text-white text-zinc-300" title={title}>
                        {title}
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                        {unreadCount > 0 ? `${unreadCount}冊 未読` : '読了'}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}
