'use client';

import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/owner/Sidebar';
import { Topbar } from '@/components/owner/Topbar';
import { Loader2 } from 'lucide-react';

export default function OwnerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, userDoc, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    // Double check role protection (middleware also handles this)
    if (!user || userDoc?.role !== 'owner') {
        return null; // Let middleware handle redirect
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-[#050505] dark:mesh-gradient overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Topbar />
                <main className="flex-1 overflow-y-auto overflow-x-hidden relative pt-14">
                    {/* Fixed background effect for main content */}
                    <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                    <div className="container mx-auto p-4 md:p-8 relative z-10 animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
