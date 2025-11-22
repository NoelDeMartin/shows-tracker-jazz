import TMDB from '@/lib/TMDB';
import Film from '~icons/lucide/film';
import type { Show } from '@/schemas/Show';
import { cn } from '@/lib/shadcn';

export default function ShowImage({ show, className, ...props }: { show: Show; className?: string }) {
    const posterUrl = TMDB.showBackdropUrl(show);

    return (
        <div className={cn('bg-muted flex items-center justify-center', className)} {...props}>
            {posterUrl ? (
                <img src={posterUrl} alt="" className="h-full w-full object-cover" />
            ) : (
                <Film className="text-muted-foreground size-12 opacity-50" />
            )}
        </div>
    );
}
