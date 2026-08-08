'use client';

import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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

    const { mutate, isPending } = useMutation({
        mutationKey: ['create-product'],
        mutationFn: async (values: ProductFormValues) => {
            const file = (values.image as FileList)[0];

            // Straight from the browser to ImageKit — the file never touches
            // the Next server, so this works on an ephemeral filesystem.
            setProgress(0);
            const imageUrl = await uploadProductImage(file, setProgress);

            return createProduct({
                name: values.name,
                description: values.description,
                price: values.price,
                image: imageUrl,
            });
        },
        onSuccess: () => {
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
            <SheetContent className="min-w-[28rem] space-y-4 overflow-y-auto">
                <SheetHeader>
                    <SheetTitle className="font-heading text-2xl">Create Product</SheetTitle>
                    <SheetDescription>
                        Images are uploaded to ImageKit and served from their CDN.
                    </SheetDescription>
                </SheetHeader>
                <CreateProductForm
                    onSubmit={(values) => mutate(values)}
                    disabled={isPending}
                    progress={progress}
                />
            </SheetContent>
        </Sheet>
    );
};

export default ProductSheet;
