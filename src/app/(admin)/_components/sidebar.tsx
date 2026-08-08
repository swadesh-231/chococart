'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { BrandMark } from '@/app/(client)/_components/brand-mark';
import { adminNavItems, isActive } from './nav-items';

const Sidebar = () => {
    const pathname = usePathname();

    return (
        <aside className="hidden border-r border-cocoa-800/60 bg-cocoa-900 text-ivory md:block">
            <div className="sticky top-0 flex h-screen max-h-screen flex-col">
                <div className="flex h-20 items-center gap-3 border-b border-ivory/10 px-6">
                    <BrandMark className="h-7 text-gold" />
                    <span className="flex flex-col leading-none">
                        <span className="font-heading text-lg font-semibold tracking-[0.2em] uppercase">
                            Chococart
                        </span>
                        <span className="eyebrow mt-1 text-[0.55rem] text-gold">Atelier</span>
                    </span>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-6">
                    <p className="eyebrow px-3 pb-3 text-[0.6rem] text-ivory/40">Manage</p>
                    <ul className="grid gap-1">
                        {adminNavItems.map((item) => {
                            const active = isActive(pathname, item.href);
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        aria-current={active ? 'page' : undefined}
                                        className={cn(
                                            'group relative flex items-center gap-3 rounded-sm px-3 py-2.5 text-[0.85rem] transition-colors',
                                            active
                                                ? 'bg-ivory/10 text-ivory'
                                                : 'text-ivory/60 hover:bg-ivory/5 hover:text-ivory'
                                        )}>
                                        {active && (
                                            <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-gold" />
                                        )}
                                        <item.icon
                                            className={cn(
                                                'size-[1.05rem] transition-colors',
                                                active
                                                    ? 'text-gold'
                                                    : 'text-ivory/45 group-hover:text-ivory/80'
                                            )}
                                            strokeWidth={1.5}
                                        />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="border-t border-ivory/10 px-6 py-5">
                    <Link
                        href="/"
                        className="eyebrow text-[0.6rem] text-ivory/50 transition-colors hover:text-gold">
                        ← Back to storefront
                    </Link>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
