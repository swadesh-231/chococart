import { Skeleton } from '@/components/ui/skeleton';

export default function ShopLoading() {
    return (
        <div className="shell py-16 lg:py-20">
            <Skeleton className="h-3 w-28 rounded-none bg-cocoa-100" />
            <Skeleton className="mt-6 h-12 w-80 max-w-full rounded-none bg-cocoa-100" />
            <Skeleton className="mt-5 h-3 w-full max-w-lg rounded-none bg-cocoa-100" />

            <div className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index}>
                        <Skeleton className="aspect-4/5 w-full rounded-none bg-cocoa-100" />
                        <Skeleton className="mt-5 h-4 w-2/3 rounded-none bg-cocoa-100" />
                        <Skeleton className="mt-3 h-3 w-1/3 rounded-none bg-cocoa-100" />
                    </div>
                ))}
            </div>
        </div>
    );
}
