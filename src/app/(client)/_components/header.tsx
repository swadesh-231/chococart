'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, LogOut, Menu, Package, Search, User } from 'lucide-react';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { authClient, useSession } from '@/lib/auth/auth-client';
import { cn } from '@/lib/utils';
import { BrandMark, Wordmark } from './brand-mark';
import CartSheet from './cart-sheet';

const navItems = [
    { label: 'Shop', href: '/shop' },
    { label: 'Our Story', href: '/#story' },
    { label: 'The Craft', href: '/#craft' },
    { label: 'Journal', href: '/#journal' },
];

/** True while the page is scrolled far enough to warrant the compact bar. */
function useScrolled(threshold = 12) {
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > threshold);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [threshold]);

    return scrolled;
}

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const scrolled = useScrolled();

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push('/');
        router.refresh();
    };

    const signInHref = `/signin?callbackUrl=${encodeURIComponent(pathname === '/signin' ? '/shop' : pathname)}`;
    const isActive = (href: string) =>
        href.startsWith('/#') ? false : pathname === href || pathname.startsWith(`${href}/`);

    return (
        <header className="sticky top-0 z-50">
            <div className="flex h-9 items-center justify-center bg-cocoa-900 px-4 text-center">
                <span className="eyebrow text-[0.5625rem] text-ivory/75 sm:text-[0.625rem]">
                    Complimentary delivery on every order · Ready in ten minutes
                </span>
            </div>

            <div
                className={cn(
                    'border-b border-border/70 bg-background/90 backdrop-blur transition-shadow duration-300',
                    scrolled && 'shadow-e-sm'
                )}>
                <div
                    className={cn(
                        'shell grid grid-cols-[1fr_auto_1fr] items-center gap-4 transition-[height] duration-300',
                        scrolled ? 'h-16' : 'h-20 md:h-24'
                    )}>
                    <nav className="hidden md:block" aria-label="Main">
                        <ul className="flex items-center gap-7 lg:gap-9">
                            {navItems.map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        data-active={isActive(item.href)}
                                        className="eyebrow link-grow text-cocoa-600 transition-colors hover:text-cocoa-900 data-[active=true]:text-cocoa-900">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger
                            render={
                                <button
                                    type="button"
                                    aria-label="Open menu"
                                    className="-m-1 justify-self-start p-1 text-cocoa-700 md:hidden"
                                />
                            }>
                            <Menu className="size-5" strokeWidth={1.5} />
                        </SheetTrigger>

                        <SheetContent
                            side="left"
                            className="w-[86%] gap-0 data-[side=left]:sm:max-w-sm">
                            <div className="border-b border-border px-6 py-5">
                                <SheetTitle className="sr-only">Menu</SheetTitle>
                                <SheetDescription className="sr-only">
                                    Browse Chococart
                                </SheetDescription>
                                <Link
                                    href="/"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex flex-col items-start gap-2 text-cocoa-900">
                                    <BrandMark className="h-7 text-gold" />
                                    <Wordmark className="!items-start" />
                                </Link>
                            </div>

                            <nav className="px-6 py-4" aria-label="Mobile">
                                <ul className="divide-y divide-border">
                                    {navItems.map((item) => (
                                        <li key={item.label}>
                                            <SheetClose
                                                render={
                                                    <Link
                                                        href={item.href}
                                                        className="eyebrow block py-4 text-cocoa-700 transition-colors hover:text-cocoa-950"
                                                    />
                                                }>
                                                {item.label}
                                            </SheetClose>
                                        </li>
                                    ))}
                                    <li>
                                        <SheetClose
                                            render={
                                                <Link
                                                    href={session ? '/account/orders' : signInHref}
                                                    className="eyebrow block py-4 text-cocoa-700 transition-colors hover:text-cocoa-950"
                                                />
                                            }>
                                            {session ? 'My orders' : 'Sign in'}
                                        </SheetClose>
                                    </li>
                                </ul>

                                {session && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setMobileOpen(false);
                                            void handleSignOut();
                                        }}
                                        className="eyebrow mt-6 flex items-center gap-2 text-cocoa-500 transition-colors hover:text-cocoa-800">
                                        <LogOut className="size-3.5" />
                                        Sign out
                                    </button>
                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>

                    <Link
                        href="/"
                        className="flex flex-col items-center gap-1.5 text-cocoa-900"
                        aria-label="Chococart home">
                        <BrandMark
                            className={cn(
                                'text-gold transition-all duration-300',
                                scrolled ? 'h-5 opacity-0 md:h-6 md:opacity-100' : 'h-6 md:h-7'
                            )}
                        />
                        <Wordmark tagline={scrolled ? null : 'Artisan Chocolatier'} />
                    </Link>

                    <div className="flex items-center justify-end gap-5 sm:gap-6">
                        <Link
                            href="/shop"
                            aria-label="Search the collection"
                            className="hidden -m-1 p-1 text-cocoa-600 transition-colors hover:text-cocoa-900 sm:block">
                            <Search className="size-[1.05rem]" strokeWidth={1.5} />
                        </Link>

                        {isPending ? (
                            <span
                                aria-hidden="true"
                                className="h-4 w-14 animate-pulse rounded bg-cocoa-100"
                            />
                        ) : session ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <button
                                            type="button"
                                            aria-label="Account menu"
                                            className="eyebrow -m-1 flex items-center gap-2 p-1 text-cocoa-600 transition-colors hover:text-cocoa-900"
                                        />
                                    }>
                                    <User className="size-[1.05rem]" strokeWidth={1.5} />
                                    <span className="hidden lg:inline">Account</span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <span className="block text-[0.8rem] font-medium">
                                            {session.user.name || 'Your account'}
                                        </span>
                                        <span className="block truncate text-[0.7rem] text-muted-foreground">
                                            {session.user.email}
                                        </span>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem render={<Link href="/shop" />}>
                                        <LayoutDashboard className="size-3.5" />
                                        Shop the collection
                                    </DropdownMenuItem>
                                    <DropdownMenuItem render={<Link href="/account/orders" />}>
                                        <Package className="size-3.5" />
                                        My orders
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleSignOut}>
                                        <LogOut className="size-3.5" />
                                        Sign out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link
                                href={signInHref}
                                className="eyebrow -m-1 flex items-center gap-2 p-1 text-cocoa-600 transition-colors hover:text-cocoa-900">
                                <User className="size-[1.05rem] sm:hidden" strokeWidth={1.5} />
                                <span className="hidden sm:inline">Sign in</span>
                            </Link>
                        )}

                        <CartSheet />
                    </div>
                </div>
            </div>
        </header>
    );
}
