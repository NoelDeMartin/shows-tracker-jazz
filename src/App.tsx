import { useCallback } from 'react';
import { useAccount } from 'jazz-tools/react';
import { Account } from './schema/Account';
import { Show } from './schema/Show';
import { Button } from '@/components/ui/button';
import { Item, ItemContent, ItemTitle } from '@/components/ui/item';

function App() {
    const me = useAccount(Account, {
        resolve: { root: { shows: { $each: true } } },
    });

    const createShow = useCallback(async () => {
        if (!me.$isLoaded || !me.root.shows.$isLoaded) {
            alert('Shows are not loaded yet');

            return;
        }

        const show = Show.create({ title: 'Sample Show' });

        me.root.shows.$jazz.push(show);
    }, [me]);

    if (!me.$isLoaded) {
        return <div className="fixed inset-0 flex items-center justify-center text-4xl font-bold">Loading...</div>;
    }

    return (
        <div className="m-auto flex h-screen max-w-2xl flex-col items-center justify-center">
            <h1 className="text-4xl font-bold">Shows Tracker</h1>
            {me.root.shows.length === 0 ? (
                <p className="mt-4 flex w-full items-center justify-center rounded-md bg-gray-100 p-2">No shows yet</p>
            ) : (
                <ul className="mt-4 flex w-full flex-col gap-2">
                    {me.root.shows.map((show) => (
                        <Item key={show.$jazz.id} variant="outline" size="sm" asChild>
                            <li>
                                <ItemContent>
                                    <ItemTitle>{show.title}</ItemTitle>
                                </ItemContent>
                            </li>
                        </Item>
                    ))}
                </ul>
            )}
            <Button onClick={createShow} className="mt-4 w-full">
                Add Show
            </Button>
        </div>
    );
}

export default App;
