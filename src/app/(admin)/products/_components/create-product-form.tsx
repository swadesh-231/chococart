'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Check, ImageIcon, Loader2 } from 'lucide-react';

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
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    categoryLabel,
    COCOA_RANGE,
    DEFAULT_CATEGORY,
    FLAVOUR_NOTES,
    noteLabel,
    PRODUCT_CATEGORIES,
} from '@/lib/categories';
import { cn } from '@/lib/utils';
import { productFormSchema, type ProductFormValues } from '@/lib/validators/productSchema';

export type FormValues = ProductFormValues;

/** Turns an empty number input into undefined rather than NaN. */
const numberOrUndefined = (value: number) => (Number.isNaN(value) ? undefined : value);

/** A titled band of related fields, so the sheet reads as a form and not a list. */
function Section({
    title,
    hint,
    children,
}: {
    title: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="border-t border-border pt-6 first:border-t-0 first:pt-0">
            <div className="mb-4">
                <h3 className="eyebrow text-[0.5625rem] text-cocoa-500">{title}</h3>
                {hint && <p className="mt-1 text-[0.7rem] text-muted-foreground">{hint}</p>}
            </div>
            <div className="space-y-4">{children}</div>
        </section>
    );
}

/**
 * Shows what the shopper will see, so a broken link is caught before saving.
 * Mounted with the URL as its key, so a new link starts from a clean slate
 * rather than needing an effect to clear the previous failure.
 */
function ImagePreview({ url, fileName }: { url?: string; fileName?: string }) {
    const [failed, setFailed] = React.useState(false);

    const showable = url && /^https?:\/\//.test(url) && !failed;

    return (
        <div className="flex items-center gap-3">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden border border-border bg-muted">
                {showable ? (
                    // A plain img: the URL can point at any host, and next/image
                    // would need every one of them in remotePatterns.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={url}
                        alt=""
                        className="size-full object-cover"
                        onError={() => setFailed(true)}
                    />
                ) : (
                    <ImageIcon className="size-5 text-muted-foreground" strokeWidth={1.4} />
                )}
            </div>
            <p className="text-[0.7rem] leading-relaxed text-muted-foreground">
                {fileName
                    ? `${fileName} — uploaded when you save.`
                    : failed
                      ? 'That link did not load an image.'
                      : showable
                        ? 'Preview of the storefront image.'
                        : 'No image yet.'}
            </p>
        </div>
    );
}

