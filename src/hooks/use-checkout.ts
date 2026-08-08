'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { toast } from '@/components/ui/toast';
import { ApiError, placeOrder, resumePayment, verifyPayment } from '@/lib/api';
import { RESERVATION_MINUTES } from '@/lib/orders/reservation';
import { openRazorpayCheckout } from '@/lib/razorpay-checkout';
import type { CheckoutSession, OrderData, VerifyPaymentData } from '@/types';

export function useCheckout({
    description,
    onPaid,
    onUnpaid,
}: {
    /** Shown as the order description inside the Razorpay modal. */
    description?: string;
    /** Runs after the payment is verified, before the redirect. */
    onPaid?: () => void;
    /**
     * Runs when the shopper closed the payment window, or when reopening one
     * failed — the order is placed but unpaid either way. Not called when
     * verification fails, which navigates to `/payment/return` on its own.
     */
    onUnpaid?: () => void;
} = {}) {
    const router = useRouter();
    const [isPaying, setIsPaying] = React.useState(false);

    const showError = (err: unknown) => {
        const message =
            err instanceof ApiError || err instanceof Error ? err.message : 'Something went wrong';
        console.error(err);
        toast.add({ title: message, type: 'error' });
    };

    const verify = useMutation({
        mutationFn: verifyPayment,
        onSuccess: (data) => {
            onPaid?.();
            // The reference is only for display, so a missing one is not fatal.
            router.push(`/payment/success?order=${data.orderId}`);
        },
        onError: (err) => {
            setIsPaying(false);
            showError(err);
            router.push('/payment/return');
        },
    });

    const startCheckout = async (session: CheckoutSession) => {
        // The server sends its own key id back; the public var is only a fallback.
        const key = session.keyId ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

        if (!key) {
            setIsPaying(false);
            toast.add({
                title: 'Payments are not configured yet',
                description: 'Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env',
                type: 'error',
            });
            return;
        }

        try {
            await openRazorpayCheckout({
                key,
                amount: session.amount,
                currency: session.currency,
                name: 'Chococart',
                description: description ?? 'Order',
                order_id: session.razorpayOrderId,
                theme: { color: '#3b2a20' },
                prefill: {
                    name: session.customer.name,
                    email: session.customer.email,
                },
                notes: { appOrderGroupId: session.groupId },
                handler: (response: VerifyPaymentData) => verify.mutate(response),
                modal: {
                    ondismiss: () => {
                        setIsPaying(false);
                        toast.add({
                            title: 'Payment cancelled',
                            description: `Your order is held in My Orders for ${RESERVATION_MINUTES} minutes — you can finish paying there.`,
                            type: 'info',
                        });
                        onUnpaid?.();
                    },
                },
            });
        } catch (err) {
            setIsPaying(false);
            showError(err);
        }
    };

    const order = useMutation({
        mutationFn: (data: OrderData) => placeOrder(data),
        onSuccess: (session) => {
            setIsPaying(true);
            void startCheckout(session);
        },
        onError: showError,
    });

    /** Reopens payment for an order already placed and still inside its hold. */
    const resume = useMutation({
        mutationFn: (groupId: string) => resumePayment(groupId),
        onSuccess: (session) => {
            setIsPaying(true);
            void startCheckout(session);
        },
        onError: (err) => {
            showError(err);
            // Usually the hold just lapsed, so let the caller refresh and show
            // the order in its real state.
            onUnpaid?.();
        },
    });

    return {
        checkout: order.mutate,
        resumeCheckout: resume.mutate,
        busy: order.isPending || resume.isPending || isPaying || verify.isPending,
    };
}
