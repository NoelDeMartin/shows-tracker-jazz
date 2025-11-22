import Trash2 from '~icons/lucide/trash-2';
import { t } from 'i18next';

import { Button } from '@/components/shadcn/button';
import { Card, CardContent } from '@/components/shadcn/card';
import { Input } from '@/components/shadcn/input';
import { Textarea } from '@/components/shadcn/textarea';

interface EpisodeFormData {
    title: string;
    description: string;
    releasedAt: string;
}

interface EpisodeFormProps {
    episode: EpisodeFormData;
    episodeIndex: number;
    seasonIndex: number;
    onUpdate: (field: keyof EpisodeFormData, value: string) => void;
    onRemove: () => void;
}

export function EpisodeForm({ episode, episodeIndex, seasonIndex, onUpdate, onRemove }: EpisodeFormProps) {
    return (
        <Card className="bg-muted/50">
            <CardContent className="space-y-4 pt-6">
                <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-medium">{t('episodes.label', { number: episodeIndex + 1 })}</h3>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onRemove}
                        aria-label={t('episodes.remove', {
                            seasonNumber: seasonIndex + 1,
                            episodeNumber: episodeIndex + 1,
                        })}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">{t('forms.title')}</label>
                    <Input
                        value={episode.title}
                        onChange={(e) => onUpdate('title', e.target.value)}
                        placeholder={t('forms.episodeTitlePlaceholder')}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">{t('forms.description')}</label>
                    <Textarea
                        value={episode.description}
                        onChange={(e) => onUpdate('description', e.target.value)}
                        placeholder={t('forms.episodeDescriptionPlaceholder')}
                        rows={3}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">{t('forms.releaseDate')}</label>
                    <Input
                        type="date"
                        value={episode.releasedAt}
                        onChange={(e) => onUpdate('releasedAt', e.target.value)}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

export type { EpisodeFormData };
