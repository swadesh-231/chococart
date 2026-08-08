import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ProductPage, Warehouse } from '@/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getAllProducts, getAllWarehouses } from '@/http/api';
import { inventorySchema } from '@/lib/validators/inventorySchema';

export type FormValues = z.input<typeof inventorySchema>;

/** How many matches the product picker offers before asking you to narrow it. */
const PRODUCT_PICKER_LIMIT = 50;

const CreateInventoryForm = ({
    onSubmit,
    disabled,
}: {
    onSubmit: (formValus: FormValues) => void;
    disabled: boolean;
}) => {
    const form = useForm<z.infer<typeof inventorySchema>>({
        resolver: zodResolver(inventorySchema),
        defaultValues: {
            sku: '',
        },
    });

    const { data: warehouses, isLoading: isWarehousesLoading } = useQuery<Warehouse[]>({
        queryKey: ['warehouses'],
        queryFn: () => getAllWarehouses(),
    });

    // The catalogue can outgrow a dropdown, so the list is searched
    // server-side and capped — the picker shows the best matches, not the lot.
    const [productSearch, setProductSearch] = React.useState('');
    const [productQuery, setProductQuery] = React.useState('');

    React.useEffect(() => {
        const timer = setTimeout(() => setProductQuery(productSearch), 300);
        return () => clearTimeout(timer);
    }, [productSearch]);

    const { data: productPage, isLoading: isProductsLoading } = useQuery<ProductPage>({
        queryKey: ['products', 'picker', productQuery],
        queryFn: () => getAllProducts({ q: productQuery, limit: PRODUCT_PICKER_LIMIT, sort: 'name' }),
        placeholderData: keepPreviousData,
    });

    const products = productPage?.items ?? [];
    const hiddenCount = Math.max(0, (productPage?.total ?? 0) - products.length);

    const handleSubmit = (values: FormValues) => {
        onSubmit(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>SKU</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g. CH123456" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="warehouseId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Warehouse ID</FormLabel>
                            <Select
                                onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                                defaultValue={field.value ? field.value.toString() : ''}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Warehouse ID" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {isWarehousesLoading ? (
                                        <SelectItem value="Loading">Loading...</SelectItem>
                                    ) : (
                                        <>
                                            {warehouses &&
                                                warehouses.map((item) => (
                                                    <SelectItem
                                                        key={item.id}
                                                        value={item.id ? item.id?.toString() : ''}>
                                                        {item.name}
                                                    </SelectItem>
                                                ))}
                                        </>
                                    )}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="productId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Product</FormLabel>
                            <Input
                                type="search"
                                value={productSearch}
                                onChange={(event) => setProductSearch(event.target.value)}
                                placeholder="Search the catalogue…"
                                aria-label="Search products"
                                className="mb-2"
                            />
                            <Select
                                onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
                                defaultValue={field.value ? field.value.toString() : ''}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a product" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {isProductsLoading ? (
                                        <SelectItem value="Loading">Loading...</SelectItem>
                                    ) : products.length === 0 ? (
                                        <SelectItem value="none" disabled>
                                            No products match
                                        </SelectItem>
                                    ) : (
                                        products.map((item) => (
                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                {item.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {hiddenCount > 0 && (
                                <p className="text-[0.7rem] text-muted-foreground">
                                    Showing {products.length} of {products.length + hiddenCount} —
                                    search to narrow.
                                </p>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button className="w-full" disabled={disabled}>
                    {disabled ? <Loader2 className="size-4 animate-spin" /> : 'Create'}
                </Button>
            </form>
        </Form>
    );
};

export default CreateInventoryForm;