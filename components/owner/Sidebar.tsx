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
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Buildings', href: '/buildings', icon: Building2 },
    { label: 'Tenants', href: '/tenants', icon: Users },
    { label: 'Billing', href: '/billing', icon: Receipt },
    { label: 'Complaints', href: '/complaints', icon: AlertCircle },
    { label: 'Reports', href: '/reports', icon: BarChart3 },
    { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { userDoc, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const NavContent = () => (
        <div className="flex flex-col h-full bg-white border-r">
            <div className="p-6">
                <h1 className="text-2xl font-bold text-primary">RentFlow</h1>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-gray-100"
                            )}
                            onClick={() => setIsOpen(false)}
                        >
                            <item.icon className="h-5 w-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t">
                <div className="flex items-center gap-3 mb-4 px-2">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={userDoc?.profilePhotoUrl || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {userDoc?.name?.[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col truncate">
                        <span className="text-sm font-semibold truncate">{userDoc?.name}</span>
                        <span className="text-xs text-muted-foreground truncate font-medium">Owner</span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => signOut()}
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                </Button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Nav Trigger */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b flex items-center px-4 z-40">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72">
                        <NavContent />
                    </SheetContent>
                </Sheet>
                <span className="ml-4 text-xl font-bold text-primary">RentFlow</span>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 h-screen shrink-0">
                <NavContent />
            </aside>
        </>
    );
}
