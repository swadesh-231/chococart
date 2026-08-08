'use client';

import { toast as toastManager } from '@/components/ui/toast';

type ToastInput = {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
};

/**
 * Compatibility shim over the base-ui toast manager, so components can keep
 * the familiar `const { toast } = useToast()` shape.
 */
export function useToast() {
    const toast = ({ title, description, variant }: ToastInput) =>
        toastManager.add({
            title,
            description,
            type: variant === 'destructive' ? 'error' : 'success',
        });

    return { toast, dismiss: toastManager.close };
}

export { toastManager as toast };
