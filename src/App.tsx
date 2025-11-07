import { useCallback } from 'react';
import { useAccount } from 'jazz-tools/react';
import { Account } from './schema/Account';
import { Show } from './schema/Show';

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
        <div className="flex h-screen flex-col items-center justify-center">
            <h1 className="text-4xl font-bold">Shows Tracker</h1>
            {me.root.shows.length === 0 ? (
                <p className="mt-2 flex min-w-2xl items-center justify-center rounded-md bg-gray-100 p-2">
                    No shows yet
                </p>
            ) : (
                <ul className="mt-2 flex min-w-2xl flex-col gap-2">
                    {me.root.shows.map((show) => (
                        <li
                            key={show.$jazz.id}
                            className="flex w-full items-center justify-center rounded-md border border-gray-200 p-2 shadow-xs"
                        >
                            {show.title}
                        </li>
                    ))}
                </ul>
            )}
            <button
                type="button"
                className="mt-2 min-w-2xl rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                onClick={createShow}
            >
                Add Show
            </button>
        </div>
    );
}

export default App;
