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
    CheckCircle2,
    AlertTriangle,
    Save,
    Sparkles,
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
    Bath,
    History,
    ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from '@/components/ui/separator';

const roomSchema = z.object({
    number: z.string().min(1, 'Room number is required'),
    name: z.string().nullable().optional(),
    floor: z.coerce.number().min(0).default(0),
    type: z.enum(['single', 'double', 'dormitory', 'studio']),
    status: z.enum(['vacant', 'occupied', 'notice_period', 'under_renovation']),
    condition: z.enum(['good', 'needs_repair', 'under_renovation']),
    monthlyRent: z.coerce.number().min(0),
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

type RoomFormValues = z.infer<typeof roomSchema>;

export default function RoomDetailPage() {
    const router = useRouter();
    const { id: buildingId, roomId } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [room, setRoom] = useState<any>(null);

    const form = useForm<RoomFormValues>({
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

    useEffect(() => {
        fetchRoom();
    }, [buildingId, roomId]);

    async function fetchRoom() {
        try {
            const response = await fetch(`/api/rooms/${roomId}?buildingId=${buildingId}`);
            const result = await response.json();
            if (result.success) {
                setRoom(result.data);
                form.reset({
                    ...result.data,
                    name: result.data.name || '',
                    floor: result.data.floor ?? 0,
                });
            } else {
                toast.error('Failed to fetch room intelligence');
                router.push(`/buildings/${buildingId}/rooms`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    async function onSubmit(values: z.infer<typeof roomSchema>) {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/rooms/${roomId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...values, buildingId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update unit specification');
            }

            toast.success('Inventory state committed successfully!');
            router.refresh();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsSaving(false);
        }
    }

    async function onDelete() {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/rooms/${roomId}?buildingId=${buildingId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success('Asset removed from registry');
                router.push(`/buildings/${buildingId}/rooms`);
            } else {
                const res = await response.json();
                toast.error(res.error || 'Failed to delete asset');
            }
        } catch (error) {
            console.error(error);
            toast.error('Internal server error');
        } finally {
            setIsDeleting(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <LayoutGrid className="h-6 w-6 text-primary opacity-50" />
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
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">Room {room?.number}</h1>
                            <Badge className={cn(
                                "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none",
                                room?.status === 'vacant' ? "bg-emerald-500/10 text-emerald-600" :
                                    room?.status === 'occupied' ? "bg-blue-500/10 text-blue-600" :
                                        "bg-amber-500/10 text-amber-600"
                            )}>
                                {room?.status.replace('_', ' ')}
                            </Badge>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium italic text-sm">
                            Configuration Protocol: Floor {room?.floor} • {room?.type.replace('_', ' ')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" className="rounded-full px-6 font-black text-[10px] uppercase tracking-[0.2em] text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-colors">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Decommission
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-[2.5rem] glass-card border-none p-10 overflow-hidden">
                            <AlertDialogHeader>
                                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
                                    <AlertTriangle className="h-6 w-6" />
                                </div>
                                <AlertDialogTitle className="text-2xl font-black tracking-tight">Decommission Asset?</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-500 font-medium text-base leading-relaxed">
                                    This will permanently remove <span className="text-gray-900 dark:text-white font-black">Room {room?.number}</span> from your inventory registry.
                                    Historical billing records will be archived but the unit will no longer be available for occupancy.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-8 gap-4">
                                <AlertDialogCancel className="h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest border-none glass-card">Retain Asset</AlertDialogCancel>
                                <AlertDialogAction onClick={onDelete} className="h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-rose-500 hover:bg-rose-600 shadow-xl shadow-rose-500/20">
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Deletion'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <div className="hidden md:flex items-center gap-3 glass-card px-5 py-2.5 rounded-full border-none">
                        <History className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">State Revision</span>
                    </div>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit((values: any) => onSubmit(values))} className="space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Summary Sidebar */}
                        <div className="lg:col-span-1 space-y-8 order-2 lg:order-1">
                            {/* Occupancy Card (Read Only) */}
                            {room?.status === 'occupied' && room?.currentTenant && (
                                <Card className="glass-card border-none rounded-[2.5rem] shadow-2xl overflow-hidden ring-4 ring-primary/5 bg-primary/5">
                                    <CardHeader className="p-8 pb-4">
                                        <CardTitle className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                            <Sparkles className="h-4 w-4" />
                                            Active Resident
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-0">
                                        <div className="flex items-center gap-4 p-4 rounded-3xl bg-white dark:bg-black/40 border border-primary/10">
                                            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg">
                                                {room.currentTenant.name ? room.currentTenant.name[0] : 'T'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-black truncate">{room.currentTenant.name}</p>
                                                <p className="text-[10px] font-bold text-gray-500 truncate">{room.currentTenant.phone}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-xl"
                                                onClick={() => router.push(`/tenants/${room.currentTenant.id}`)}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Amenity Panel */}
                            <Card className="glass-card border-none rounded-[2.5rem] shadow-none overflow-hidden sticky top-24">
                                <CardHeader className="p-8 pb-4">
                                    <CardTitle className="text-xl font-black flex items-center gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                        In-Unit Features
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 pt-0 space-y-4">
                                    {[
                                        { id: 'ac', label: 'Air Conditioning' },
                                        { id: 'wifi', label: 'Broadband WiFi' },
                                        { id: 'attachedBath', label: 'Private Bathroom' },
                                        { id: 'geyser', label: 'Geyser / Heating' },
                                        { id: 'parking', label: 'Unit Parking' },
                                        { id: 'tv', label: 'Smart TV' },
                                        { id: 'fridge', label: 'Refrigerator' },
                                        { id: 'washingMachine', label: 'Washing Unit' },
                                    ].map((amenity) => {
                                        const Icon = amenityIcons[amenity.id];
                                        return (
                                            <FormField
                                                key={amenity.id}
                                                control={form.control as any}
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
                                                Synchronizing...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-3 h-5 w-5" />
                                                Commit Spec
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="w-full h-14 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest text-gray-400"
                                        onClick={() => router.back()}
                                    >
                                        Discard Changes
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>

                        {/* Main Interaction Fields */}
                        <div className="lg:col-span-2 space-y-10 order-1 lg:order-2">
                            <Card className="glass-card border-none rounded-[2.5rem] shadow-none overflow-hidden">
                                <CardHeader className="p-10 pb-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                            <LayoutGrid className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="text-2xl font-black tracking-tight">Technical Specs</CardTitle>
                                    </div>
                                    <CardDescription className="text-gray-500 font-medium ml-14">Refine the spatial details for this inventory unit.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-10 pt-0 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormField
                                            control={form.control as any}
                                            name="number"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Asset ID</FormLabel>
                                                    <FormControl>
                                                        <Input className="h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold focus:ring-primary/20 text-lg" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control as any}
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
                                        control={form.control as any}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Unit Alias</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Master Bedroom" className="h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold focus:ring-primary/20" {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormField
                                            control={form.control as any}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Configuration</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold">
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-2xl border-none shadow-2xl glass-card">
                                                            <SelectItem value="single" className="rounded-xl font-bold py-3">Single Protocol</SelectItem>
                                                            <SelectItem value="double" className="rounded-xl font-bold py-3">Double Protocol</SelectItem>
                                                            <SelectItem value="dormitory" className="rounded-xl font-bold py-3">Dormitory Style</SelectItem>
                                                            <SelectItem value="studio" className="rounded-xl font-bold py-3">Studio Concept</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control as any}
                                            name="monthlyRent"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Operational Rent (₹)</FormLabel>
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
                                </CardContent>
                            </Card>

                            <Card className="glass-card border-none rounded-[2.5rem] shadow-none overflow-hidden">
                                <CardHeader className="p-10 pb-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                            <AlertTriangle className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="text-2xl font-black tracking-tight">Lifecycle Registry</CardTitle>
                                    </div>
                                    <CardDescription className="text-gray-500 font-medium ml-14">Update state parameters for operational fluidity.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-10 pt-0 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <FormField
                                            control={form.control as any}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Current Protocol State</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold text-primary">
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-2xl border-none shadow-2xl glass-card">
                                                            <SelectItem value="vacant" className="rounded-xl font-bold py-3 text-emerald-600">Vacant Flow</SelectItem>
                                                            <SelectItem value="occupied" className="rounded-xl font-bold py-3 text-blue-600">Occupied (Active)</SelectItem>
                                                            <SelectItem value="notice_period" className="rounded-xl font-bold py-3 text-amber-500">Notice Sequence</SelectItem>
                                                            <SelectItem value="under_renovation" className="rounded-xl font-bold py-3 text-rose-500">Maintenance Mode</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control as any}
                                            name="condition"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Condition Rating</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold">
                                                                <SelectValue placeholder="Select condition" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-2xl border-none shadow-2xl glass-card">
                                                            <SelectItem value="good" className="rounded-xl font-bold py-3">Excellent Core</SelectItem>
                                                            <SelectItem value="needs_repair" className="rounded-xl font-bold py-3">Needs Revision</SelectItem>
                                                            <SelectItem value="under_renovation" className="rounded-xl font-bold py-3">Offline / Reno</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}

