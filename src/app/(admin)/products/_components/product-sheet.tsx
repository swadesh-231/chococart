'use client';

import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { useToast } from '@/components/ui/use-toast';
import { createProduct } from '@/http/api';
import { uploadProductImage } from '@/lib/imagekit';
import { useNewProduct } from '@/store/product/product-store';
import CreateProductForm from './create-product-form';
import type { ProductFormValues } from '@/lib/validators/productSchema';

const ProductSheet = () => {
    const { toast } = useToast();
    const { isOpen, onClose } = useNewProduct();
    const queryClient = useQueryClient();
    const [progress, setProgress] = React.useState<number | null>(null);

    /**
     * ImageKit is optional. Asking once, while the sheet is open, tells the form
     * whether to offer the file picker at all — better than letting an admin
     * choose a file and only then discovering uploads were never set up.
     */
    const { data: uploadsConfigured = true } = useQuery({
        queryKey: ['imagekit-configured'],
        queryFn: async () => (await fetch('/api/imagekit/auth')).ok,
        enabled: isOpen,
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    const { mutate, isPending } = useMutation({
        mutationKey: ['create-product'],
        mutationFn: async (values: ProductFormValues) => {
            const file = values.image?.[0];

            // Straight from the browser to ImageKit — the file never touches
            // the Next server, so this works on an ephemeral filesystem. With
            // no file chosen, the pasted URL is stored as-is.
            let imageUrl = values.imageUrl?.trim() ?? '';

            if (file) {
                setProgress(0);
                imageUrl = await uploadProductImage(file, setProgress);
            }

            return createProduct({
                name: values.name,
                description: values.description,
                price: values.price,
                category: values.category,
                image: imageUrl,
                cocoaPercent: values.cocoaPercent ?? null,
                flavourNotes: values.flavourNotes?.length ? values.flavourNotes : null,
                origin: values.origin?.trim() || null,
                weightGrams: values.weightGrams ?? null,
                vegan: values.vegan ?? false,
                glutenFree: values.glutenFree ?? false,
            });
        },
        onSuccess: () => {
            // Prefix match, so both the admin table and the storefront refetch.
            queryClient.invalidateQueries({ queryKey: ['products'] });
            toast({ title: 'Product created successfully' });
            setProgress(null);
            onClose();
        },
        onError: (err) => {
            setProgress(null);
            toast({ title: err.message, variant: 'destructive' });
        },
    });

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            {/* A column, so the form body scrolls and its submit bar stays put. */}
            {/* The width has to carry the same variant prefix the base uses, or
                tailwind-merge keeps both and the narrower one can win. */}
            <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 data-[side=right]:sm:max-w-lg">
                <SheetHeader className="border-b border-border px-6 py-5">
                    <SheetTitle className="font-heading text-2xl">Create product</SheetTitle>
                    <SheetDescription>
                        {uploadsConfigured
                            ? 'Images are uploaded to ImageKit and served from their CDN.'
                            : 'Image uploads are not configured — paste an image URL instead.'}
                    </SheetDescription>
                </SheetHeader>
                <CreateProductForm
                    onSubmit={(values) => mutate(values)}
                    disabled={isPending}
                    progress={progress}
                    uploadsConfigured={uploadsConfigured}
                />
            </SheetContent>
        </Sheet>
    );
};

export default ProductSheet;
