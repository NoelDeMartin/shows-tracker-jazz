import { t } from 'i18next';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useShows } from '@/schemas/Root';
import { Show } from '@/schemas/Show';

export default function Home() {
    const shows = useShows();
    const createShow = useCallback(async () => {
        if (!shows) {
            return;
        }

        shows.$jazz.push(Show.create({ title: 'Sample Show' }));
    }, [shows]);

    if (!shows) {
        return <></>;
    }

    return (
        <div className="max-w-content mx-auto flex flex-col">
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {shows.map((show) => (
                    <li key={show.$jazz.id}>
                        <Card>
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
                ))}
            </ul>
            <Button onClick={createShow} className="mt-8">
                {t('home.createShow')}
            </Button>
            <Button asChild variant="ghost" className="mt-2 self-end">
                <Link to="/shows">{t('home.viewAllShows')}</Link>
            </Button>
        </div>
    );
}
