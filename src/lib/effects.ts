import { useEffect } from 'react';
import type { DependencyList } from 'react';

export interface EffectContext {
    isMounted: boolean;
}

export function useAsyncEffect(effect: (context: EffectContext) => Promise<unknown>, deps?: DependencyList) {
    useEffect(() => {
        const context: EffectContext = {
            isMounted: true,
        };

        // oxlint-disable-next-line no-floating-promises
        effect(context);

        return () => {
            context.isMounted = false;
        };
    }, deps);
}
