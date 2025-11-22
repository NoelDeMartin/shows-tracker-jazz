import CheckCircle2 from '~icons/lucide/check-circle-2';
import ChevronDown from '~icons/lucide/chevron-down';
import Clock from '~icons/lucide/clock';
import Film from '~icons/lucide/film';
import Play from '~icons/lucide/play';
import XCircle from '~icons/lucide/x-circle';
import { t } from 'i18next';
import { useCoState } from 'jazz-tools/react-core';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import type { ComponentType } from 'react';

import TMDB from '@/lib/TMDB';
import { Button } from '@/components/shadcn/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn/card';
import { cn } from '@/lib/shadcn';
import { Show as CoShow } from '@/schemas/Show';

type ShowStatus = 'planned' | 'watching' | 'completed' | 'dropped';

const statusIcons: Record<ShowStatus, ComponentType<React.SVGProps<SVGSVGElement>>> = {
    planned: Clock,
    watching: Play,
    completed: CheckCircle2,
    dropped: XCircle,
};

const statusColors: Record<ShowStatus, string> = {
    planned: 'text-blue-500',
    watching: 'text-green-500',
    completed: 'text-purple-500',
    dropped: 'text-red-500',
};

const statusBgColors: Record<ShowStatus, string> = {
    planned: 'bg-blue-500/10',
    watching: 'bg-green-500/10',
    completed: 'bg-purple-500/10',
    dropped: 'bg-red-500/10',
};

export function ShowNotFound() {
    return (
        <div className="max-w-content mx-auto">
            <h1>{t('show.notFound')}</h1>
        </div>
    );
}

function formatDate(date: Date | undefined): string | undefined {
    if (!date) {
        return undefined;
    }

    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
}

export default function Show() {
    const { id } = useParams();
    const show = useCoState(CoShow, id, { resolve: { seasons: { $each: { episodes: { $each: true } } } } });
    const [expandedSeasons, setExpandedSeasons] = useState<Set<string>>(new Set());

    if (!show.$isLoaded) {
        return <ShowNotFound />;
    }

    const StatusIcon = statusIcons[show.status];
    const statusColor = statusColors[show.status];
    const statusBgColor = statusBgColors[show.status];
    const posterUrl = TMDB.showImageUrl({ poster_path: show.posterPath }, 'w500');
    const startYear = show.startDate ? new Date(show.startDate).getFullYear() : undefined;
    const endYear = show.endDate ? new Date(show.endDate).getFullYear() : undefined;

    const toggleSeason = (seasonId: string) => {
        setExpandedSeasons((prev) => {
            const next = new Set(prev);
            if (next.has(seasonId)) {
                next.delete(seasonId);
            } else {
                next.add(seasonId);
            }
            return next;
        });
    };

    return (
        <div className="max-w-content mx-auto pb-8">
            {/* Header Section with Poster */}
            <div className="mb-6 flex flex-col gap-6 sm:flex-row">
                <div className="bg-muted relative h-64 w-full shrink-0 overflow-hidden rounded-lg sm:h-96 sm:w-64">
                    {posterUrl ? (
                        <img src={posterUrl} alt={show.title} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <Film className="text-muted-foreground size-16 opacity-50" />
                        </div>
                    )}
                </div>

                <div className="flex flex-1 flex-col gap-4">
                    <div>
                        <h1 className="mb-2 text-3xl font-bold">{show.title}</h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            {startYear && (
                                <>
                                    <span className="text-muted-foreground">{startYear}</span>
                                    {endYear && endYear !== startYear && (
                                        <>
                                            <span className="text-muted-foreground">•</span>
                                            <span className="text-muted-foreground">{endYear}</span>
                                        </>
                                    )}
                                </>
                            )}
                            {show.startDate && (
                                <>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-muted-foreground">{formatDate(show.startDate)}</span>
                                </>
                            )}
                            {show.endDate && (
                                <>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-muted-foreground">{formatDate(show.endDate)}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {show.description && (
                        <p className="text-muted-foreground text-base leading-relaxed">{show.description}</p>
                    )}

                    <div className="mt-auto">
                        <div
                            className={cn(
                                'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium',
                                statusBgColor,
                                statusColor,
                            )}
                        >
                            <StatusIcon className="size-4" />
                            <span>{t(`shows.status.${show.status}`)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seasons Section */}
            {show.seasons.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold">
                        {t('seasons.titleWithCount', { count: show.seasons.length })}
                    </h2>
                    {show.seasons.map((season) => {
                        const seasonId = season.$jazz.id;
                        const isExpanded = expandedSeasons.has(seasonId);
                        const episodeCount = season.episodes.length;

                        return (
                            <Card key={seasonId}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2">
                                            {t('seasons.label', { number: season.number })}
                                            {episodeCount > 0 && (
                                                <span className="text-muted-foreground text-sm font-normal">
                                                    ({episodeCount} {episodeCount === 1 ? 'episode' : 'episodes'})
                                                </span>
                                            )}
                                        </CardTitle>
                                        {episodeCount > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => toggleSeason(seasonId)}
                                                aria-label={isExpanded ? 'Collapse season' : 'Expand season'}
                                            >
                                                <ChevronDown
                                                    className={cn('size-5 transition-transform', {
                                                        'rotate-180': isExpanded,
                                                    })}
                                                />
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                {isExpanded && (
                                    <CardContent>
                                        {season.episodes.length === 0 ? (
                                            <p className="text-muted-foreground text-sm">{t('seasons.empty')}</p>
                                        ) : (
                                            <div className="space-y-3">
                                                {season.episodes.map((episode) => (
                                                    <div
                                                        key={episode.$jazz.id}
                                                        className="border-muted rounded-lg border p-4"
                                                    >
                                                        <div className="mb-2 flex items-start justify-between gap-4">
                                                            <div className="flex-1">
                                                                <h3 className="font-medium">
                                                                    {t('episodes.label', { number: episode.number })}:{' '}
                                                                    {episode.title}
                                                                </h3>
                                                                {episode.description && (
                                                                    <p className="text-muted-foreground mt-1 text-sm">
                                                                        {episode.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
                                                            {episode.releasedAt && (
                                                                <span>{formatDate(episode.releasedAt)}</span>
                                                            )}
                                                            {episode.duration && (
                                                                <>
                                                                    {episode.releasedAt && <span>•</span>}
                                                                    <span>{episode.duration} min</span>
                                                                </>
                                                            )}
                                                            {episode.watchedAt && (
                                                                <>
                                                                    {(episode.releasedAt || episode.duration) && (
                                                                        <span>•</span>
                                                                    )}
                                                                    <span className="text-green-600">Watched</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
