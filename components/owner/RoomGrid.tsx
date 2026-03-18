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
        bg: 'bg-emerald-500/5 hover:bg-emerald-500/10',
        border: 'border-emerald-500/20 group-hover:border-emerald-500/40',
        text: 'text-emerald-600 dark:text-emerald-400',
        glow: 'bg-emerald-500/20',
    },
    occupied: {
        bg: 'bg-blue-500/5 hover:bg-blue-500/10',
        border: 'border-blue-500/20 group-hover:border-blue-500/40',
        text: 'text-blue-600 dark:text-blue-400',
        glow: 'bg-blue-500/20',
    },
    notice_period: {
        bg: 'bg-amber-500/5 hover:bg-amber-500/10',
        border: 'border-amber-500/20 group-hover:border-amber-500/40',
        text: 'text-amber-600 dark:text-amber-400',
        glow: 'bg-amber-500/20',
    },
    under_renovation: {
        bg: 'bg-gray-500/5 hover:bg-gray-500/10',
        border: 'border-gray-500/20 group-hover:border-gray-500/40',
        text: 'text-gray-600 dark:text-gray-400',
        glow: 'bg-gray-500/20',
    },
};

export default function RoomGrid({ rooms, buildingId, buildingType }: RoomGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {rooms.map((room) => {
                const config = statusConfig[room.status];
                const occupiedBeds = room.beds?.filter(b => b.status === 'occupied').length || 0;
                const totalBeds = room.beds?.length || 0;

                return (
                    <TooltipProvider key={room.id}>
                        <Tooltip>
                            <TooltipTrigger {...({ asChild: true } as any)}>
                                <Link href={`/buildings/${buildingId}/rooms/${room.id}`} className="group">
                                    <div className={cn(
                                        "relative h-36 rounded-3xl p-5 transition-all duration-300 glass-card border-2 flex flex-col items-center justify-center overflow-hidden",
                                        config.bg,
                                        config.border,
                                        "hover:scale-[1.05] hover:shadow-xl dark:shadow-none animate-fade-in"
                                    )}>
                                        {/* Status Glow Effect */}
                                        <div className={cn(
                                            "absolute -right-8 -top-8 w-20 h-20 rounded-full blur-[40px] opacity-20 transition-all group-hover:opacity-40",
                                            config.glow
                                        )} />

                                        <span className={cn("text-3xl font-black tracking-tighter mb-1", config.text)}>
                                            {room.number}
                                        </span>
                                        <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-500 dark:text-gray-400 text-center">
                                            {room.type.replace('_', ' ')}
                                        </span>

                                        {buildingType === 'pg_hostel' && totalBeds > 0 && (
                                            <div className="mt-4 w-full px-2">
                                                <div className="flex items-center justify-between mb-1.5 px-0.5">
                                                    <span className="text-[10px] font-black text-gray-500">
                                                        {occupiedBeds}/{totalBeds} BEDS
                                                    </span>
                                                    <span className="text-[10px] font-black text-gray-400">
                                                        {Math.round((occupiedBeds / totalBeds) * 100)}%
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full transition-all duration-700 ease-out rounded-full",
                                                            (occupiedBeds / totalBeds) > 0.8 ? "bg-amber-500" : "bg-primary"
                                                        )}
                                                        style={{ width: `${(occupiedBeds / totalBeds) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Bottom Status Indicatior */}
                                        <div className={cn(
                                            "absolute bottom-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
                                            room.status === 'vacant' ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400" :
                                                room.status === 'occupied' ? "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400" :
                                                    room.status === 'notice_period' ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400" :
                                                        "bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-400"
                                        )}>
                                            {room.status.replace('_', ' ')}
                                        </div>
                                    </div>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="rounded-2xl glass-card border-none px-4 py-2">
                                <div className="space-y-1">
                                    <p className="text-sm font-bold">Room {room.number}</p>
                                    <p className="text-[10px] font-medium text-gray-500">Monthly Rent: ₹{room.monthlyRent.toLocaleString('en-IN')}</p>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                );
            })}
        </div>
    );
}
