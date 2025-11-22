import Plus from '~icons/lucide/plus';
import Search from '~icons/lucide/search';
import Star from '~icons/lucide/star';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/shadcn/button';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/shadcn/command';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/shadcn/dialog';
import { Spinner } from '@/components/shadcn/spinner';
import Catalog from '@/lib/Catalog';
import TMDB from '@/lib/TMDB';
import type { TMDBShow, TMDBShowDetails } from '@/lib/TMDB';

export default function AppHeaderSearch() {
    const [open, setOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearchValue, setDebouncedSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState<TMDBShow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [selectedShow, setSelectedShow] = useState<TMDBShowDetails | undefined>();
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [addingShowId, setAddingShowId] = useState<number | undefined>();

    // Debounce search value
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchValue(searchValue);
        }, 300);

        return () => {
            clearTimeout(timer);
        };
    }, [searchValue]);

    // Fetch search results when debounced value changes
    useEffect(() => {
        if (!debouncedSearchValue.trim()) {
            setSearchResults([]);
            setIsLoading(false);
            setError(undefined);
            return;
        }

        setIsLoading(true);
        setError(undefined);

        TMDB.searchShows(debouncedSearchValue)
            .then((results) => {
                setSearchResults(results);
                setIsLoading(false);
            })
            .catch((error) => {
                setError(error instanceof Error ? error.message : t('search.errorSearchFailed'));
                setIsLoading(false);
                setSearchResults([]);
            });
    }, [debouncedSearchValue]);

    const handleAddToCollection = async (show: TMDBShow) => {
        setAddingShowId(show.id);

        await Catalog.addShow(show);

        // Show success toast
        toast.success(t('search.addedSuccessfully'));

        // Close dialogs
        setOpen(false);
        setSelectedShow(undefined);
        setAddingShowId(undefined);
    };

    const handleShowClick = async (show: TMDBShow) => {
        setOpen(false);
        setIsLoadingDetails(true);
        setSelectedShow(undefined);

        try {
            const details = await TMDB.getShowDetails(show.id);
            setSelectedShow(details);
        } catch (error) {
            setError(error instanceof Error ? error.message : t('search.errorLoadDetailsFailed'));
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);

        if (!isOpen) {
            setSearchValue('');
            setDebouncedSearchValue('');
            setSearchResults([]);
            setError(undefined);
            setAddingShowId(undefined);
        }
    };

    return (
        <>
            <Button variant="ghost" onClick={() => setOpen(true)}>
                <Search className="size-5" />
            </Button>

            <CommandDialog open={open} onOpenChange={handleOpenChange}>
                <CommandInput placeholder={t('search.placeholder')} onValueChange={setSearchValue} />
                <CommandList>
                    {searchValue.trim() && (
                        <>
                            {isLoading ? (
                                <div className="flex items-center justify-center py-6">
                                    <Spinner className="text-muted-foreground size-5" />
                                    <span className="text-muted-foreground ml-2 text-sm">{t('search.searching')}</span>
                                </div>
                            ) : error ? (
                                <div className="text-destructive py-6 text-center text-sm">{error}</div>
                            ) : (
                                <>
                                    <CommandEmpty>{t('search.noResults')}</CommandEmpty>
                                    <CommandGroup>
                                        {searchResults.map((show) => {
                                            const imageUrl = TMDB.showPosterUrl(show, 'w92');
                                            const year = TMDB.showYear(show);

                                            return (
                                                <CommandItem
                                                    key={show.id}
                                                    value={show.name}
                                                    className="flex items-center gap-3 py-3"
                                                    onSelect={() => handleShowClick(show)}
                                                >
                                                    {imageUrl ? (
                                                        <img
                                                            src={imageUrl}
                                                            alt={show.name}
                                                            className="h-16 w-11 rounded object-cover"
                                                        />
                                                    ) : (
                                                        <div className="bg-muted flex h-16 w-11 items-center justify-center rounded">
                                                            <span className="text-muted-foreground text-xs">
                                                                {t('search.noImage')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-1 flex-col gap-0.5">
                                                        <span className="font-medium">{show.name}</span>
                                                        {year && (
                                                            <span className="text-muted-foreground text-sm">
                                                                {year}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        onClick={async (e) => {
                                                            e.stopPropagation();

                                                            await handleAddToCollection(show);
                                                        }}
                                                        disabled={addingShowId === show.id}
                                                    >
                                                        {addingShowId === show.id ? (
                                                            <Spinner />
                                                        ) : (
                                                            <Plus className="size-4" />
                                                        )}
                                                        {t('search.add')}
                                                    </Button>
                                                </CommandItem>
                                            );
                                        })}
                                    </CommandGroup>
                                </>
                            )}
                        </>
                    )}
                </CommandList>
            </CommandDialog>

            {/* Details Dialog */}
            <Dialog
                open={!!selectedShow}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedShow(undefined);
                        setAddingShowId(undefined);
                    }
                }}
            >
                <DialogContent className="max-w-2xl">
                    {isLoadingDetails ? (
                        <div className="flex items-center justify-center py-12">
                            <Spinner className="text-muted-foreground size-6" />
                            <span className="text-muted-foreground ml-2 text-sm">{t('search.loadingDetails')}</span>
                        </div>
                    ) : selectedShow ? (
                        <>
                            {TMDB.showBackdropUrl(selectedShow) && (
                                <div className="relative -mx-6 -mt-6 mb-4 h-48 overflow-hidden">
                                    <img
                                        src={TMDB.showBackdropUrl(selectedShow)}
                                        alt={selectedShow.name}
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="from-background absolute inset-0 bg-linear-to-t to-transparent" />
                                </div>
                            )}
                            <DialogHeader>
                                <div className="flex items-start gap-4">
                                    {TMDB.showPosterUrl(selectedShow, 'w500') ? (
                                        <img
                                            src={TMDB.showPosterUrl(selectedShow, 'w500')}
                                            alt={selectedShow.name}
                                            className="h-32 w-22 rounded object-cover shadow-lg"
                                        />
                                    ) : (
                                        <div className="bg-muted flex h-32 w-22 items-center justify-center rounded">
                                            <span className="text-muted-foreground text-xs">{t('search.noImage')}</span>
                                        </div>
                                    )}
                                    <div className="flex flex-1 flex-col gap-2">
                                        <DialogTitle className="text-2xl">{selectedShow.name}</DialogTitle>
                                        <div className="flex items-center gap-3 text-sm">
                                            {TMDB.showYear(selectedShow) && (
                                                <>
                                                    <span className="text-muted-foreground">
                                                        {TMDB.showYear(selectedShow)}
                                                    </span>
                                                    <span className="text-muted-foreground">•</span>
                                                </>
                                            )}
                                            {selectedShow.vote_average && (
                                                <>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="size-4 fill-yellow-400 text-yellow-400" />
                                                        <span className="font-medium">
                                                            {selectedShow.vote_average.toFixed(1)}
                                                        </span>
                                                    </div>
                                                    <span className="text-muted-foreground">•</span>
                                                </>
                                            )}
                                            <span className="text-muted-foreground">{selectedShow.status}</span>
                                        </div>
                                    </div>
                                </div>
                            </DialogHeader>
                            {selectedShow.overview && (
                                <DialogDescription className="text-foreground pt-2 text-base">
                                    {selectedShow.overview}
                                </DialogDescription>
                            )}
                            <div className="mt-4 flex gap-2">
                                <Button
                                    onClick={() => handleAddToCollection(selectedShow)}
                                    className="flex-1"
                                    disabled={addingShowId === selectedShow.id}
                                >
                                    {addingShowId === selectedShow.id ? <Spinner /> : <Plus className="size-4" />}
                                    {t('search.addToCollection')}
                                </Button>
                            </div>
                        </>
                    ) : undefined}
                </DialogContent>
            </Dialog>
        </>
    );
}
