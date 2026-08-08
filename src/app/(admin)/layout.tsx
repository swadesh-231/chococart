import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CircleUser, Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { BrandMark } from '@/app/(client)/_components/brand-mark';
import { getAppUser } from '@/lib/auth/session';
import { ADMIN_HOME, adminNavItems } from './_components/nav-items';
import Sidebar from './_components/sidebar';
import Signout from './_components/signout';

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
    // The proxy only checks that a session cookie exists; the real role check
    // happens here, where the database is reachable.
    const appUser = await getAppUser();

    if (!appUser) {
        redirect(`/signin?callbackUrl=${encodeURIComponent(ADMIN_HOME)}`);
    }
    if (appUser.role !== 'admin') {
        redirect('/');
    }

    return (
        <div className="grid min-h-screen w-full bg-ivory-dim md:grid-cols-[248px_1fr] lg:grid-cols-[276px_1fr]">
            <Sidebar />

            <div className="flex min-w-0 flex-col">
                <header className="sticky top-0 z-40 flex h-20 items-center gap-4 border-b border-border bg-background/95 px-5 backdrop-blur lg:px-8">
                    <Sheet>
                        <SheetTrigger
                            render={
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="shrink-0 md:hidden"
                                />
                            }>
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </SheetTrigger>
                        <SheetContent
                            side="left"
                            className="flex flex-col bg-cocoa-900 text-ivory">
                            <nav className="grid gap-1 p-5">
                                <Link
                                    href="/"
                                    className="mb-5 flex items-center gap-3 text-ivory">
                                    <BrandMark className="h-7 text-gold" />
                                    <span className="font-heading text-lg font-semibold tracking-[0.2em] uppercase">
                                        Chococart
                                    </span>
                                </Link>
                                {adminNavItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-3 rounded-sm px-3 py-2.5 text-[0.9rem] text-ivory/70 transition-colors hover:bg-ivory/10 hover:text-ivory">
                                        <item.icon className="size-[1.05rem]" strokeWidth={1.5} />
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>

                    <div className="min-w-0 flex-1">
                        <p className="eyebrow text-[0.6rem] text-cocoa-500">Atelier</p>
                        <p className="truncate font-heading text-lg font-medium text-cocoa-800">
                            Welcome back, {appUser.fname}
                        </p>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button variant="outline" size="icon" className="rounded-full" />
                            }>
                            <CircleUser className="h-5 w-5" />
                            <span className="sr-only">Toggle user menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {/* Base UI requires a Group around every GroupLabel. */}
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>
                                    <span className="block text-[0.8rem] font-medium">
                                        {appUser.fname} {appUser.lname}
                                    </span>
                                    <span className="block text-[0.7rem] text-muted-foreground">
                                        {appUser.email}
                                    </span>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem nativeButton={false} render={<Link href="/" />}>
                                    View storefront
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    nativeButton={false}
                                    render={<Link href="/account/profile" />}>
                                    My profile
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    nativeButton={false}
                                    render={<Link href="/account/orders" />}>
                                    My orders
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <Signout>Logout</Signout>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                <main className="flex flex-1 flex-col gap-6 px-5 py-8 lg:px-8">{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;
