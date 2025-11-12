import { CheckCircle2, Clock, type LucideIcon, Play, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Show } from '@/schemas/Show';
import { cn } from '@/lib/shadcn';
import { t } from 'i18next';
import { useNavigate } from 'react-router-dom';
import { useShows } from '@/schemas/Root';
import { useState } from 'react';

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
    const [status, setStatus] = useState<ShowStatus>('planned');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!shows || !title.trim()) {
            return;
        }

        const newShow = Show.create({ title: title.trim(), status, seasons: [] });
        shows.$jazz.push(newShow);

        await navigate('/shows');
    };

    if (!shows) {
        return <></>;
    }

    return (
        <div className="max-w-content mx-auto flex flex-col pb-8">
            <h1 className="mb-6 text-2xl font-semibold">{t('home.createShow')}</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">
                        Title
                    </label>
                    <Input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter show title"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">
                        Status
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
                <div className="flex gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => navigate('/shows')}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={!title.trim()}>
                        Create Show
                    </Button>
                </div>
            </form>
        </div>
    );
}
