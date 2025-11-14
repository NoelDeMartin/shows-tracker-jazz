import { useState } from 'react';
import { Link } from 'react-router-dom';
import { t } from 'i18next';
import { LucideSearch, LucideSettings, LucideUser } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import LoginForm from '@/components/forms/LoginForm';
import { betterAuthClient } from '@/lib/auth';
import { Image, useAccount } from 'jazz-tools/react';
import { Account } from '@/schemas/Account';
import { useAsyncEffect } from '@/lib/effects';

export default function AppHeader() {
    const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const account = useAccount(Account, { resolve: { profile: { avatar: true } } });

    useAsyncEffect(async (context) => {
        const session = await betterAuthClient.getSession();

        context.isMounted && setIsLoggedIn(!!session.data?.user);
    });

    return (
        <header className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 py-5">
            <h1>
                <Link to="/">{t('header.title')}</Link>
            </h1>
            <div className="flex items-center gap-0.5">
                <Button variant="ghost">
                    <LucideSearch className="size-5" />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className={isLoggedIn ? 'size-8 rounded-full p-0' : ''}
                            title={t('header.settings')}
                            aria-label={t('header.settings')}
                        >
                            {isLoggedIn && account.$isLoaded ? (
                                <Avatar className="size-8">
                                    {account.profile.avatar && (
                                        <Image imageId={account.profile.avatar?.$jazz.id} alt="" width={600} />
                                    )}
                                    <AvatarFallback>
                                        <LucideUser className="size-5 text-gray-600" />
                                    </AvatarFallback>
                                </Avatar>
                            ) : (
                                <LucideSettings className="size-5" />
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {isLoggedIn ? (
                            <DropdownMenuItem onSelect={() => betterAuthClient.signOut()}>
                                {t('header.logout')}
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem onSelect={() => setIsLoginDialogOpen(true)}>
                                {t('header.login')}
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('header.loginTitle')}</DialogTitle>
                        <DialogDescription>{t('header.loginDescription')}</DialogDescription>
                    </DialogHeader>
                    <LoginForm onSuccess={() => setIsLoginDialogOpen(false)} />
                </DialogContent>
            </Dialog>
        </header>
    );
}
