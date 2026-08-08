'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiError } from '@/lib/api';

let browserQueryClient: QueryClient | undefined = undefined;

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Enough that moving between the shop, a product and the cart
                // does not refetch the same catalogue three times.
                staleTime: 60_000,
                // 401/403/404 will not fix themselves — only retry real faults.
                retry: (failureCount, error) => {
                    if (error instanceof ApiError && error.status < 500) return false;
                    return failureCount < 2;
                },
            },
        },
    });
}

function getQueryClient() {
    // Every server render gets its own client; the browser keeps one.
    if (typeof window === 'undefined') {
        return makeQueryClient();
    }

    if (!browserQueryClient) {
        browserQueryClient = makeQueryClient();
    }

    return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient();

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
