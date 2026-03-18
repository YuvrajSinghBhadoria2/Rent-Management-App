'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { Loader2, LogOut, User, Bell, Home, FileText, Receipt, MessageSquare, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const navItems = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/room', label: 'My Room', icon: Home },
    { href: '/lease', label: 'My Lease', icon: FileText },
    { href: '/bills', label: 'Bills', icon: Receipt },
    { href: '/tenant-complaints', label: 'Complaints', icon: MessageSquare },
    { href: '/profile', label: 'Profile', icon: User },
];

export default function TenantLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, userDoc, loading, signOut } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [loading, user, router]);

    const handleSignOut = async () => {
        setIsLoggingOut(true);
        try {
            await signOut();
            toast.success('Logged out successfully');
            router.push('/login');
        } catch {
            toast.error('Failed to logout');
        } finally {
            setIsLoggingOut(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <header className="bg-white border-b sticky top-0 z-50">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Link href="/home" className="text-xl font-bold text-primary">
                                RentFlow
                            </Link>
                            <nav className="hidden md:flex items-center gap-6">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'text-sm font-medium transition-colors hover:text-primary',
                                            pathname === item.href
                                                ? 'text-primary'
                                                : 'text-muted-foreground'
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/notifications">
                                    <Bell className="h-5 w-5" />
                                </Link>
                            </Button>
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                                    {userDoc?.name?.charAt(0) || 'U'}
                                </div>
                                <span className="hidden sm:block text-sm font-medium">
                                    {userDoc?.name}
                                </span>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={handleSignOut}
                                disabled={isLoggingOut}
                            >
                                {isLoggingOut ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <LogOut className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
                <div className="flex items-center justify-around py-2">
                    {navItems.slice(0, 5).map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center gap-1 px-3 py-2 text-xs',
                                pathname === item.href
                                    ? 'text-primary'
                                    : 'text-muted-foreground'
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
                {children}
            </main>
        </div>
    );
}
