import { t } from 'i18next';
import { Film, RefreshCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import Catalog from '@/lib/Catalog';
import TMDB from '@/lib/TMDB';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useShows } from '@/schemas/Root';
import { after } from '@noeldemartin/utils';

export default function Home() {
    const shows = useShows();
    const activeShows = useMemo(() => shows?.filter((show) => show.status === 'watching'), [shows]);
    const [isUpdating, setIsUpdating] = useState(false);

    if (!activeShows) {
        return <></>;
    }

    const handleUpdate = async () => {
        setIsUpdating(true);

        try {
            await Promise.all([Catalog.updateShows(), after({ seconds: 1 })]);
            toast.success(t('home.updateSuccess'));
        } catch {
            toast.error(t('home.updateError'));
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="max-w-content mx-auto flex flex-col pb-8">
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {activeShows.map((show) => {
                    const posterUrl = TMDB.showImageUrl({ poster_path: show.posterPath }, 'w500');

                    return (
                        <li key={show.$jazz.id}>
                            <Card>
                                <div className="bg-muted relative flex h-48 w-full items-center justify-center overflow-hidden rounded-t-lg">
                                    {posterUrl ? (
                                        <img src={posterUrl} alt={show.title} className="h-full w-full object-cover" />
                                    ) : (
                                        <Film className="text-muted-foreground size-12 opacity-50" />
                                    )}
                                </div>
                                <CardHeader>
                                    <CardTitle>{show.title}</CardTitle>
                                </CardHeader>
                                <CardFooter>
                                    <Button className="w-full" asChild>
                                        <Link to={`/shows/${show.$jazz.id}`}>{t('home.open')}</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </li>
                    );
                })}
            </ul>

            <div className="mt-4 flex justify-between">
                <Button variant="outline" onClick={handleUpdate} disabled={isUpdating}>
                    <RefreshCcw className={`size-4 ${isUpdating ? 'animate-spin' : ''}`} />
                    {t('home.update')}
                </Button>
                <Button asChild variant="ghost">
                    <Link to="/shows">{t('home.viewAllShows')}</Link>
                </Button>
            </div>
        </div>
    );
}
