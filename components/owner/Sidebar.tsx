'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Building2,
    Users,
    Receipt,
    AlertCircle,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Zap,
    TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Buildings', href: '/buildings', icon: Building2 },
    { label: 'Tenants', href: '/tenants', icon: Users },
    { label: 'Billing', href: '/billing', icon: Receipt },
    { label: 'Broadcast', href: '/broadcast', icon: Zap },
    { label: 'Increments', href: '/increments', icon: TrendingUp },
    { label: 'Complaints', href: '/complaints', icon: AlertCircle },
    { label: 'Reports', href: '/reports', icon: BarChart3 },
    { label: 'Notifications', href: '/settings/notifications', icon: Bell },
    { label: 'Settings', href: '/settings', icon: Settings },
];

export function SidebarContent({ onNavItemClick }: { onNavItemClick?: () => void }) {
    const pathname = usePathname();
    const { userDoc, signOut } = useAuth();

    return (
        <div className="flex flex-col h-full bg-white dark:bg-black/60 dark:backdrop-blur-xl border-r border-gray-100 dark:border-white/10">
            <div className="p-6">
                <Link href="/dashboard" className="flex items-center gap-1 group">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">Rent</span>
                    <span className="text-2xl font-bold text-primary">Flow</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 space-y-1.5">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative",
                                isActive
                                    ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground shadow-[inset_0_0_0_1px_rgba(59,130,246,0.1)]"
                                    : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
                            )}
                            onClick={() => onNavItemClick?.()}
                        >
                            <item.icon className={cn(
                                "h-4 w-4 transition-transform group-hover:scale-110",
                                isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                            )} />
                            <span className="text-sm font-medium">{item.label}</span>
                            {isActive && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 mt-auto border-t border-gray-100 dark:border-white/10">
                <div className="flex items-center gap-3 mb-4 px-2 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                    <Avatar className="h-9 w-9 border border-primary/20 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                        <AvatarImage src={userDoc?.profilePhotoUrl || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {userDoc?.name?.[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col truncate">
                        <span className="text-sm font-semibold truncate dark:text-white">{userDoc?.name}</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Owner</span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl px-3"
                    onClick={() => signOut()}
                >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="text-sm font-medium">Logout</span>
                </Button>
            </div>
        </div>
    );
}

export default function Sidebar() {
    return (
        <aside className="hidden md:block w-[220px] h-screen shrink-0 sticky top-0 bg-white dark:bg-black/60 dark:backdrop-blur-xl border-r border-gray-100 dark:border-white/10">
            <SidebarContent />
        </aside>
    );
}
