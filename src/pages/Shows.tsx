import Grid from '~icons/lucide/grid';
import List from '~icons/lucide/list';
import MoreVertical from '~icons/lucide/more-vertical';
import Search from '~icons/lucide/search';
import X from '~icons/lucide/x';
import { Link } from 'react-router-dom';
import { stringToSlug } from '@noeldemartin/utils';
import { t } from 'i18next';
import { useMemo, useRef, useState, useEffect } from 'react';

import Page from '@/components/layout/Page';
import ShowImage from '@/components/shows/ShowImage';
import ShowStatusSelect from '@/components/shows/ShowStatusSelect';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/shadcn/dropdown-menu';
import { Button } from '@/components/shadcn/button';
import { cn } from '@/lib/shadcn';
import { getStatusVars, showStatuses } from '@/schemas/Show';
import { Input } from '@/components/shadcn/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shadcn/select';
import { useShows } from '@/schemas/Root';
import type { Show, ShowStatus } from '@/schemas/Show';

function ShowStatusBadge({ show, className }: { show: Show; className?: string }) {
    const { backgroundClass, Icon } = useMemo(() => getStatusVars(show.status), [show]);

    return (
        <div
            className={cn(
                'flex size-10 items-center justify-center rounded-full text-white',
                backgroundClass,
                className,
            )}
            aria-label={show.status}
        >
            <Icon className="size-6" />
        </div>
    );
}

