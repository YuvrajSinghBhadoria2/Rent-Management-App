import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Room {
    id: string;
    number: string;
    type: string;
    status: 'vacant' | 'occupied' | 'notice_period' | 'under_renovation';
    monthlyRent: number;
    beds?: any[];
}

interface RoomGridProps {
    rooms: Room[];
    buildingId: string;
    buildingType: 'residential' | 'pg_hostel';
}

const statusConfig = {
    vacant: {
        bg: 'bg-green-50 hover:bg-green-100',
        border: 'border-green-200',
        text: 'text-green-800',
        badge: 'bg-green-100 text-green-800 border-green-200',
    },
    occupied: {
        bg: 'bg-blue-50 hover:bg-blue-100',
        border: 'border-blue-200',
        text: 'text-blue-800',
        badge: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    notice_period: {
        bg: 'bg-orange-50 hover:bg-orange-100',
        border: 'border-orange-200',
        text: 'text-orange-800',
        badge: 'bg-orange-100 text-orange-800 border-orange-200',
    },
    under_renovation: {
        bg: 'bg-gray-100 hover:bg-gray-200',
        border: 'border-gray-300',
        text: 'text-gray-600',
        badge: 'bg-gray-200 text-gray-700 border-gray-300',
    },
};

export default function RoomGrid({ rooms, buildingId, buildingType }: RoomGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {rooms.map((room) => {
                const config = statusConfig[room.status];
                const occupiedBeds = room.beds?.filter(b => b.status === 'occupied').length || 0;
                const totalBeds = room.beds?.length || 0;

                return (
                    <TooltipProvider key={room.id}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href={`/buildings/${buildingId}/rooms/${room.id}`}>
                                    <Card className={cn(
                                        "h-32 flex flex-col items-center justify-center p-4 cursor-pointer transition-all border-2",
                                        config.bg,
                                        config.border
                                    )}>
                                        <span className={cn("text-2xl font-bold", config.text)}>
                                            {room.number}
                                        </span>
                                        <span className="text-xs font-medium uppercase mt-1 opacity-70">
                                            {room.type}
                                        </span>

                                        {buildingType === 'pg_hostel' && totalBeds > 0 && (
                                            <div className="mt-2 flex items-center gap-1">
                                                <span className="text-[10px] font-bold">
                                                    {occupiedBeds}/{totalBeds} Beds
                                                </span>
                                                <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary"
                                                        style={{ width: `${(occupiedBeds / totalBeds) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="space-y-1">
                                    <p className="font-bold">Room {room.number}</p>
                                    <p className="text-xs">Status: <span className="capitalize">{room.status.replace('_', ' ')}</span></p>
                                    <p className="text-xs">Rent: ₹{room.monthlyRent}</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            })}
        </div>
    );
}
