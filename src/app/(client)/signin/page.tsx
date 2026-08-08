import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';

import { getSession } from '@/lib/auth/session';
import SignInForm from './signin-form';

export const metadata: Metadata = {
    description: 'Sign in to order chocolate and follow every delivery.',
};

const promises = [
    'Ten-minute delivery from the nearest atelier',
    'Complimentary delivery on every order',
    'Every order tracked from case to door',
];

export default async function SignInPage({ searchParams }: PageProps<'/signin'>) {
    const { callbackUrl, mode } = await searchParams;
    // The shop is the point of having an account, so that's where signing in
    // lands you unless the gate bounced you off a specific page.
    const redirectTo =
        typeof callbackUrl === 'string' && callbackUrl.startsWith('/') ? callbackUrl : '/shop';
    // `?mode=signup` comes from the header's Sign up button.
    const defaultMode = mode === 'signup' ? 'signup' : 'signin';

    // Read the real session rather than trusting a cookie: someone holding an
    // expired one needs this page, not a redirect away from it.
    if (await getSession()) {
        redirect(redirectTo);
    }

    return (
        <section className="grid flex-1 lg:grid-cols-2">
            {/* Editorial panel — the reason to sign in, not just the form. */}
            <div className="relative hidden overflow-hidden bg-cocoa-950 lg:block">
                <div className="grain absolute inset-0" aria-hidden="true">
                    <Image
                        src="/assets/product1.jpg"
                        alt=""
                        fill
                        sizes="50vw"
                        className="object-cover opacity-45"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-cocoa-950 via-cocoa-950/70 to-cocoa-950/30" />
                </div>

                <div className="relative flex h-full flex-col justify-end p-14 text-ivory">
                    <span className="eyebrow text-[0.5625rem] text-gold">The House</span>
                    <p className="display-3 mt-6 max-w-md text-ivory">
                        &ldquo;Chocolate should arrive the way it leaves our
                        marble&nbsp;&mdash;&nbsp;perfectly tempered.&rdquo;
                    </p>
                    <span className="mt-6 text-[0.8rem] text-ivory/55">
                        Aditi Rao &middot; Head Chocolatier
                    </span>

                    <ul className="mt-12 space-y-3 border-t border-ivory/12 pt-8">
                        {promises.map((promise) => (
                            <li
                                key={promise}
                                className="flex items-start gap-3 text-[0.8rem] text-ivory/65">
                                <span
                                    className="mt-1.5 size-1 shrink-0 rounded-full bg-gold"
                                    aria-hidden="true"
                                />
                                {promise}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="flex items-center justify-center bg-ivory-dim px-5 py-16 md:py-24">
                <SignInForm callbackUrl={redirectTo} defaultMode={defaultMode} />
            </div>
        </section>
    );
}
