'use client';

import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/components/owner/Sidebar';
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
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto overflow-x-hidden pt-16 md:pt-0">
                <div className="container mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
