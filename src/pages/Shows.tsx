import { Link } from 'react-router-dom';
import { t } from 'i18next';
import { CheckCircle2, Clock, type LucideIcon, Play, Trash2, XCircle } from 'lucide-react';
import { useCoState } from 'jazz-tools/react-core';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/shadcn';
import { useShows } from '@/schemas/Root';
import { Show } from '@/schemas/Show';

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

function ShowCard({ showId, title, onDelete }: { showId: string; title: string; onDelete: () => void }) {
    const coShow = useCoState(Show, showId);

    if (!coShow.$isLoaded) {
        return;
    }

    const StatusIcon = statusIcons[coShow.status];
    const statusColor = statusColors[coShow.status];

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <StatusIcon className={cn('size-5', statusColor)} />
                    <CardTitle className="flex-1">{title}</CardTitle>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onDelete}
                        className="ml-auto"
                        aria-label={t('show.delete', { title })}
                    >
                        <Trash2 className="text-destructive size-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Select
                    value={coShow.status}
                    onValueChange={(value) => {
                        coShow.$jazz.set('status', value as ShowStatus);
                    }}
                >
                    <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                            <SelectValue />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        {Object.entries(statusIcons).map(([status, Icon]) => (
                            <SelectItem key={status} value={status}>
                                <div className="flex items-center gap-2">
                                    <Icon className={cn('size-4', statusColors[status as ShowStatus])} />
                                    <span>{t(`shows.status.${status}`)}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
            <CardFooter>
                <Button className="w-full" asChild>
                    <Link to={`/shows/${showId}`}>{t('home.open')}</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function Shows() {
    const shows = useShows();

    if (!shows) {
        return <></>;
    }

    return (
        <div className="max-w-content mx-auto flex flex-col pb-8">
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {shows.map((show) => (
                    <li key={show.$jazz.id}>
                        <ShowCard
                            showId={show.$jazz.id}
                            title={show.title}
                            onDelete={() => {
                                const index = shows.findIndex((s) => s.$jazz.id === show.$jazz.id);
                                if (index !== -1) {
                                    shows.$jazz.splice(index, 1);
                                }
                            }}
                        />
                    </li>
                ))}
            </ul>
            <Button asChild className="mt-8">
                <Link to="/shows/create">{t('home.createShow')}</Link>
            </Button>
        </div>
    );
}
