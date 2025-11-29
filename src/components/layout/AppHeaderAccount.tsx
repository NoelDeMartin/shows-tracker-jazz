import User from '~icons/lucide/user';
import Settings from '~icons/lucide/settings';
import { t } from 'i18next';
import { Image, useAccount } from 'jazz-tools/react';
import { useState } from 'react';

import LoginForm from '@/components/forms/LoginForm';
import RegistrationForm from '@/components/forms/RegistrationForm';
import { Avatar, AvatarFallback } from '@/components/shadcn/avatar';
import { Button } from '@/components/shadcn/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/shadcn/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/shadcn/dropdown-menu';
import { betterAuthClient } from '@/lib/auth';
import { useAsyncEffect } from '@/lib/effects';
import { Account } from '@/schemas/Account';

export default function AppHeaderAccount() {
    const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const account = useAccount(Account, { resolve: { profile: { avatar: true } } });

    useAsyncEffect(async (context) => {
        const session = await betterAuthClient.getSession();

        context.isMounted && setIsLoggedIn(!!session.data?.user);
    });

    return (
        <>
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
                                    <User className="size-5 text-gray-600" />
                                </AvatarFallback>
                            </Avatar>
                        ) : (
                            <Settings className="size-5" />
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
            <Dialog
                open={isLoginDialogOpen}
                onOpenChange={(open) => {
                    setIsLoginDialogOpen(open);
                    if (!open) {
                        setIsRegisterMode(false);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {isRegisterMode ? t('header.registerTitle') : t('header.loginTitle')}
                        </DialogTitle>
                        <DialogDescription>
                            {isRegisterMode ? t('header.registerDescription') : t('header.loginDescription')}
                        </DialogDescription>
                    </DialogHeader>
                    {isRegisterMode ? (
                        <RegistrationForm
                            onSuccess={() => {
                                setIsLoginDialogOpen(false);
                                setIsRegisterMode(false);
                            }}
                            onSwitchToLogin={() => setIsRegisterMode(false)}
                        />
                    ) : (
                        <LoginForm
                            onSuccess={() => {
                                setIsLoginDialogOpen(false);
                                setIsRegisterMode(false);
                            }}
                            onSwitchToRegister={() => setIsRegisterMode(true)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
