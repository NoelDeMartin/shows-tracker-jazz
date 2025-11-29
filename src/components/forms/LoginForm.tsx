import { t } from 'i18next';
import { useCallback, useState } from 'react';

import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { Label } from '@/components/shadcn/label';
import { betterAuthClient } from '@/lib/auth';

interface LoginFormProps {
    onSuccess?: () => void;
    onSwitchToRegister?: () => void;
}

const TEST_USER = {
    name: 'Test User',
    email: 'alice@example.com',
    password: '12345679!',
};

export default function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const { error } = await betterAuthClient.signIn.email({
                email,
                password,
            });

            if (error) {
                alert(error.message);

                return;
            }

            onSuccess?.();
        } catch (error) {
            alert(error instanceof Error ? error.message : t('login.error'));
        }
    };

    const handleTestLogin = useCallback(async () => {
        const { error } = await betterAuthClient.signIn.email({
            email: TEST_USER.email,
            password: TEST_USER.password,
        });

        if (error?.status === 401) {
            await betterAuthClient.signUp.email({
                name: TEST_USER.name,
                email: TEST_USER.email,
                password: TEST_USER.password,
            });

            onSuccess?.();

            return;
        }

        if (error) {
            alert(error.message);

            return;
        }

        onSuccess?.();
    }, [onSuccess]);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">{t('login.email')}</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={t('login.emailPlaceholder')}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">{t('login.password')}</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={t('login.passwordPlaceholder')}
                />
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex justify-end gap-2">
                    {import.meta.env.DEV && (
                        <Button type="button" variant="outline" onClick={handleTestLogin}>
                            {t('login.test')}
                        </Button>
                    )}
                    <Button type="submit">{t('login.submit')}</Button>
                </div>
                {onSwitchToRegister && (
                    <div className="text-muted-foreground text-center text-sm">
                        {t('login.dontHaveAccount')}{' '}
                        <button type="button" onClick={onSwitchToRegister} className="text-primary hover:underline">
                            {t('login.switchToRegister')}
                        </button>
                    </div>
                )}
            </div>
        </form>
    );
}
