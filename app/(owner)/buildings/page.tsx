'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Loader2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BuildingCard from '@/components/owner/BuildingCard';
import { toast } from 'sonner';

export default function BuildingsPage() {
    const [buildings, setBuildings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchBuildings();
    }, []);

    async function fetchBuildings() {
        try {
            const response = await fetch('/api/buildings');
            const result = await response.json();
            if (result.success) {
                setBuildings(result.data);
            } else {
                toast.error(result.error || 'Failed to fetch buildings');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">Portfolio</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">
                        Manage your real estate assets and property units.
                    </p>
                </div>
                <Button asChild className="rounded-full px-8 h-12 font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95">
                    <Link href="/buildings/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Building
                    </Link>
                </Button>
            </div>

            {isLoading ? (
                <div className="flex h-80 items-center justify-center">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-primary opacity-50" />
                        </div>
                    </div>
                </div>
            ) : buildings.length > 0 ? (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {buildings.map((building) => (
                        <BuildingCard key={building.id} building={building} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center min-h-[500px] glass-card rounded-[3rem] text-center p-16 space-y-8">
                    <div className="relative">
                        <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full" />
                        <div className="relative bg-white dark:bg-black/40 p-6 rounded-[2rem] border border-primary/10 shadow-xl">
                            <Building2 className="h-12 w-12 text-primary" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-2xl font-black tracking-tight dark:text-white">Your Portfolio is Empty</h3>
                        <p className="text-gray-400 max-w-sm mx-auto font-medium">
                            Add your first residential project or PG building to start managing inventory and tracking revenue.
                        </p>
                    </div>
                    <Button asChild className="rounded-full px-10 h-14 font-black text-xs uppercase tracking-[0.2em] shadow-2xl">
                        <Link href="/buildings/new">
                            <Plus className="mr-3 h-5 w-5" />
                            Initialize Portfolio
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
