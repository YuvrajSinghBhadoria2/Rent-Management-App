import Link from 'next/link';
import { Building2, MapPin, Layers, LayoutGrid } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";

interface BuildingCardProps {
    building: {
        id: string;
        name: string;
        address: string;
        type: 'residential' | 'pg_hostel';
        totalFloors: number;
        photoUrl: string | null;
    };
}

export default function BuildingCard({ building }: BuildingCardProps) {
    return (
        <div className="group relative glass-card rounded-[2.5rem] overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl dark:shadow-none animate-fade-in">
            <div className="h-48 bg-gray-100 dark:bg-white/5 relative overflow-hidden">
                {building.photoUrl ? (
                    <img
                        src={building.photoUrl}
                        alt={building.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-white/10">
                        <Building2 className="h-16 w-16" />
                    </div>
                )}
                <div className="absolute top-4 right-4">
                    <Badge className={cn(
                        "rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-none shadow-lg",
                        building.type === 'pg_hostel' ? "bg-blue-500 text-white" : "bg-emerald-500 text-white"
                    )}>
                        {building.type.replace('_', ' ')}
                    </Badge>
                </div>
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            <div className="p-8 space-y-6">
                <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">
                        {building.name}
                    </h3>
                    <div className="flex items-start gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-1">{building.address}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex flex-col gap-1">
                        <Layers className="h-4 w-4 text-primary" />
                        <span className="text-lg font-black dark:text-white">{building.totalFloors}</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Floors</span>
                    </div>
                    <div className="p-4 rounded-3xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex flex-col gap-1">
                        <LayoutGrid className="h-4 w-4 text-primary" />
                        <span className="text-lg font-black dark:text-white">Active</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Inventory</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="ghost" className="flex-1 rounded-full font-black text-[10px] uppercase tracking-widest glass-card border-none hover:bg-white/10" asChild>
                        <Link href={`/buildings/${building.id}`}>Management</Link>
                    </Button>
                    <Button className="flex-1 rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg" asChild>
                        <Link href={`/buildings/${building.id}/rooms`}>Browse Units</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
