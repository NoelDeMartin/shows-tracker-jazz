import Film from '~icons/lucide/film';

import TMDB from '@/lib/TMDB';
import { cn } from '@/lib/shadcn';
import type { Show } from '@/schemas/Show';

export default function ShowImage({
    show,
    className,
    backdrop,
    showTitle,
    ...props
}: {
    show: Show;
    backdrop?: boolean;
    showTitle?: boolean;
    className?: string;
}) {
    const imageUrl = backdrop ? TMDB.showBackdropUrl(show) : TMDB.showPosterUrl(show);

    return (
        <div className={cn('bg-muted flex flex-col items-center justify-center', className)} {...props}>
            {imageUrl ? (
                <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
                <>
                    <Film className="text-muted-foreground size-12 opacity-50" />
                    {showTitle && (
                        <span className="text-muted-foreground mx-2 mt-2 text-center text-lg">{show.title}</span>
                    )}
                </>
            )}
        </div>
    );
}
