'use client';

import { usePathname } from 'next/navigation';
import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarContent } from './Sidebar';
import { NotificationBell } from './NotificationBell';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/buildings': 'Buildings',
    '/tenants': 'Tenants',
    '/billing': 'Billing & Payments',
    '/complaints': 'Complaints',
    '/reports': 'Business Reports',
    '/settings': 'Account Settings',
    '/broadcast': 'Broadcast',
    '/increments': 'Rent Increments',
};

export function Topbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Find the title for the current route, handling dynamic routes
    const getTitle = () => {
        if (pathname.startsWith('/buildings/') && pathname.includes('/rooms/')) return 'Room Details';
        if (pathname.startsWith('/buildings/')) return 'Building Details';
        if (pathname.startsWith('/tenants/')) return 'Tenant Profile';
        if (pathname.startsWith('/complaints/')) return 'Complaint Details';
        if (pathname.startsWith('/bills/')) return 'Bill Details';

        const exactMatch = Object.entries(pageTitles).find(([route]) => pathname === route);
        if (exactMatch) return exactMatch[1];

        const prefixMatch = Object.entries(pageTitles).find(([route]) =>
            route !== '/dashboard' && pathname.startsWith(route)
        );
        return prefixMatch ? prefixMatch[1] : 'RentFlow';
    };

    return (
        <header className="fixed top-0 right-0 left-0 md:left-[220px] h-14 z-40 bg-white/60 dark:bg-black/40 backdrop-blur-xl border-b border-gray-100 dark:border-white/10 transition-all duration-300">
            <div className="h-full px-4 md:px-8 flex items-center justify-between gap-4">
                {/* Mobile Menu & Logo */}
                <div className="flex items-center gap-3 md:hidden">
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger
                            render={
                                <Button variant="ghost" size="icon" className="hover:bg-primary/10 rounded-xl shrink-0">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            }
                        />
                        <SheetContent side="left" className="p-0 w-[220px] dark:border-white/10 bg-transparent">
                            <SidebarContent onNavItemClick={() => setIsMobileMenuOpen(false)} />
                        </SheetContent>
                    </Sheet>
                    <div className="flex items-center gap-0.5">
                        <span className="text-lg font-bold text-gray-900 dark:text-white">Rent</span>
                        <span className="text-lg font-bold text-primary">Flow</span>
                    </div>
                </div>

                {/* Page Title (Desktop) */}
                <h2 className="hidden md:block text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {getTitle()}
                </h2>

                {/* Actions */}
                <div className="flex items-center gap-2 md:gap-4 flex-1 justify-end max-w-2xl">
                    <div className="relative group hidden sm:block flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Global Search..."
                            className="bg-gray-100/50 dark:bg-white/5 border-transparent focus:border-primary/20 h-9 pl-9 rounded-xl text-xs font-medium placeholder:text-gray-400 transition-all focus:ring-0"
                        />
                    </div>

                    <div className="flex items-center gap-1 md:gap-2">
                        <NotificationBell />

                        {/* Divider */}
                        <div className="h-4 w-px bg-gray-200 dark:bg-white/10 mx-1 hidden md:block" />

                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 leading-none mb-1">Status</span>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                <span className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-tight">Live</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
