import type { PropsWithChildren } from 'react';

interface PageProps {
    title: string;
    actions?: React.ReactNode;
}

export default function Page({ children, actions, title }: PropsWithChildren<PageProps>) {
    return (
        <div className="max-w-content mx-auto pb-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-3xl font-bold">{title}</h1>
                {actions}
            </div>
            {children}
        </div>
    );
}
