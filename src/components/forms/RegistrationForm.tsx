import { t } from 'i18next';
import { useState } from 'react';

import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { Label } from '@/components/shadcn/label';
import { betterAuthClient } from '@/lib/auth';

interface RegistrationFormProps {
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
}

export default function RegistrationForm({ onSuccess, onSwitchToLogin }: RegistrationFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const { error: signUpError } = await betterAuthClient.signUp.email({
                name,
                email,
                password,
            });

            if (signUpError) {
                setError(signUpError.message || t('register.error'));
                setIsLoading(false);
                return;
            }

            onSuccess?.();
        } catch (error) {
            setError(error instanceof Error ? error.message : t('register.error'));
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-destructive/10 border-destructive/20 text-destructive rounded-md border p-3 text-sm">
                    {error}
                </div>
            )}
            <div className="space-y-2">
                <Label htmlFor="name">{t('register.name')}</Label>
                <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder={t('register.namePlaceholder')}
                    disabled={isLoading}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">{t('register.email')}</Label>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder={t('register.emailPlaceholder')}
                    disabled={isLoading}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">{t('register.password')}</Label>
                <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder={t('register.passwordPlaceholder')}
                    disabled={isLoading}
                />
            </div>
            <div className="flex flex-col gap-2">
                <div className="flex justify-end gap-2">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? t('register.submitting') : t('register.submit')}
                    </Button>
                </div>
                {onSwitchToLogin && (
                    <div className="text-muted-foreground text-center text-sm">
                        {t('register.alreadyHaveAccount')}{' '}
                        <button
                            type="button"
                            onClick={onSwitchToLogin}
                            className="text-primary hover:underline"
                            disabled={isLoading}
                        >
                            {t('register.switchToLogin')}
                        </button>
                    </div>
                )}
            </div>
        </form>
    );
}
