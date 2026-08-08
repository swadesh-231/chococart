import { Blocks, LayoutDashboard, Layers, ShoppingCart, Users, Warehouse } from 'lucide-react';

/**
 * `(admin)` is a route group, so it adds no URL segment — these paths are the
 * real top-level URLs. Shared by the desktop sidebar (client) and the mobile
 * sheet in the layout (server), so it lives outside the 'use client' module.
 */
export const adminNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Products', href: '/products', icon: Layers },
    { label: 'Warehouses', href: '/warehouses', icon: Warehouse },
    { label: 'Delivery Persons', href: '/delivery-persons', icon: Users },
    { label: 'Orders', href: '/orders', icon: ShoppingCart },
    { label: 'Inventories', href: '/inventories', icon: Blocks },
];

/** The landing page for a signed-in admin. */
export const ADMIN_HOME = '/dashboard';

export function isActive(pathname: string, href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
}
