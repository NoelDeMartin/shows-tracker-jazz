import type { PropsWithChildren } from 'react';

interface PageProps {
    title?: string;
    beforeTitle?: React.ReactNode;
    afterTitle?: React.ReactNode;
    actions?: React.ReactNode;
}

export default function Page({ children, beforeTitle, afterTitle, actions, title }: PropsWithChildren<PageProps>) {
    return (
        <div className="mt-8 overflow-x-hidden pb-8">
            {title && (
                <div className="max-w-content mx-auto mb-6 flex items-center gap-1">
                    {beforeTitle}
                    <h1 className="-mt-0.75 text-2xl font-medium">{title}</h1>
                    {afterTitle}
                    <div className="flex-1"></div>
                    {actions}
                </div>
            )}
            <div className="max-w-content mx-auto">{children}</div>
        </div>
    );
}
