import { t } from 'i18next';
import { CheckCircle2, Clock, Play, Plus, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

import { SeasonForm } from '@/components/forms/SeasonForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/shadcn';
import { Episode } from '@/schemas/Episode';
import { Season } from '@/schemas/Season';
import { Show } from '@/schemas/Show';
import { useShows } from '@/schemas/Root';
import type { EpisodeFormData } from '@/components/forms/EpisodeForm';
import type { SeasonFormData } from '@/components/forms/SeasonForm';

type ShowStatus = 'planned' | 'watching' | 'completed' | 'dropped';

const statusIcons: Record<ShowStatus, LucideIcon> = {
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

export default function ShowsCreate() {
    const navigate = useNavigate();
    const shows = useShows();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<ShowStatus>('planned');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [seasonIds, setSeasonIds] = useState<number[]>([0]);
    const [seasons, setSeasons] = useState<SeasonFormData[]>([{ episodes: [] }]);

    const addSeason = () => {
        const newId = Math.max(...seasonIds, -1) + 1;
        setSeasonIds([...seasonIds, newId]);
        setSeasons([...seasons, { episodes: [] }]);
    };

    const removeSeason = (seasonIndex: number) => {
        setSeasonIds(seasonIds.filter((_, i) => i !== seasonIndex));
        setSeasons(seasons.filter((_, i) => i !== seasonIndex));
    };

    const addEpisode = (seasonIndex: number) => {
        const updatedSeasons = [...seasons];
        updatedSeasons[seasonIndex].episodes.push({ title: '', description: '', releasedAt: '' });
        setSeasons(updatedSeasons);
    };

    const removeEpisode = (seasonIndex: number, episodeIndex: number) => {
        const updatedSeasons = [...seasons];
        updatedSeasons[seasonIndex].episodes = updatedSeasons[seasonIndex].episodes.filter(
            (_, i) => i !== episodeIndex,
        );
        setSeasons(updatedSeasons);
    };

    const updateEpisode = (params: {
        seasonIndex: number;
        episodeIndex: number;
        field: keyof EpisodeFormData;
        value: string;
    }) => {
        const { seasonIndex, episodeIndex, field, value } = params;
        const updatedSeasons = [...seasons];
        updatedSeasons[seasonIndex].episodes[episodeIndex][field] = value;
        setSeasons(updatedSeasons);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!shows || !title.trim()) {
            return;
        }

        // Convert form data to Jazz schema format
        const jazzSeasons = seasons.map((season, seasonIndex) => {
            const episodes = season.episodes
                .filter((ep) => ep.title.trim()) // Only include episodes with titles
                .map((ep, episodeIndex) =>
                    Episode.create({
                        title: ep.title.trim(),
                        number: episodeIndex + 1,
                        description: ep.description.trim() || undefined,
                        releasedAt: ep.releasedAt ? new Date(ep.releasedAt) : undefined,
                        watchedAt: undefined,
                    }),
                );
            return Season.create({ number: seasonIndex + 1, episodes });
        });

        const newShow = Show.create({
            title: title.trim(),
            description: description.trim() || undefined,
            status,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            seasons: jazzSeasons,
        });
        shows.$jazz.push(newShow);

        await navigate('/shows');
    };

    if (!shows) {
        return <></>;
    }

    return (
        <div className="max-w-content mx-auto flex flex-col pb-8">
            <h1 className="mb-6 text-2xl font-semibold">{t('home.createShow')}</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                        {t('forms.title')}
                    </label>
                    <Input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t('forms.titlePlaceholder')}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">
                        {t('forms.description')}
                    </label>
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t('forms.descriptionPlaceholder')}
                        rows={4}
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <label htmlFor="startDate" className="text-sm font-medium">
                            {t('forms.startDate')}
                        </label>
                        <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="endDate" className="text-sm font-medium">
                            {t('forms.endDate')}
                        </label>
                        <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                </div>

                <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">
                        {t('forms.status')}
                    </label>
                    <Select value={status} onValueChange={(value) => setStatus(value as ShowStatus)}>
                        <SelectTrigger id="status">
                            <div className="flex items-center gap-2">
                                {status && (
                                    <>
                                        <SelectValue />
                                    </>
                                )}
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(statusIcons).map(([statusValue, Icon]) => (
                                <SelectItem key={statusValue} value={statusValue}>
                                    <div className="flex items-center gap-2">
                                        <Icon className={cn('size-4', statusColors[statusValue as ShowStatus])} />
                                        <span>{t(`shows.status.${statusValue}`)}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">{t('seasons.title')}</h2>
                        <Button type="button" variant="outline" size="sm" onClick={addSeason}>
                            <Plus className="mr-2 size-4" />
                            {t('seasons.add')}
                        </Button>
                    </div>

                    {seasons.map((season, seasonIndex) => (
                        <SeasonForm
                            key={seasonIndex}
                            season={season}
                            seasonIndex={seasonIndex}
                            onAddEpisode={() => addEpisode(seasonIndex)}
                            onRemoveSeason={() => removeSeason(seasonIndex)}
                            onUpdateEpisode={(episodeIndex, field, value) =>
                                updateEpisode({ seasonIndex, episodeIndex, field, value })
                            }
                            onRemoveEpisode={(episodeIndex) => removeEpisode(seasonIndex, episodeIndex)}
                            canRemove={seasons.length > 1}
                        />
                    ))}
                </div>

                <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/shows')}>
                        {t('forms.cancel')}
                    </Button>
                    <Button type="submit" disabled={!title.trim()}>
                        {t('forms.createShow')}
                    </Button>
                </div>
            </form>
        </div>
    );
}
