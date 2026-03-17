import Link from 'next/link';
import { Building2, MapPin, Layers, LayoutGrid } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
        <Card className="overflow-hidden transition-all hover:shadow-md">
            <div className="h-40 bg-gray-200 relative">
                {building.photoUrl ? (
                    <img
                        src={building.photoUrl}
                        alt={building.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Building2 className="h-12 w-12" />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <Badge variant={building.type === 'pg_hostel' ? 'secondary' : 'default'} className="capitalize">
                        {building.type.replace('_', ' ')}
                    </Badge>
                </div>
            </div>

            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xl line-clamp-1">{building.name}</CardTitle>
            </CardHeader>

            <CardContent className="p-4 pt-0 space-y-2">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{building.address}</span>
                </div>

                <div className="flex items-center gap-4 text-sm font-medium">
                    <div className="flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-primary" />
                        <span>{building.totalFloors} Floors</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <LayoutGrid className="h-4 w-4 text-primary" />
                        <span>Rooms</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex gap-2">
                <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/buildings/${building.id}`}>Details</Link>
                </Button>
                <Button className="flex-1" asChild>
                    <Link href={`/buildings/${building.id}/rooms`}>Rooms</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
