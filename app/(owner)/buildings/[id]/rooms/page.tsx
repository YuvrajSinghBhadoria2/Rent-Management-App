'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Plus,
    Loader2,
    ArrowLeft,
    Building2,
    LayoutGrid,
    Filter
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RoomGrid from '@/components/owner/RoomGrid';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function RoomsPage() {
    const router = useRouter();
    const { id: buildingId } = useParams();
    const [building, setBuilding] = useState<any>(null);
    const [rooms, setRooms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [buildingId]);

    async function fetchData() {
        try {
            const [bRes, rRes] = await Promise.all([
                fetch(`/api/buildings/${buildingId}`),
                fetch(`/api/rooms?buildingId=${buildingId}`)
            ]);

            const bData = await bRes.json();
            const rData = await rRes.json();

            if (bData.success) setBuilding(bData.data);
            if (rData.success) setRooms(rData.data);

            if (!bData.success || !rData.success) {
                toast.error('Failed to fetch data');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    }

    const filteredRooms = filter
        ? rooms.filter(r => r.status === filter)
        : rooms;

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/buildings/${buildingId}`)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight">Rooms</h1>
                            <Badge variant="outline" className="h-fit">
                                {rooms.length} Total
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">{building?.name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Filter className="mr-2 h-4 w-4" />
                                {filter ? filter.replace('_', ' ').toUpperCase() : 'All Status'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setFilter(null)}>All Status</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilter('vacant')}>Vacant</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilter('occupied')}>Occupied</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilter('notice_period')}>Notice Period</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setFilter('under_renovation')}>Renovation</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button asChild>
                        <Link href={`/buildings/${buildingId}/rooms/new`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Room
                        </Link>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <LayoutGrid className="h-5 w-5 text-primary" />
                            Room Status Grid
                        </CardTitle>
                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-100 border border-green-200" /> Vacant</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-200" /> Occupied</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-orange-100 border border-orange-200" /> Notice</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-gray-200 border border-gray-300" /> Renovation</div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredRooms.length > 0 ? (
                        <RoomGrid
                            rooms={filteredRooms}
                            buildingId={buildingId as string}
                            buildingType={building?.type}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-lg">
                            <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                            <h3 className="text-lg font-medium">No rooms found</h3>
                            <p className="text-muted-foreground max-w-xs mt-1">
                                {filter
                                    ? `There are no rooms with the status "${filter.replace('_', ' ')}".`
                                    : "Start by adding rooms to this building to manage your property."}
                            </p>
                            {!filter && (
                                <Button variant="outline" className="mt-6" asChild>
                                    <Link href={`/buildings/${buildingId}/rooms/new`}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Your First Room
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
