'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface RoomData {
    id: string;
    number: string;
    name: string | null;
    floor: number;
    type: string;
    status: string;
    monthlyRent: number;
    amenities: {
        ac: boolean;
        wifi: boolean;
        attachedBath: boolean;
        geyser: boolean;
        parking: boolean;
        tv: boolean;
        fridge: boolean;
        washingMachine: boolean;
    };
    buildingName: string;
}

export default function TenantRoomPage() {
    const [room, setRoom] = useState<RoomData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchRoom() {
            try {
                const response = await fetch('/api/tenant/room');
                const result = await response.json();
                if (result.success) {
                    setRoom(result.data);
                }
            } catch (error) {
                console.error('Error fetching room:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchRoom();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-60 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!room) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">My Room</h1>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <p className="text-muted-foreground">No room assigned yet</p>
                        <p className="text-sm text-muted-foreground">Contact your owner for room assignment</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const amenityLabels: Record<string, string> = {
        ac: 'AC',
        wifi: 'WiFi',
        attachedBath: 'Attached Bathroom',
        geyser: 'Geyser',
        parking: 'Parking',
        tv: 'TV',
        fridge: 'Fridge',
        washingMachine: 'Washing Machine',
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">My Room</h1>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Room Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Room Number</span>
                            <span className="font-medium">{room.number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Building</span>
                            <span className="font-medium">{room.buildingName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Floor</span>
                            <span className="font-medium">{room.floor}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Type</span>
                            <span className="font-medium capitalize">{room.type}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <span className={`font-medium capitalize ${
                                room.status === 'occupied' ? 'text-green-600' : 'text-orange-600'
                            }`}>
                                {room.status}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Monthly Rent</span>
                            <span className="font-medium">₹{room.monthlyRent.toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Amenities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.entries(room.amenities).map(([key, value]) => (
                                <div 
                                    key={key} 
                                    className={`flex items-center gap-2 p-2 rounded ${
                                        value ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'
                                    }`}
                                >
                                    <span className="text-sm">{amenityLabels[key] || key}</span>
                                    {value ? (
                                        <svg className="h-4 w-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="h-4 w-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
