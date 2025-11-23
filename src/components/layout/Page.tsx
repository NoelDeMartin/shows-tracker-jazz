import type { PropsWithChildren } from 'react';

interface PageProps {
    title: string;
    actions?: React.ReactNode;
}

export default function Page({ children, actions, title }: PropsWithChildren<PageProps>) {
    return (
        <div className="mt-8 overflow-x-hidden pb-8">
            <div className="max-w-content mx-auto mb-6 flex items-center gap-1">
                <h1 className="-mt-0.75 text-2xl font-medium">{title}</h1>
                {actions}
            </div>
            <div className="max-w-content mx-auto">{children}</div>
        </div>
    );
}
