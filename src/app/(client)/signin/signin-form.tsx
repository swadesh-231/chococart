'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { authClient } from '@/lib/auth/auth-client';
import { signInSchema, signUpSchema, type AuthFormValues } from '@/lib/validators/authSchema';
import { BrandMark } from '../_components/brand-mark';

function GoogleIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
            <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09Z"
            />
            <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
            />
            <path
                fill="#FBBC05"
                d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
            />
            <path
                fill="#EA4335"
                d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.14 6.16-4.14Z"
            />
        </svg>
    );
}

export default function SignInForm({
    callbackUrl,
    defaultMode = 'signin',
}: {
    callbackUrl: string;
    defaultMode?: 'signin' | 'signup';
}) {
    const router = useRouter();
    const [mode, setMode] = React.useState<'signin' | 'signup'>(defaultMode);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const isSignUp = mode === 'signup';

    const form = useForm<AuthFormValues>({
        resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
        defaultValues: { name: '', email: '', password: '' },
    });

    const onSubmit = async (values: AuthFormValues) => {
        setIsSubmitting(true);

        const { error } = isSignUp
            ? await authClient.signUp.email({
                  name: values.name ?? '',
                  email: values.email,
                  password: values.password,
              })
            : await authClient.signIn.email({
                  email: values.email,
                  password: values.password,
              });

        setIsSubmitting(false);

        if (error) {
            toast.add({ title: error.message ?? 'Could not sign you in', type: 'error' });
            return;
        }

        router.push(callbackUrl);
        router.refresh();
    };

    const signInWithGoogle = async () => {
        setIsSubmitting(true);
        const { error } = await authClient.signIn.social({
            provider: 'google',
            callbackURL: callbackUrl,
        });
        if (error) {
            setIsSubmitting(false);
            toast.add({ title: error.message ?? 'Could not sign you in', type: 'error' });
        }
    };

    return (
        <div className="w-full max-w-md border border-border bg-card px-8 py-10 shadow-e-md sm:px-10">
            <div className="flex flex-col items-center text-center">
                <BrandMark className="h-8 text-gold" />
                <span className="eyebrow mt-4 text-cocoa-500">
                    {isSignUp ? 'Create account' : 'Welcome back'}
                </span>
                <h1 className="mt-3 font-heading text-3xl font-medium text-cocoa-800">
                    {isSignUp ? 'Join the House' : 'Sign In'}
                </h1>
                <p className="mt-3 text-[0.85rem] leading-relaxed text-cocoa-500">
                    {isSignUp
                        ? 'Create an account to order and follow every delivery.'
                        : 'Sign in to place and track your orders.'}
                </p>
            </div>

            <div className="rule-gold mx-auto mt-8 w-24" />

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    noValidate
                    className="mt-8 space-y-5">
                    {isSignUp && (
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="eyebrow text-cocoa-600">Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            autoComplete="name"
                                            placeholder="Jane Doe"
                                            className="h-11 rounded-none bg-background"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            )}
                        />
                    )}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="eyebrow text-cocoa-600">Email</FormLabel>
                                <FormControl>
                                    <Input
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@example.com"
                                        className="h-11 rounded-none bg-background"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="eyebrow text-cocoa-600">Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        autoComplete={
                                            isSignUp ? 'new-password' : 'current-password'
                                        }
                                        placeholder="••••••••"
                                        className="h-11 rounded-none bg-background"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage className="text-xs" />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        size="lg"
                        className="eyebrow h-12 w-full rounded-none"
                        disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                        {isSignUp ? 'Create account' : 'Sign in'}
                    </Button>
                </form>
            </Form>

            <div className="my-7 flex items-center gap-4">
                <span className="h-px flex-1 bg-border" />
                <span className="eyebrow text-[0.6rem] text-cocoa-400">Or</span>
                <span className="h-px flex-1 bg-border" />
            </div>

            <Button
                type="button"
                variant="outline"
                size="lg"
                className="eyebrow h-12 w-full gap-3 rounded-none"
                onClick={signInWithGoogle}
                disabled={isSubmitting}>
                <GoogleIcon />
                Continue with Google
            </Button>

            <button
                type="button"
                className="eyebrow link-underline mx-auto mt-8 block text-[0.65rem] text-cocoa-500"
                onClick={() => {
                    setMode(isSignUp ? 'signin' : 'signup');
                    form.clearErrors();
                }}>
                {isSignUp ? 'Already have an account? Sign in' : 'No account? Create one'}
            </button>
        </div>
    );
}
