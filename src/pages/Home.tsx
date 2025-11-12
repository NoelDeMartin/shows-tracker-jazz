import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { t } from 'i18next';
import { useMemo } from 'react';
import { useShows } from '@/schemas/Root';

export default function Home() {
    const shows = useShows();
    const activeShows = useMemo(() => shows?.filter((show) => show.status === 'watching'), [shows]);

    if (!activeShows) {
        return <></>;
    }

    return (
        <div className="max-w-content mx-auto flex flex-col pb-8">
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {activeShows.map((show) => (
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
            <Button asChild variant="ghost" className="mt-2 self-end">
                <Link to="/shows">{t('home.viewAllShows')}</Link>
            </Button>
        </div>
    );
}
