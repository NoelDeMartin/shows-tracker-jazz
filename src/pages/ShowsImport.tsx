import { t } from 'i18next';
import { AlertTriangle, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import Catalog from '@/lib/Catalog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ImportProgress, ImportResult, TVISOShow } from '@/lib/Catalog';

export default function ShowsImport() {
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState<File | undefined>();
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | undefined>();
    const [importProgress, setImportProgress] = useState<ImportProgress | undefined>();

    const onFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setImportResult(undefined);
            setImportProgress(undefined);
        }
    };

    const handleImport = async () => {
        if (!selectedFile) {
            return;
        }

        setIsImporting(true);
        setImportResult(undefined);
        setImportProgress(undefined);

        try {
            const fileContent = await selectedFile.text();
            const jsonData = JSON.parse(fileContent) as TVISOShow[];

            const result = await Catalog.importFromTViso(jsonData, (progress) => {
                setImportProgress(progress);
            });

            setImportResult(result);

            if (result.imported.length > 0 && result.failed.length === 0) {
                toast.success(t('import.success', { count: result.imported.length }));
            } else if (result.imported.length === 0) {
                toast.error(t('import.noShows'));
            } else if (result.imported.length > 0 && result.failed.length > 0) {
                toast.warning(t('import.partialSuccess', { count: result.imported.length }));
            }
        } catch (error) {
            toast.error(t('import.error'));
            console.error('Import error:', error);
        } finally {
            setIsImporting(false);
            setImportProgress(undefined);
        }
    };

    return (
        <div className="max-w-content mx-auto flex flex-col pb-8">
            <div className="mb-6">
                <h1 className="mb-2 text-2xl font-semibold">{t('import.title')}</h1>
                <p className="text-muted-foreground">{t('import.description')}</p>
            </div>

            <div className="mb-4">
                <Button variant="outline" onClick={() => navigate('/shows')}>
                    {t('forms.cancel')}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('import.title')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="file-input">{t('import.selectFile')}</Label>
                        <Input
                            id="file-input"
                            type="file"
                            accept=".json"
                            onChange={onFileSelected}
                            disabled={isImporting}
                            className="cursor-pointer"
                        />
                    </div>

                    <Button onClick={handleImport} disabled={!selectedFile || isImporting} className="w-full">
                        {isImporting ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                {t('import.importing')}
                            </>
                        ) : (
                            t('import.startImport')
                        )}
                    </Button>

                    {/* Progress Bar */}
                    {isImporting && importProgress && (
                        <div className="space-y-2">
                            <div className="text-muted-foreground flex justify-between text-sm">
                                <span>
                                    {t('import.processingItems', {
                                        current: importProgress.processed,
                                        total: importProgress.total,
                                    })}
                                </span>
                                <span>{Math.round((importProgress.processed / importProgress.total) * 100)}%</span>
                            </div>
                            <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                                <div
                                    className="bg-primary h-full transition-all duration-300 ease-out"
                                    style={{ width: `${(importProgress.processed / importProgress.total) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Import Results */}
            {importResult && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>{t('import.resultsTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950/20">
                                <div className="flex items-center">
                                    <CheckCircle2 className="mr-3 size-5 text-green-600" />
                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                        {t('import.importedCount', { count: importResult.imported.length })}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950/20">
                                <div className="flex items-center">
                                    <AlertTriangle className="mr-3 size-5 text-yellow-600" />
                                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                        {t('import.skippedCount', { count: importResult.skipped.length })}
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950/20">
                                <div className="flex items-center">
                                    <XCircle className="mr-3 size-5 text-red-600" />
                                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                        {t('import.failedCount', { count: importResult.failed.length })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Results */}
                        {importResult.imported.length > 0 && (
                            <div>
                                <h4 className="mb-2 text-lg font-medium text-green-900 dark:text-green-100">
                                    {t('import.importedShows')} ({importResult.imported.length})
                                </h4>
                                <div className="max-h-32 overflow-y-auto rounded border bg-green-50 p-3 dark:bg-green-950/20">
                                    <ul className="space-y-1 text-sm text-green-700 dark:text-green-300">
                                        {importResult.imported.map((show, index) => (
                                            <li key={index}>
                                                <strong>{show.title}</strong>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {importResult.skipped.length > 0 && (
                            <div>
                                <h4 className="text-muted-foreground mb-2 text-lg font-medium">
                                    {t('import.skippedShows')} ({importResult.skipped.length})
                                </h4>
                                <div className="bg-muted max-h-32 overflow-y-auto rounded border p-3">
                                    <ul className="text-muted-foreground space-y-1 text-sm">
                                        {importResult.skipped.map((show, index) => (
                                            <li key={index}>
                                                <strong>{show.title}</strong> - {show.reason}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {importResult.failed.length > 0 && (
                            <div>
                                <h4 className="mb-2 text-lg font-medium text-red-900 dark:text-red-100">
                                    {t('import.failedShows')} ({importResult.failed.length})
                                </h4>
                                <div className="max-h-32 overflow-y-auto rounded border bg-red-50 p-3 dark:bg-red-950/20">
                                    <ul className="space-y-1 text-sm text-red-700 dark:text-red-300">
                                        {importResult.failed.map((show, index) => (
                                            <li key={index}>
                                                <strong>{show.title}</strong> - {show.reason}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
