'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
    Loader2,
    ArrowLeft,
    LayoutGrid,
    Trash2,
    Info,
    CheckCircle2,
    Plus,
    Building2,
    Hash,
    CreditCard,
    Zap,
    Wifi,
    Tv,
    Wind,
    Utensils,
    Waves,
    Car,
    Bath
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const roomSchema = z.object({
    number: z.string().min(1, 'Room number is required'),
    name: z.string().optional(),
    floor: z.coerce.number().min(0),
    type: z.enum(['single', 'double', 'dormitory', 'studio']),
    status: z.enum(['vacant', 'occupied', 'notice_period', 'under_renovation']).default('vacant'),
    condition: z.enum(['good', 'needs_repair', 'under_renovation']).default('good'),
    monthlyRent: z.coerce.number().min(0, 'Rent must be positive'),
    amenities: z.object({
        ac: z.boolean().default(false),
        wifi: z.boolean().default(false),
        attachedBath: z.boolean().default(false),
        geyser: z.boolean().default(false),
        parking: z.boolean().default(false),
        tv: z.boolean().default(false),
        fridge: z.boolean().default(false),
        washingMachine: z.boolean().default(false),
    }),
});

type RoomFormValues = z.infer<typeof roomSchema>;


const amenityIcons: any = {
    ac: Wind,
    wifi: Wifi,
    attachedBath: Bath,
    geyser: Zap,
    parking: Car,
    tv: Tv,
    fridge: Utensils,
    washingMachine: Waves,
};

