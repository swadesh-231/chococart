'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, Package, Search, UserRound } from 'lucide-react';

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
import { categoryLabel, PRODUCT_CATEGORIES } from '@/lib/categories';
import { cn, initialsOf } from '@/lib/utils';
import { BrandMark, Wordmark } from './brand-mark';
import CartSheet from './cart-sheet';

/**
 * Signed out, the bar sells the house: these all live on the landing page, and
 * the sign-in and sign-up buttons sit on the right.
 */
const marketingNav = [
    { label: 'Shop', href: '/shop' },
    { label: 'Collections', href: '/shop?category=gift-box' },
    { label: 'Our Story', href: '/#story' },
];

/**
 * Signed in there is no marketing left in the bar — an account holder came to
 * buy chocolate, not to read the story again. What they get instead is the
 * shelf itself, so any type is one click away from any page.
 */
const memberNav = [
    { label: 'All', href: '/shop' },
    ...PRODUCT_CATEGORIES.map((category) => ({
        label: categoryLabel(category),
        href: `/shop?category=${category}`,
    })),
];

/** True while the page is scrolled far enough to warrant the solid bar. */
function useScrolled(threshold = 24) {
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

    // Only the landing page opens on a hero for the bar to float over; every
    // other page starts at the top of its own content and needs the bar solid
    // and in flow from the first pixel.
    const overHero = pathname === '/';
    const transparent = overHero && !scrolled && !mobileOpen;

    const handleSignOut = async () => {
        await authClient.signOut();
        router.push('/');
        router.refresh();
    };

    // Signing in from the marketing pages is a shopper heading for the
    // catalogue; anywhere else, put them back where they were.
    const returnTo = pathname === '/signin' || pathname === '/' ? '/shop' : pathname;
    const signInHref = `/signin?callbackUrl=${encodeURIComponent(returnTo)}`;
    const signUpHref = `/signin?mode=signup&callbackUrl=${encodeURIComponent(returnTo)}`;

    const navItems = signedIn ? memberNav : marketingNav;

    // Signed in, the lockup goes to the shop, not the marketing page — that is
    // the home of someone who already has an account.
    const homeHref = signedIn ? '/shop' : '/';

    const isActive = (href: string) => {
        if (href.startsWith('/#')) return false;
        // Category links differ only by query string, which `pathname` drops,
        // so only the bare /shop link can be matched on path alone.
        if (href.includes('?')) return false;
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    return (
        <header
            className={cn(
                'z-50 w-full transition-colors duration-500',
                overHero ? 'fixed inset-x-0 top-0' : 'sticky top-0',
                transparent
                    ? 'border-b border-transparent bg-transparent'
                    : 'border-b border-border bg-ivory/92 backdrop-blur'
            )}>
            <div
                className={cn(
                    'shell grid grid-cols-[1fr_auto_1fr] items-center gap-4 transition-[height] duration-500',
                    transparent ? 'h-20 md:h-24' : 'h-16 md:h-20'
                )}>
                {/* Left: the menu on small screens, then the house lockup. */}
                <div className="flex items-center gap-3">
                    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                        <SheetTrigger
                            render={
                                <button
                                    type="button"
                                    aria-label="Open menu"
                                    className="-m-1 p-1 text-cocoa-700 transition-colors hover:text-cocoa-950 lg:hidden"
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
                                    href={homeHref}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-2.5 text-cocoa-950">
                                    <BrandMark className="h-7 text-caramel" />
                                    <Wordmark className="!items-start" tagline={null} />
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
                                        <SheetClose
                                            nativeButton={false}
                                            render={
                                                <Link
                                                    href="/account/orders"
                                                    className="eyebrow flex items-center gap-2.5 text-cocoa-700 transition-colors hover:text-cocoa-950"
                                                />
                                            }>
                                            <Package className="size-3.5" />
                                            My orders
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
                                                    className="eyebrow flex h-12 items-center justify-center bg-cocoa-950 text-ivory transition-colors hover:bg-cocoa-800"
                                                />
                                            }>
                                            Create account
                                        </SheetClose>
                                        <SheetClose
                                            nativeButton={false}
                                            render={
                                                <Link
                                                    href={signInHref}
                                                    className="eyebrow flex h-12 items-center justify-center border border-cocoa-950 text-cocoa-950 transition-colors hover:bg-cocoa-950 hover:text-ivory"
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
                        href={homeHref}
                        className="flex shrink-0 items-center gap-2.5 text-cocoa-950"
                        aria-label={signedIn ? 'Chococart shop' : 'Chococart home'}>
                        <BrandMark
                            className={cn(
                                'text-caramel transition-all duration-500',
                                transparent ? 'h-6 md:h-7' : 'h-6'
                            )}
                        />
                        <Wordmark className="!items-start" tagline={null} />
                    </Link>
                </div>

                {/* Middle: the house links signed out, the shelf signed in. */}
                <nav className="hidden lg:block" aria-label="Main">
                    <ul
                        className={cn(
                            'flex items-center',
                            // Six types need to sit closer together than three
                            // marketing links do.
                            signedIn ? 'gap-6 xl:gap-7' : 'gap-8 lg:gap-10'
                        )}>
                        {navItems.map((item) => (
                            <li key={item.label}>
                                <Link
                                    href={item.href}
                                    data-active={isActive(item.href)}
                                    className="eyebrow link-grow whitespace-nowrap text-cocoa-600 transition-colors hover:text-cocoa-950 data-[active=true]:text-cocoa-950">
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Right: signed in, search / account / bag. Signed out, the
                    two ways to get an account. Pinned to the third column —
                    below lg the nav is `display:none`, which drops it out of
                    the grid entirely and would otherwise auto-place these in
                    the middle track. */}
                <div className="col-start-3 flex items-center justify-end gap-4 sm:gap-5">
                    {isPending ? (
                        <span
                            aria-hidden="true"
                            className="h-4 w-24 animate-pulse rounded bg-cocoa-200"
                        />
                    ) : signedIn ? (
                        <>
                            {/* Icons, not words: the bar already carries six
                                type links, and three more labels beside them
                                turns the whole thing into a wall of text. */}
                            <Link
                                href="/shop"
                                aria-label="Search the collection"
                                className="-m-1 flex items-center p-1 text-cocoa-600 transition-colors hover:text-cocoa-950">
                                <Search className="size-[1.15rem]" strokeWidth={1.5} />
                            </Link>

                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <button
                                            type="button"
                                            aria-label="Account menu"
                                            className="-m-1 flex items-center p-1"
                                        />
                                    }>
                                    <Avatar className="size-7 ring-1 ring-cocoa-200 transition-shadow hover:ring-caramel">
                                        <AvatarImage
                                            src={session?.user.image ?? undefined}
                                            alt=""
                                        />
                                        <AvatarFallback className="bg-cream text-[0.65rem] font-medium tracking-wide text-cocoa-700">
                                            {initialsOf(displayName)}
                                        </AvatarFallback>
                                    </Avatar>
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
                                                <AvatarFallback className="bg-cream text-[0.7rem] font-medium text-cocoa-700">
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
                                        {/* Order history lives here rather than
                                            in the bar — it is an account errand,
                                            not a way to shop. */}
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

                            {/* The bag belongs to people who can check out. */}
                            <CartSheet />
                        </>
                    ) : pathname === '/signin' ? null : (
                        <>
                            <Link
                                href={signInHref}
                                className="eyebrow hidden text-cocoa-600 transition-colors hover:text-cocoa-950 sm:block">
                                Sign in
                            </Link>
                            <Link
                                href={signUpHref}
                                className="eyebrow flex items-center justify-center bg-cocoa-950 px-5 py-3 text-ivory transition-colors hover:bg-cocoa-800">
                                <span className="hidden sm:inline">Sign up</span>
                                <span className="sm:hidden">Sign in</span>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
