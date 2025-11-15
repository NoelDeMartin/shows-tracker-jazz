import { t } from 'i18next';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { EpisodeForm } from './EpisodeForm';
import type { EpisodeFormData } from './EpisodeForm';

interface SeasonFormData {
    episodes: EpisodeFormData[];
}

interface SeasonFormProps {
    season: SeasonFormData;
    seasonIndex: number;
    onAddEpisode: () => void;
    onRemoveSeason: () => void;
    onUpdateEpisode: (episodeIndex: number, field: keyof EpisodeFormData, value: string) => void;
    onRemoveEpisode: (episodeIndex: number) => void;
    canRemove: boolean;
}

export function SeasonForm({
    season,
    seasonIndex,
    onAddEpisode,
    onRemoveSeason,
    onUpdateEpisode,
    onRemoveEpisode,
    canRemove,
}: SeasonFormProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{t('seasons.label', { number: seasonIndex + 1 })}</CardTitle>
                    <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={onAddEpisode}>
                            <Plus className="mr-2 size-4" />
                            {t('episodes.add')}
                        </Button>
                        {canRemove && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={onRemoveSeason}
                                aria-label={t('seasons.remove', { seasonNumber: seasonIndex + 1 })}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {season.episodes.length === 0 ? (
                    <p className="text-muted-foreground text-sm">{t('seasons.empty')}</p>
                ) : (
                    season.episodes.map((episode, episodeIndex) => (
                        <EpisodeForm
                            key={episodeIndex}
                            episode={episode}
                            episodeIndex={episodeIndex}
                            seasonIndex={seasonIndex}
                            onUpdate={(field, value) => onUpdateEpisode(episodeIndex, field, value)}
                            onRemove={() => onRemoveEpisode(episodeIndex)}
                        />
                    ))
                )}
            </CardContent>
        </Card>
    );
}

export type { SeasonFormData };
