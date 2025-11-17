import { t } from 'i18next';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { betterAuthClient } from '@/lib/auth';

interface LoginFormProps {
    onSuccess?: () => void;
}

const TEST_USER = {
    name: 'Test User',
    email: 'alice@example.com',
    password: '12345679!',
};

export default function LoginForm({ onSuccess }: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSuccess?.();
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
            <div className="flex justify-end gap-2">
                {import.meta.env.DEV && (
                    <Button type="button" variant="outline" onClick={handleTestLogin}>
                        {t('login.test')}
                    </Button>
                )}
                <Button type="submit">{t('login.submit')}</Button>
            </div>
        </form>
    );
}
