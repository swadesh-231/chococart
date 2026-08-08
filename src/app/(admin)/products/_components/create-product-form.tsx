'use client';

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { categoryLabel, DEFAULT_CATEGORY, PRODUCT_CATEGORIES } from '@/lib/categories';
import { productFormSchema, type ProductFormValues } from '@/lib/validators/productSchema';

export type FormValues = ProductFormValues;

const CreateProductForm = ({
    onSubmit,
    disabled,
    progress,
}: {
    onSubmit: (values: FormValues) => void;
    disabled: boolean;
    progress?: number | null;
}) => {
    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            category: DEFAULT_CATEGORY,
        },
    });

    const fileRef = form.register('image');

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="eyebrow text-cocoa-600">Name</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. 70% Dark Chocolate" {...field} />
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
                            <FormLabel className="eyebrow text-cocoa-600">Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    rows={4}
                                    placeholder="Rich, smooth, intense. Single origin cacao."
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="image"
                    render={() => (
                        <FormItem>
                            <FormLabel className="eyebrow text-cocoa-600">Image</FormLabel>
                            <FormControl>
                                {/* Registered via fileRef so RHF receives the FileList. */}
                                <Input type="file" accept="image/*" {...fileRef} />
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
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="eyebrow text-cocoa-600">Price (₹)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={1}
                                    name={field.name}
                                    ref={field.ref}
                                    onBlur={field.onBlur}
                                    value={Number.isFinite(field.value) ? field.value : ''}
                                    onChange={(e) => {
                                        const value = e.target.valueAsNumber;
                                        field.onChange(Number.isNaN(value) ? undefined : value);
                                    }}
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
                            <FormLabel className="eyebrow text-cocoa-600">Type</FormLabel>
                            <FormControl>
                                {/* className lands on the wrapper, so the box
                                    stretches while `field` reaches the select. */}
                                <NativeSelect className="w-full" {...field}>
                                    {PRODUCT_CATEGORIES.map((category) => (
                                        <NativeSelectOption key={category} value={category}>
                                            {categoryLabel(category)}
                                        </NativeSelectOption>
                                    ))}
                                </NativeSelect>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button className="eyebrow h-11 w-full rounded-none" disabled={disabled}>
                    {disabled ? <Loader2 className="size-4 animate-spin" /> : 'Create product'}
                </Button>
            </form>
        </Form>
    );
};

export default CreateProductForm;
