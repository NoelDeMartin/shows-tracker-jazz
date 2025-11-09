import { initializeJazz } from '@/lib/jazz';
import { JazzContext, JazzContextManagerContext } from 'jazz-tools/react-core';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';

// Component ejected and adapted from <JazzReactProvider> in core:
// https://github.com/garden-co/jazz/blob/main/packages/jazz-tools/src/react/provider.tsx

export type JazzProviderProps = {
    children: React.ReactNode;
};

export default function JazzProvider({ children }: JazzProviderProps) {
    const [contextManager] = useState(initializeJazz);
    const value = useSyncExternalStore(
        useCallback((callback) => contextManager.subscribe(callback), []),
        () => contextManager.getCurrentValue(),
        () => contextManager.getCurrentValue(),
    );

    useEffect(() => {
        // In development mode we don't return a cleanup function because otherwise
        // the double effect execution would mark the context as done immediately.
        if (import.meta.env.DEV) return;

        return () => contextManager.done();
    }, []);

    return (
        <JazzContext.Provider value={value}>
            <JazzContextManagerContext.Provider value={contextManager}>
                {value ? children : <></>}
            </JazzContextManagerContext.Provider>
        </JazzContext.Provider>
    );
}
