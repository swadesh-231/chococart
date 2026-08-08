'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/auth-client';

const Signout = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter();

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push('/');
        router.refresh();
    };

    return (
        <button type="button" onClick={handleSignOut}>
            {children}
        </button>
    );
};

export default Signout;
