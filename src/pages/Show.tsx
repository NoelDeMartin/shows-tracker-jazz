import { useParams } from 'react-router-dom';
import { t } from 'i18next';
import { useCoState } from 'jazz-tools/react-core';

import { Show as CoShow } from '@/schemas/Show';

export function ShowNotFound() {
    return (
        <div className="max-w-content mx-auto">
            <h1>{t('show.notFound')}</h1>
        </div>
    );
}

export default function Show() {
    const { id } = useParams();
    const show = useCoState(CoShow, id, { resolve: true });

    if (!show.$isLoaded) {
        return <ShowNotFound />;
    }

    return (
        <div className="max-w-content mx-auto">
            <h1>{show.title}</h1>
        </div>
    );
}