function ShowCard({
    show,
    view,
    bulkEdit,
    selected,
    onToggleSelect,
}: {
    show: Show;
    view: 'grid' | 'list';
    bulkEdit?: boolean;
    selected?: boolean;
    onToggleSelect?: () => void;
}) {
    if (view === 'list') {
        const { backgroundClass, Icon: StatusIcon } = useMemo(() => getStatusVars(show.status), [show]);
        const content = (
            <div className="hover:bg-accent flex items-center gap-3 border-b border-white/10 px-4 py-2 transition-colors">
                {bulkEdit && (
                    <input
                        type="checkbox"
                        checked={selected || false}
                        onChange={(e) => {
                            e.stopPropagation();
                            onToggleSelect?.();
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="size-4 shrink-0 cursor-pointer rounded border-gray-300"
                    />
                )}
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-medium">{show.title}</h3>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <div
                        className={cn(
                            'flex size-6 items-center justify-center rounded-full text-white',
                            backgroundClass,
                        )}
                        aria-label={show.status}
                    >
                        <StatusIcon className="size-3.5" />
                    </div>
                    <span className="text-muted-foreground w-20 text-right text-xs">
                        {t(`shows.status.${show.status}`)}
                    </span>
                </div>
            </div>
        );

        if (bulkEdit) {
            return (
                <div
                    onClick={onToggleSelect}
                    className="cursor-pointer"
                    aria-label={`${show.title} (${t(`shows.status.${show.status}`)})`}
                >
                    {content}
                </div>
            );
        }

        return (
            <Link to={`/shows/${show.$jazz.id}`} aria-label={`${show.title} (${t(`shows.status.${show.status}`)})`}>
                {content}
            </Link>
        );
    }

    return (
        <Link
            to={`/shows/${show.$jazz.id}`}
            className="relative block"
            aria-label={`${show.title} (${t(`shows.status.${show.status}`)})`}
        >
            <ShowImage show={show} className="aspect-2/3" showTitle />
            <ShowStatusBadge show={show} className="absolute top-3 right-3 z-10" />
        </Link>
    );
}

function OptionsMenu({ onBulkEdit }: { onBulkEdit: () => void }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t('shows.menu')} className="-ml-4">
                    <MoreVertical className="size-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link to="/shows/import">{t('shows.import')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link to="/shows/create">{t('shows.create')}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onBulkEdit}>{t('shows.bulkEdit.title')}</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function Filters({
    search,
    status,
    setSearch,
    setStatus,
    view,
    setView,
    bulkEdit,
}: {
    search: string;
    status: ShowStatus | 'all';
    setSearch: (search: string) => void;
    setStatus: (status: ShowStatus | 'all') => void;
    view: 'grid' | 'list';
    setView: (view: 'grid' | 'list') => void;
    bulkEdit?: boolean;
}) {
    return (
        <div className="flex items-center gap-2">
            <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                    type="search"
                    placeholder={t('shows.searchPlaceholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64 pl-9"
                />
            </div>
            <ShowStatusSelect value={status} onValueChange={setStatus} />
            {!bulkEdit && (
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
                    aria-label={view === 'grid' ? t('shows.view.list') : t('shows.view.grid')}
                    className="rounded-md border"
                >
                    {view === 'grid' ? <List className="size-4" /> : <Grid className="size-4" />}
                </Button>
            )}
        </div>
    );
}

export default function Shows() {
    const shows = useShows();
    const [status, setStatus] = useState<ShowStatus | 'all'>('all');
    const [search, setSearch] = useState('');
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [bulkEdit, setBulkEdit] = useState(false);
    const [selectedShows, setSelectedShows] = useState<Set<string>>(new Set());
    const filteredShows = useMemo(() => {
        const normalizedSearch = stringToSlug(search);

        return shows?.filter((show) => {
            if (status !== 'all' && show.status !== status) {
                return false;
            }

            return !normalizedSearch || stringToSlug(show.title).includes(normalizedSearch);
        });
    }, [shows, status, search]);

    const handleBulkEdit = () => {
        setBulkEdit(true);
        setView('list');
        setSelectedShows(new Set());
    };

    const handleExitBulkEdit = () => {
        setBulkEdit(false);
        setSelectedShows(new Set());
    };

    const handleToggleSelect = (showId: string) => {
        setSelectedShows((prev) => {
            const next = new Set(prev);
            if (next.has(showId)) {
                next.delete(showId);
            } else {
                next.add(showId);
            }
            return next;
        });
    };

    const handleBulkStatusChange = (newStatus: ShowStatus) => {
        if (!shows) {
            return;
        }

        selectedShows.forEach((showId) => {
            const show = shows.find((s) => s.$jazz.id === showId);
            if (show) {
                show.$jazz.set('status', newStatus);
            }
        });

        setSelectedShows(new Set());
    };

    const handleSelectAll = () => {
        if (!filteredShows) {
            return;
        }
        setSelectedShows(new Set(filteredShows.map((show) => show.$jazz.id)));
    };

    const handleDeselectAll = () => {
        setSelectedShows(new Set());
    };

    const allSelected = filteredShows
        ? filteredShows.length > 0 && filteredShows.every((show) => selectedShows.has(show.$jazz.id))
        : false;
    const someSelected = filteredShows ? selectedShows.size > 0 && selectedShows.size < filteredShows.length : false;
    const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
    const statusOptions = useMemo(() => showStatuses.map((status) => getStatusVars(status)), []);

    useEffect(() => {
        if (selectAllCheckboxRef.current) {
            selectAllCheckboxRef.current.indeterminate = someSelected;
        }
    }, [someSelected]);

    if (!filteredShows) {
        return <></>;
    }

    const effectiveView = bulkEdit ? 'list' : view;

    return (
        <Page
            title={`${t('shows.title')} (${filteredShows.length})`}
            beforeTitle={<OptionsMenu onBulkEdit={handleBulkEdit} />}
            actions={
                <Filters
                    search={search}
                    status={status}
                    setSearch={setSearch}
                    setStatus={setStatus}
                    view={view}
                    setView={setView}
                    bulkEdit={bulkEdit}
                />
            }
        >
            {effectiveView === 'grid' ? (
                <ul className="grid grid-cols-6 gap-3">
                    {filteredShows.map((show) => (
                        <li key={show.$jazz.id}>
                            <ShowCard show={show} view={effectiveView} />
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="rounded-lg border [&>*:last-child>div]:border-b-0">
                    {bulkEdit && (
                        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-2">
                            <input
                                ref={selectAllCheckboxRef}
                                type="checkbox"
                                checked={allSelected}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        handleSelectAll();
                                    } else {
                                        handleDeselectAll();
                                    }
                                }}
                                className="size-4 shrink-0 cursor-pointer rounded border-gray-300"
                                aria-label={t('shows.bulkEdit.selectAll')}
                            />
                            <div className="min-w-0 flex-1">
                                <span className="text-muted-foreground text-sm">{t('shows.bulkEdit.selectAll')}</span>
                            </div>
                            {selectedShows.size > 0 && (
                                <>
                                    <span className="text-muted-foreground text-sm">
                                        {t('shows.bulkEdit.selected', { count: selectedShows.size })}
                                    </span>
                                    <Select
                                        onValueChange={(value) => {
                                            handleBulkStatusChange(value as ShowStatus);
                                        }}
                                    >
                                        <SelectTrigger className="w-auto">
                                            <SelectValue placeholder={t('shows.bulkEdit.selectStatus')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map(({ name, textClass, Icon }) => (
                                                <SelectItem key={name} value={name}>
                                                    <div className={cn('flex items-center gap-2', textClass)}>
                                                        <Icon className={cn('size-4', textClass)} />
                                                        <span>{t(`shows.status.${name}`)}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </>
                            )}
                            <Button variant="ghost" size="sm" onClick={handleExitBulkEdit}>
                                <X className="mr-2 size-4" />
                                {t('shows.bulkEdit.cancel')}
                            </Button>
                        </div>
                    )}
                    {filteredShows.map((show) => (
                        <ShowCard
                            key={show.$jazz.id}
                            show={show}
                            view={effectiveView}
                            bulkEdit={bulkEdit}
                            selected={selectedShows.has(show.$jazz.id)}
                            onToggleSelect={() => handleToggleSelect(show.$jazz.id)}
                        />
                    ))}
                </div>
            )}
        </Page>
    );
}