const CreateProductForm = ({
    onSubmit,
    disabled,
    progress,
    uploadsConfigured = true,
}: {
    onSubmit: (values: FormValues) => void;
    disabled: boolean;
    progress?: number | null;
    /** False once /api/imagekit/auth has said uploads are not set up. */
    uploadsConfigured?: boolean;
}) => {
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            category: DEFAULT_CATEGORY,
            imageUrl: '',
            origin: '',
            flavourNotes: [],
            vegan: false,
            glutenFree: false,
        },
    });

    const fileRef = form.register('image');
    const [imageUrl, files] = useWatch({ control: form.control, name: ['imageUrl', 'image'] });
    const fileName = files?.[0]?.name;

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 pt-5 pb-6">
                    <Section title="Details">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 70% Dark Madagascar" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            rows={3}
                                            placeholder="Rich, smooth, intense. Single origin cacao."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </Section>

                    <Section
                        title="Image"
                        hint={
                            uploadsConfigured
                                ? 'Upload a file, or paste a link to one already hosted.'
                                : 'ImageKit is not configured, so paste a link to an image.'
                        }>
                        <ImagePreview key={imageUrl} url={imageUrl} fileName={fileName} />

                        {uploadsConfigured && (
                            <FormField
                                control={form.control}
                                name="image"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Upload</FormLabel>
                                        <FormControl>
                                            {/* Registered via fileRef so RHF receives the FileList. */}
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                className="file:mr-3 file:border-0 file:bg-transparent file:text-xs"
                                                {...fileRef}
                                            />
                                        </FormControl>
                                        {progress !== null && progress !== undefined && (
                                            <div className="mt-2">
                                                <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full bg-gold transition-all"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                                <p className="mt-1.5 text-[0.7rem] text-muted-foreground">
                                                    Uploading to ImageKit — {progress}%
                                                </p>
                                            </div>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{uploadsConfigured ? 'Or paste a URL' : 'Image URL'}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="url"
                                            placeholder="https://ik.imagekit.io/…/bar.jpg"
                                            {...field}
                                        />
                                    </FormControl>
                                    {uploadsConfigured && (
                                        <FormDescription className="text-[0.7rem]">
                                            Used when no file is chosen.
                                        </FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </Section>

                    <Section title="Price and type">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price (₹)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                className="tnum"
                                                name={field.name}
                                                ref={field.ref}
                                                onBlur={field.onBlur}
                                                value={
                                                    Number.isFinite(field.value) ? field.value : ''
                                                }
                                                onChange={(e) =>
                                                    field.onChange(
                                                        numberOrUndefined(e.target.valueAsNumber)
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <FormControl>
                                            {/* className lands on the wrapper, so the box
                                                stretches while `field` reaches the select. */}
                                            <NativeSelect className="w-full" {...field}>
                                                {PRODUCT_CATEGORIES.map((category) => (
                                                    <NativeSelectOption
                                                        key={category}
                                                        value={category}>
                                                        {categoryLabel(category)}
                                                    </NativeSelectOption>
                                                ))}
                                            </NativeSelect>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </Section>

                    <Section
                        title="Tasting detail"
                        hint="Optional — these are what the shop's filters search on.">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="cocoaPercent"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cocoa (%)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={COCOA_RANGE.min}
                                                max={COCOA_RANGE.max}
                                                placeholder="70"
                                                className="tnum"
                                                name={field.name}
                                                ref={field.ref}
                                                onBlur={field.onBlur}
                                                value={field.value ?? ''}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        numberOrUndefined(e.target.valueAsNumber)
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="weightGrams"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Weight (g)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                placeholder="70"
                                                className="tnum"
                                                name={field.name}
                                                ref={field.ref}
                                                onBlur={field.onBlur}
                                                value={field.value ?? ''}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        numberOrUndefined(e.target.valueAsNumber)
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="origin"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Origin</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Madagascar"
                                            {...field}
                                            value={field.value ?? ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="flavourNotes"
                            render={({ field }) => {
                                const selected = field.value ?? [];
                                return (
                                    <FormItem>
                                        <FormLabel>Tasting notes</FormLabel>
                                        <div className="flex flex-wrap gap-2">
                                            {FLAVOUR_NOTES.map((note) => {
                                                const on = selected.includes(note);
                                                return (
                                                    <button
                                                        key={note}
                                                        type="button"
                                                        aria-pressed={on}
                                                        onClick={() =>
                                                            field.onChange(
                                                                on
                                                                    ? selected.filter(
                                                                          (n) => n !== note
                                                                      )
                                                                    : [...selected, note]
                                                            )
                                                        }
                                                        className={cn(
                                                            'eyebrow border px-3 py-2 text-[0.5625rem] transition-colors',
                                                            on
                                                                ? 'border-cocoa-800 bg-cocoa-800 text-ivory'
                                                                : 'border-input text-cocoa-600 hover:border-cocoa-400'
                                                        )}>
                                                        {noteLabel(note)}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />

                        <div className="flex gap-6 pt-1">
                            {(['vegan', 'glutenFree'] as const).map((key) => (
                                <FormField
                                    key={key}
                                    control={form.control}
                                    name={key}
                                    render={({ field }) => (
                                        <FormItem>
                                            <button
                                                type="button"
                                                role="checkbox"
                                                aria-checked={Boolean(field.value)}
                                                onClick={() => field.onChange(!field.value)}
                                                className="group flex items-center gap-2.5">
                                                <span
                                                    className={cn(
                                                        'flex size-4 items-center justify-center border transition-colors',
                                                        field.value
                                                            ? 'border-cocoa-800 bg-cocoa-800 text-ivory'
                                                            : 'border-input group-hover:border-cocoa-400'
                                                    )}>
                                                    {field.value && (
                                                        <Check
                                                            className="size-3"
                                                            strokeWidth={2.5}
                                                        />
                                                    )}
                                                </span>
                                                <span className="text-[0.825rem] text-cocoa-700">
                                                    {key === 'vegan' ? 'Vegan' : 'Gluten free'}
                                                </span>
                                            </button>
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>
                    </Section>
                </div>

                {/* Stays in reach however far down the form you have scrolled. */}
                <div className="border-t border-border bg-background px-6 py-4">
                    <Button className="eyebrow h-11 w-full rounded-none" disabled={disabled}>
                        {disabled ? <Loader2 className="size-4 animate-spin" /> : 'Create product'}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default CreateProductForm;
