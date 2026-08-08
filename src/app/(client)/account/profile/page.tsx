'use client';

import React from 'react';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Camera, Loader2, Lock, Mail, MapPin, Package } from 'lucide-react';

import { Reveal } from '@/components/motion/reveal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/toast';
import { getProfile, updateProfile, uploadAvatar } from '@/lib/api';
import { useSession } from '@/lib/auth/auth-client';
import { formatDate, initialsOf } from '@/lib/utils';
import { profileSchema, type ProfileFormValues } from '@/lib/validators/profileSchema';
import type { Profile } from '@/types';
import { BrandMark } from '../../_components/brand-mark';

export default function ProfilePage() {
    const queryClient = useQueryClient();
    // better-auth caches the session; refetching it repaints the header avatar.
    const { refetch: refetchSession } = useSession();
    const fileRef = React.useRef<HTMLInputElement>(null);

    const {
        data: profile,
        isLoading,
        isError,
        error,
    } = useQuery<Profile>({ queryKey: ['profile'], queryFn: getProfile });

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: { fname: '', lname: '', address: '', image: null },
        mode: 'onBlur',
    });

    // The form is rendered before the query lands, so seed it once it does.
    React.useEffect(() => {
        if (!profile) return;
        form.reset({
            fname: profile.fname,
            lname: profile.lname,
            address: profile.address ?? '',
            image: profile.image,
        });
    }, [profile, form]);

    // The card previews what the form currently holds, before it is saved.
    const { control } = form;
    const [image, fname, lname] = useWatch({ control, name: ['image', 'fname', 'lname'] });
    const previewName = `${fname ?? ''} ${lname ?? ''}`.trim() || profile?.email || '';

    const onSaved = (saved: Profile) => {
        queryClient.setQueryData(['profile'], saved);
        void refetchSession();
    };

    const save = useMutation({
        mutationFn: updateProfile,
        onSuccess: (saved) => {
            onSaved(saved);
            toast.add({ title: 'Your details are saved', type: 'success' });
        },
        onError: (err) =>
            toast.add({
                title: err instanceof Error ? err.message : 'Could not save your profile',
                type: 'error',
            }),
    });

    // Uploading only parks the URL in the form; the picture sticks on save.
    const upload = useMutation({
        mutationFn: uploadAvatar,
        onSuccess: ({ url }) => {
            form.setValue('image', url, { shouldDirty: true });
            toast.add({ title: 'Picture uploaded — save to keep it', type: 'success' });
        },
        onError: (err) =>
            toast.add({
                title: err instanceof Error ? err.message : 'Could not upload your picture',
                type: 'error',
            }),
    });

    const busy = save.isPending || upload.isPending;

    const onPickFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        // Reset the input so picking the same file twice still fires a change.
        event.target.value = '';
        if (file) upload.mutate(file);
    };

    return (
        <>
            <section className="border-b border-border bg-ivory-dim">
                <div className="shell py-12 lg:py-16">
                    <div className="flex items-center gap-3">
                        <BrandMark className="h-5 text-gold" />
                        <span className="eyebrow text-cocoa-500">Your account</span>
                    </div>
                    <h1 className="display-2 mt-5 text-cocoa-800">My Profile</h1>
                    <p className="prose-body mt-4 max-w-xl text-cocoa-600">
                        Your name, your picture and the address we deliver to. Change any of them
                        whenever you like.
                    </p>
                </div>
            </section>

            <section className="bg-background">
                <div className="shell py-12 lg:py-16">
                    {isLoading && <Skeleton className="h-[36rem] w-full rounded-none bg-cocoa-100" />}

                    {isError && (
                        <div className="flex flex-col items-start gap-3 border border-border bg-card px-6 py-10">
                            <AlertCircle className="size-6 text-destructive" strokeWidth={1.4} />
                            <h2 className="display-3 text-cocoa-800">
                                We could not load your profile
                            </h2>
                            <p className="text-[0.85rem] text-cocoa-500">
                                {error instanceof Error
                                    ? error.message
                                    : 'Please try again in a moment.'}
                            </p>
                        </div>
                    )}

                    {profile && (
                        <Reveal direction="up">
                            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-10">
                                {/* The card: who you are, at a glance. */}
                                <aside className="lg:sticky lg:top-32 lg:self-start">
                                    <div className="border border-border bg-card shadow-e-sm">
                                        <div className="flex flex-col items-center border-b border-border bg-ivory-dim px-6 py-10">
                                            <div className="relative">
                                                <Avatar className="size-24 ring-1 ring-cocoa-200">
                                                    <AvatarImage
                                                        src={image ?? undefined}
                                                        alt=""
                                                    />
                                                    <AvatarFallback className="bg-cocoa-100 font-heading text-2xl font-medium text-cocoa-700">
                                                        {initialsOf(previewName)}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <button
                                                    type="button"
                                                    onClick={() => fileRef.current?.click()}
                                                    disabled={busy}
                                                    aria-label="Change your picture"
                                                    className="absolute -right-1 -bottom-1 flex size-9 items-center justify-center rounded-full bg-cocoa-800 text-ivory shadow-e-sm transition-colors hover:bg-cocoa-900 disabled:opacity-60">
                                                    {upload.isPending ? (
                                                        <Loader2 className="size-4 animate-spin" />
                                                    ) : (
                                                        <Camera className="size-4" strokeWidth={1.6} />
                                                    )}
                                                </button>

                                                <input
                                                    ref={fileRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="sr-only"
                                                    onChange={onPickFile}
                                                />
                                            </div>

                                            <p className="mt-5 text-center font-heading text-2xl font-medium text-cocoa-800">
                                                {previewName || 'Your account'}
                                            </p>
                                            <p className="mt-1.5 flex items-center gap-1.5 text-[0.75rem] text-cocoa-500">
                                                <Mail className="size-3 text-gold" aria-hidden="true" />
                                                {profile.email}
                                            </p>

                                            {upload.isPending && (
                                                <p className="mt-4 text-[0.7rem] text-cocoa-500">
                                                    Uploading to ImageKit…
                                                </p>
                                            )}
                                        </div>

                                        <dl className="divide-y divide-border text-[0.8rem]">
                                            <div className="flex items-baseline justify-between px-6 py-4">
                                                <dt className="eyebrow text-[0.5rem] text-cocoa-500">
                                                    Member since
                                                </dt>
                                                <dd className="text-cocoa-800">
                                                    {formatDate(profile.createdAt)}
                                                </dd>
                                            </div>
                                            <div className="flex items-baseline justify-between gap-4 px-6 py-4">
                                                <dt className="eyebrow text-[0.5rem] text-cocoa-500">
                                                    Delivers to
                                                </dt>
                                                <dd className="text-right text-cocoa-800">
                                                    {profile.address ?? 'No address saved yet'}
                                                </dd>
                                            </div>
                                        </dl>

                                        <Link
                                            href="/account/orders"
                                            className="eyebrow flex items-center justify-center gap-2.5 border-t border-border px-6 py-4 text-cocoa-600 transition-colors hover:bg-ivory-dim hover:text-cocoa-900">
                                            <Package className="size-3.5" />
                                            View order history
                                        </Link>
                                    </div>
                                </aside>

                                {/* The form: everything you are allowed to change. */}
                                <div className="border border-border bg-card p-6 shadow-e-sm sm:p-8">
                                    <h2 className="eyebrow font-sans text-cocoa-600">
                                        Your details
                                    </h2>

                                    <Form {...form}>
                                        <form
                                            onSubmit={form.handleSubmit((values) =>
                                                save.mutate(values)
                                            )}
                                            noValidate
                                            className="mt-7 space-y-6">
                                            <div className="grid gap-6 sm:grid-cols-2">
                                                <FormField
                                                    control={form.control}
                                                    name="fname"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="eyebrow text-cocoa-600">
                                                                First name
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    autoComplete="given-name"
                                                                    className="h-11 rounded-none bg-background"
                                                                    disabled={busy}
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage className="text-xs" />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="lname"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="eyebrow text-cocoa-600">
                                                                Last name
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    autoComplete="family-name"
                                                                    className="h-11 rounded-none bg-background"
                                                                    disabled={busy}
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormMessage className="text-xs" />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            {/* Read-only: this is the identity you sign in with. */}
                                            <div>
                                                <p className="eyebrow text-cocoa-600">
                                                    Email address
                                                </p>
                                                <div className="mt-2 flex h-11 items-center justify-between gap-3 border border-border bg-ivory-dim px-3">
                                                    <span className="truncate text-[0.85rem] text-cocoa-600">
                                                        {profile.email}
                                                    </span>
                                                    <Lock
                                                        className="size-3.5 shrink-0 text-cocoa-400"
                                                        aria-hidden="true"
                                                    />
                                                </div>
                                                <p className="mt-2 text-[0.7rem] text-muted-foreground">
                                                    Your email is how you sign in, so it cannot be
                                                    changed here.
                                                </p>
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="address"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="eyebrow text-cocoa-600">
                                                            Delivery address
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                rows={4}
                                                                autoComplete="street-address"
                                                                className="resize-none rounded-none bg-background"
                                                                placeholder="Flat, building, street, landmark"
                                                                disabled={busy}
                                                                {...field}
                                                                value={field.value ?? ''}
                                                            />
                                                        </FormControl>
                                                        <FormDescription className="text-[0.7rem]">
                                                            Saved for next time — we will fill this
                                                            in at checkout, and you can still change
                                                            it per order.
                                                        </FormDescription>
                                                        <FormMessage className="text-xs" />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="flex flex-wrap items-center gap-4 pt-1">
                                                <button
                                                    type="submit"
                                                    disabled={busy}
                                                    className="eyebrow flex h-13 items-center justify-center gap-2.5 bg-cocoa-800 px-9 text-ivory transition-colors hover:bg-cocoa-900 disabled:opacity-60">
                                                    {save.isPending && (
                                                        <Loader2 className="size-4 animate-spin" />
                                                    )}
                                                    {save.isPending ? 'Saving' : 'Save changes'}
                                                </button>

                                                {form.formState.isDirty && !busy && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            form.reset({
                                                                fname: profile.fname,
                                                                lname: profile.lname,
                                                                address: profile.address ?? '',
                                                                image: profile.image,
                                                            })
                                                        }
                                                        className="eyebrow link-underline text-cocoa-500 transition-colors hover:text-cocoa-800">
                                                        Discard changes
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    </Form>

                                    <p className="mt-8 flex items-start gap-2 border-t border-border pt-6 text-[0.7rem] text-cocoa-500">
                                        <MapPin
                                            className="mt-0.5 size-3 shrink-0 text-gold"
                                            aria-hidden="true"
                                        />
                                        Orders already placed keep the address they were sent to.
                                    </p>
                                </div>
                            </div>
                        </Reveal>
                    )}
                </div>
            </section>
        </>
    );
}
