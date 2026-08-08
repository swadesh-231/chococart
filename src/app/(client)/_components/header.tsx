'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, Package, Search, ShoppingBag, UserRound } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
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
import { cn, initialsOf } from '@/lib/utils';
import { BrandMark, Wordmark } from './brand-mark';
import CartSheet from './cart-sheet';

/** Shown to everyone — these all live on the marketing page. */
const marketingNav = [
    { label: 'Our Story', href: '/#story' },
    { label: 'The Craft', href: '/#craft' },
    { label: 'Journal', href: '/#journal' },
];

/** The catalogue only appears once there is an account to order with. */
const memberNav = [
    { label: 'Shop', href: '/shop' },
    { label: 'My Orders', href: '/account/orders' },
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

    const signedIn = Boolean(session);
    const displayName = session?.user.name?.trim() || session?.user.email || '';

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push('/');
        router.refresh();
    };

    const returnTo = pathname === '/signin' ? '/shop' : pathname;
    const signInHref = `/signin?callbackUrl=${encodeURIComponent(returnTo)}`;
    const signUpHref = `/signin?mode=signup&callbackUrl=${encodeURIComponent(returnTo)}`;

    const navItems = signedIn ? [...memberNav, ...marketingNav] : marketingNav;
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
                        'shell flex items-center gap-4 transition-[height] duration-300 md:gap-9',
                        scrolled ? 'h-16' : 'h-18 md:h-22'
                    )}>
                    {/* Left: the menu on small screens, then the house lockup. */}
                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger
                            render={
                                <button
                                    type="button"
                                    aria-label="Open menu"
                                    className="-m-1 p-1 text-cocoa-700 md:hidden"
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
                                    className="flex items-center gap-2.5 text-cocoa-900">
                                    <BrandMark className="h-7 text-gold" />
                                    <Wordmark className="!items-start" />
                                </Link>
                            </div>

                            <nav className="px-6 py-4" aria-label="Mobile">
                                <ul className="divide-y divide-border">
                                    {navItems.map((item) => (
                                        <li key={item.label}>
                                            <SheetClose
                                                nativeButton={false}
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
                                </ul>

                                {signedIn ? (
                                    <div className="mt-7 flex flex-col items-start gap-5">
                                        <SheetClose
                                            nativeButton={false}
                                            render={
                                                <Link
                                                    href="/account/profile"
                                                    className="eyebrow flex items-center gap-2.5 text-cocoa-700 transition-colors hover:text-cocoa-950"
                                                />
                                            }>
                                            <Avatar className="size-7">
                                                <AvatarImage
                                                    src={session?.user.image ?? undefined}
                                                    alt=""
                                                />
                                                <AvatarFallback className="bg-cocoa-100 text-[0.65rem] font-medium text-cocoa-700">
                                                    {initialsOf(displayName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            My profile
                                        </SheetClose>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMobileOpen(false);
                                                void handleSignOut();
                                            }}
                                            className="eyebrow flex items-center gap-2 text-cocoa-500 transition-colors hover:text-cocoa-800">
                                            <LogOut className="size-3.5" />
                                            Sign out
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-7 flex flex-col gap-3">
                                        <SheetClose
                                            nativeButton={false}
                                            render={
                                                <Link
                                                    href={signUpHref}
                                                    className="eyebrow flex h-12 items-center justify-center bg-cocoa-800 text-ivory transition-colors hover:bg-cocoa-900"
                                                />
                                            }>
                                            Create account
                                        </SheetClose>
                                        <SheetClose
                                            nativeButton={false}
                                            render={
                                                <Link
                                                    href={signInHref}
                                                    className="eyebrow flex h-12 items-center justify-center border border-cocoa-800 text-cocoa-800 transition-colors hover:bg-cocoa-800 hover:text-ivory"
                                                />
                                            }>
                                            Sign in
                                        </SheetClose>
                                    </div>
                                )}
                            </nav>
                        </SheetContent>
                    </Sheet>

                    <Link
                        href="/"
                        className="flex shrink-0 items-center gap-2.5 text-cocoa-900"
                        aria-label="Chococart home">
                        <BrandMark
                            className={cn(
                                'text-gold transition-all duration-300',
                                scrolled ? 'h-6' : 'h-6 md:h-7'
                            )}
                        />
                        <Wordmark
                            className="!items-start"
                            tagline={scrolled ? null : 'Artisan Chocolatier'}
                        />
                    </Link>

                    {/* Middle: navigation, which grows once there is an account. */}
                    <nav className="hidden md:block" aria-label="Main">
                        <ul className="flex items-center gap-7 lg:gap-9">
                            {navItems.map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        data-active={isActive(item.href)}
                                        className="eyebrow link-grow whitespace-nowrap text-cocoa-600 transition-colors hover:text-cocoa-900 data-[active=true]:text-cocoa-900">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Right: account, and the bag once there is somewhere to send it. */}
                    <div className="ml-auto flex shrink-0 items-center gap-4 sm:gap-5">
                        {isPending ? (
                            <span
                                aria-hidden="true"
                                className="h-4 w-24 animate-pulse rounded bg-cocoa-100"
                            />
                        ) : signedIn ? (
                            <>
                                <Link
                                    href="/shop"
                                    aria-label="Search the collection"
                                    className="-m-1 hidden p-1 text-cocoa-600 transition-colors hover:text-cocoa-900 sm:block">
                                    <Search className="size-[1.05rem]" strokeWidth={1.5} />
                                </Link>

                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        render={
                                            <button
                                                type="button"
                                                aria-label="Account menu"
                                                className="eyebrow -m-1 flex items-center gap-2 rounded-full p-1 text-cocoa-600 transition-colors hover:text-cocoa-900"
                                            />
                                        }>
                                        <Avatar className="size-7 ring-1 ring-cocoa-200 transition-shadow hover:ring-gold">
                                            <AvatarImage
                                                src={session?.user.image ?? undefined}
                                                alt=""
                                            />
                                            <AvatarFallback className="bg-cocoa-100 text-[0.65rem] font-medium tracking-wide text-cocoa-700">
                                                {initialsOf(displayName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="hidden lg:inline">Account</span>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-60">
                                        {/* Base UI requires a Group around every GroupLabel. */}
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel className="flex items-center gap-2.5 px-1.5 py-2">
                                                <Avatar className="size-8">
                                                    <AvatarImage
                                                        src={session?.user.image ?? undefined}
                                                        alt=""
                                                    />
                                                    <AvatarFallback className="bg-cocoa-100 text-[0.7rem] font-medium text-cocoa-700">
                                                        {initialsOf(displayName)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="min-w-0">
                                                    <span className="block truncate text-[0.8rem] font-medium text-cocoa-800">
                                                        {session?.user.name || 'Your account'}
                                                    </span>
                                                    <span className="block truncate text-[0.7rem] font-normal text-muted-foreground">
                                                        {session?.user.email}
                                                    </span>
                                                </span>
                                            </DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                nativeButton={false}
                                                render={<Link href="/account/profile" />}>
                                                <UserRound className="size-3.5" />
                                                My profile
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                nativeButton={false}
                                                render={<Link href="/shop" />}>
                                                <ShoppingBag className="size-3.5" />
                                                Shop the collection
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                nativeButton={false}
                                                render={<Link href="/account/orders" />}>
                                                <Package className="size-3.5" />
                                                My orders
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleSignOut}>
                                            <LogOut className="size-3.5" />
                                            Sign out
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* The bag belongs to people who can actually check out. */}
                                <CartSheet />
                            </>
                        ) : pathname === '/signin' ? null : (
                            <>
                                <Link
                                    href={signInHref}
                                    className="eyebrow hidden text-cocoa-600 transition-colors hover:text-cocoa-900 sm:block">
                                    Sign in
                                </Link>
                                <Link
                                    href={signUpHref}
                                    className="eyebrow flex items-center justify-center bg-cocoa-800 px-5 py-3 text-ivory transition-colors hover:bg-cocoa-900">
                                    <span className="hidden sm:inline">Sign up</span>
                                    <span className="sm:hidden">Sign in</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
