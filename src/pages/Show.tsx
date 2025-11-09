import { NotFound } from '@/lib/errors/NotFound';
import { getLoadedAccount } from '@/lib/jazz';
import { useLoaderData, useRouteError, type LoaderFunctionArgs } from 'react-router-dom';

export async function loadShow({ params }: LoaderFunctionArgs) {
    const shows = await getLoadedAccount({ root: { shows: { $each: true } } });
    const show = shows.root.shows.find((show) => show.$jazz.id === params.id);

    if (!show) {
        throw new NotFound();
    }

    return { show };
}

export function ShowNotFound() {
    const error = useRouteError();

    return (
        <div className="max-w-content mx-auto">
            <h1>{error instanceof NotFound ? '404: Show Not Found' : 'Unknown error'}</h1>
        </div>
    );
}

export default function Show() {
    const { show } = useLoaderData<Awaited<ReturnType<typeof loadShow>>>();

    return (
        <div className="max-w-content mx-auto">
            <h1>{show.title}</h1>
        </div>
    );
}
