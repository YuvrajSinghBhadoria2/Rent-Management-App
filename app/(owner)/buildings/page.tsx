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
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Buildings</h1>
                    <p className="text-muted-foreground">
                        Manage your properties and allocate rooms.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/buildings/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Building
                    </Link>
                </Button>
            </div>

            {isLoading ? (
                <div className="flex h-60 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : buildings.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {buildings.map((building) => (
                        <BuildingCard key={building.id} building={building} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-80 bg-white rounded-lg border border-dashed text-center p-12">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <Building2 className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">No buildings yet</h3>
                    <p className="text-muted-foreground max-w-sm mt-2 mb-6">
                        You haven&apos;t added any buildings to your portfolio yet. Add your first building to start managing rooms and tenants.
                    </p>
                    <Button asChild>
                        <Link href="/buildings/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Your First Building
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
