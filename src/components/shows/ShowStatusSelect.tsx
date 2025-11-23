import { t } from 'i18next';
import { useMemo } from 'react';

import { cn } from '@/lib/shadcn';
import { getStatusVars, showStatuses, type ShowStatus } from '@/schemas/Show';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/select';

export default function ShowStatusSelect({
    value,
    onValueChange,
}: {
    value: ShowStatus | 'all';
    onValueChange: (value: ShowStatus | 'all') => void;
}) {
    const options = useMemo(() => showStatuses.map((status) => getStatusVars(status)), []);
    const textClass = useMemo(
        () => (value === 'all' ? 'text-muted-foreground' : getStatusVars(value).textClass),
        [value],
    );

    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className={cn('w-auto', textClass)}>
                <div className="flex items-center gap-2">
                    <SelectValue />
                </div>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">
                    <div className="text-muted-foreground flex items-center gap-2">
                        <span>{t('shows.status.all')}</span>
                    </div>
                </SelectItem>

                {options.map(({ name, textClass, Icon }) => (
                    <SelectItem key={name} value={name}>
                        <div className={cn('flex items-center gap-2', textClass)}>
                            <Icon className={cn('size-4', textClass)} />
                            <span>{t(`shows.status.${name}`)}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