export default function NewRoomPage() {
    const router = useRouter();
    const { id: buildingId } = useParams();
    const [building, setBuilding] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Bed state for PG properties
    const [beds, setBeds] = useState<string[]>([]);
    const [newBedNumber, setNewBedNumber] = useState('');

    useEffect(() => {
        fetchBuilding();
    }, [buildingId]);

    async function fetchBuilding() {
        try {
            const response = await fetch(`/api/buildings/${buildingId}`);
            const result = await response.json();
            if (result.success) {
                setBuilding(result.data);
            } else {
                toast.error('Failed to fetch building details');
                router.push('/buildings');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    const form = useForm<z.infer<typeof roomSchema>>({
        resolver: zodResolver(roomSchema),
        defaultValues: {
            number: '',
            name: '',
            floor: 0,
            type: 'single',
            status: 'vacant',
            condition: 'good',
            monthlyRent: 0,
            amenities: {
                ac: false,
                wifi: false,
                attachedBath: false,
                geyser: false,
                parking: false,
                tv: false,
                fridge: false,
                washingMachine: false,
            },
        },
    });

    const addBed = () => {
        if (!newBedNumber.trim()) return;
        if (beds.includes(newBedNumber.trim())) {
            toast.error('Bed number already exists');
            return;
        }
        setBeds([...beds, newBedNumber.trim()]);
        setNewBedNumber('');
    };

    const removeBed = (index: number) => {
        setBeds(beds.filter((_, i) => i !== index));
    };

    async function onSubmit(values: z.infer<typeof roomSchema>) {
        if (building?.type === 'pg_hostel' && beds.length === 0) {
            toast.error('Please add at least one bed for this PG room');
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...values,
                    buildingId,
                    beds: building?.type === 'pg_hostel' ? beds : undefined
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to create room');
            }

            toast.success('Inventory unit provisioned successfully!');
            router.push(`/buildings/${buildingId}/rooms`);
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <LayoutGrid className="h-6 w-6 text-primary opacity-50 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-6xl mx-auto pb-24 animate-fade-in px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full hover:bg-white/10 glass-card"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">Provision Room</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium italic">
                            Adding inventory unit to <span className="text-primary font-black uppercase">{building?.name}</span>.
                        </p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-3 glass-card px-5 py-2.5 rounded-full border-none">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Inventory Protocol</span>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Main Details */}
                        <div className="lg:col-span-2 space-y-10">
                            <Card className="glass-card border-none rounded-[2.5rem] shadow-none overflow-hidden">
                                <CardHeader className="p-10 pb-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                            <LayoutGrid className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="text-2xl font-black tracking-tight">Spatial Parameters</CardTitle>
                                    </div>
                                    <CardDescription className="text-gray-500 font-medium ml-14">Define the room's identity and location.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-10 pt-0 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormField
                                            control={form.control}
                                            name="number"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Room / Unit ID</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. 101, A-Wing-4" className="h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold focus:ring-primary/20 text-lg" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="floor"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Vertical Level (Floor)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                                            <Input type="number" min="0" className="pl-12 h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold focus:ring-primary/20" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Friendly Label (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Deluxe Balcony Suite" className="h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold focus:ring-primary/20" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormField
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Configuration Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold">
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-2xl border-none shadow-2xl glass-card">
                                                            <SelectItem value="single" className="rounded-xl font-bold py-3">Single Occupancy</SelectItem>
                                                            <SelectItem value="double" className="rounded-xl font-bold py-3">Double Sharing</SelectItem>
                                                            <SelectItem value="dormitory" className="rounded-xl font-bold py-3">Dormitory Style</SelectItem>
                                                            <SelectItem value="studio" className="rounded-xl font-bold py-3">Studio Apartment</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="monthlyRent"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Standard Rent (₹)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                                            <Input type="number" min="0" className="pl-12 h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold focus:ring-primary/20 text-xl" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Initial State</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-2xl border-none shadow-2xl glass-card">
                                                            <SelectItem value="vacant" className="rounded-xl font-bold py-3">Ready for Move-in</SelectItem>
                                                            <SelectItem value="under_renovation" className="rounded-xl font-bold py-3">Under Renovation</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="condition"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Physical Condition</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-2xl border-none shadow-2xl glass-card">
                                                            <SelectItem value="good" className="rounded-xl font-bold py-3 text-emerald-600">Premium / Good</SelectItem>
                                                            <SelectItem value="needs_repair" className="rounded-xl font-bold py-3 text-amber-500">Needs Maintenance</SelectItem>
                                                            <SelectItem value="under_renovation" className="rounded-xl font-bold py-3 text-rose-500">Critical / Renovation</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* PG Bed Management */}
                            {building?.type === 'pg_hostel' && (
                                <Card className="glass-card border-none rounded-[2.5rem] shadow-2xl overflow-hidden ring-4 ring-primary/5 bg-primary/5">
                                    <CardHeader className="p-10 pb-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                                                    <Plus className="h-5 w-5" />
                                                </div>
                                                <CardTitle className="text-2xl font-black tracking-tight">Bed Inventory</CardTitle>
                                            </div>
                                            <Badge variant="outline" className="rounded-full px-4 py-1 text-[10px] font-black bg-white dark:bg-black/40 border-none shadow-sm uppercase tracking-widest">{beds.length} Registered</Badge>
                                        </div>
                                        <CardDescription className="text-gray-500 font-medium ml-14">PG Protocol: Add individual beds for high-density tracking.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-10 pt-0 space-y-8">
                                        <div className="flex gap-4 p-8 rounded-[2rem] bg-white/50 dark:bg-black/20 border-2 border-dashed border-primary/20">
                                            <Input
                                                placeholder="Bed Number (e.g. B-01)"
                                                value={newBedNumber}
                                                onChange={(e) => setNewBedNumber(e.target.value)}
                                                className="h-14 rounded-2xl bg-white dark:bg-black/40 border-none font-bold focus:ring-primary/20"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addBed();
                                                    }
                                                }}
                                            />
                                            <Button type="button" onClick={addBed} className="h-14 rounded-2xl px-8 font-black text-xs uppercase tracking-widest">Add Bed</Button>
                                        </div>

                                        <div className="flex flex-wrap gap-4 px-2">
                                            {beds.map((bed, index) => (
                                                <Badge key={index} className="pl-4 pr-1 py-1 gap-2 text-xs font-black uppercase tracking-widest h-11 bg-white dark:bg-black/20 border-2 border-primary/10 text-primary shadow-sm rounded-2xl group transition-all hover:border-destructive/30">
                                                    {bed}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 rounded-lg hover:bg-destructive hover:text-white transition-colors"
                                                        onClick={() => removeBed(index)}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </Badge>
                                            ))}
                                            {beds.length === 0 && (
                                                <div className="w-full py-12 text-center space-y-3 opacity-40">
                                                    <Info className="h-8 w-8 mx-auto text-gray-400" />
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Inventory empty: Add beds to initialize</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Amenities Sidebar */}
                        <div className="space-y-10">
                            <Card className="glass-card border-none rounded-[2.5rem] shadow-none overflow-hidden sticky top-24">
                                <CardHeader className="p-8 pb-4">
                                    <CardTitle className="text-xl font-black flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                        Unit Luxuries
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 pt-0 space-y-4">
                                    {[
                                        { id: 'ac', label: 'Air Conditioning' },
                                        { id: 'wifi', label: 'High-speed WiFi' },
                                        { id: 'attachedBath', label: 'Private Bathroom' },
                                        { id: 'geyser', label: 'Geyser / Hot Water' },
                                        { id: 'parking', label: 'Private Parking' },
                                        { id: 'tv', label: 'Smart TV' },
                                        { id: 'fridge', label: 'Mini Fridge' },
                                        { id: 'washingMachine', label: 'Washing Unit' },
                                    ].map((amenity) => {
                                        const Icon = amenityIcons[amenity.id];
                                        const isChecked = form.watch(`amenities.${amenity.id}` as any);

                                        return (
                                            <FormField
                                                key={amenity.id}
                                                control={form.control}
                                                name={`amenities.${amenity.id}` as any}
                                                render={({ field }) => (
                                                    <FormItem className={cn(
                                                        "flex items-center gap-4 space-y-0 p-4 rounded-2xl border transition-all duration-300 cursor-pointer group",
                                                        field.value
                                                            ? "bg-primary/5 border-primary/20 shadow-sm"
                                                            : "bg-transparent border-gray-100 dark:border-white/5 opacity-60 grayscale hover:grayscale-0 hover:bg-gray-50 dark:hover:bg-white/5"
                                                    )}>
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value}
                                                                onCheckedChange={field.onChange}
                                                                className="rounded-lg w-5 h-5 border-2"
                                                            />
                                                        </FormControl>
                                                        <div className="flex items-center justify-between flex-1">
                                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest cursor-pointer">
                                                                {amenity.label}
                                                            </FormLabel>
                                                            <div className={cn(
                                                                "p-2 rounded-lg transition-colors group-hover:scale-110",
                                                                field.value ? "text-primary bg-primary/10" : "text-gray-400"
                                                            )}>
                                                                <Icon className="h-4 w-4" />
                                                            </div>
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        );
                                    })}
                                </CardContent>
                                <Separator className="opacity-10" />
                                <CardFooter className="p-8 flex flex-col gap-4">
                                    <Button
                                        type="submit"
                                        className="w-full h-16 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.25em] shadow-2xl transition-all hover:scale-[1.02]"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                                Provisioning...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="mr-3 h-5 w-5" />
                                                Commit Room
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full h-14 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest text-gray-400"
                                        onClick={() => router.back()}
                                    >
                                        Cancel Protocol
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}

