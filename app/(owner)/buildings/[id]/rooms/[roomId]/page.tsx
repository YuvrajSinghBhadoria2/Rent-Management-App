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
    AlertTriangle
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

const roomSchema = z.object({
    number: z.string().min(1, 'Room number is required'),
    name: z.string().nullable().optional(),
    floor: z.coerce.number().min(0),
    type: z.enum(['single', 'double', 'dormitory', 'studio']),
    status: z.enum(['vacant', 'occupied', 'notice_period', 'under_renovation']),
    condition: z.enum(['good', 'needs_repair', 'under_renovation']),
    monthlyRent: z.coerce.number().min(0),
    amenities: z.object({
        ac: z.boolean(),
        wifi: z.boolean(),
        attachedBath: z.boolean(),
        geyser: z.boolean(),
        parking: z.boolean(),
        tv: z.boolean(),
        fridge: z.boolean(),
        washingMachine: z.boolean(),
    }),
});

export default function RoomDetailPage() {
    const router = useRouter();
    const { id: buildingId, roomId } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [room, setRoom] = useState<any>(null);

    const form = useForm<z.infer<typeof roomSchema>>({
        resolver: zodResolver(roomSchema) as any,
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
                });
            } else {
                toast.error('Failed to fetch room');
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
                throw new Error(result.error || 'Failed to update room');
            }

            toast.success('Room updated successfully!');
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
                toast.success('Room deleted');
                router.push(`/buildings/${buildingId}/rooms`);
            } else {
                toast.error('Failed to delete room');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setIsDeleting(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-5xl mx-auto pb-20 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
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
                                "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest",
                                room?.status === 'vacant' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                    room?.status === 'occupied' ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                                        "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            )}>
                                {room?.status.replace('_', ' ')}
                            </Badge>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium text-sm">
                            Floor {room?.floor} • {room?.type.replace('_', ' ')}
                        </p>
                    </div>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" className="rounded-full px-6 font-bold text-xs uppercase tracking-widest text-red-500 hover:text-red-600 hover:bg-red-500/10">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Room
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-[2rem] glass-card border-none p-8">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl font-black tracking-tight">Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-500 font-medium">
                                This will permanently delete Room {room?.number}. This action cannot be undone.
                                Deleting rooms with active history might impact your reports.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-6 gap-3">
                            <AlertDialogCancel className="rounded-full font-bold px-6">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onDelete} className="rounded-full font-bold px-8 bg-red-500 hover:bg-red-600">
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Delete'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit((values: any) => onSubmit(values))} className="space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2 space-y-10">
                            <Card className="glass-card border-none rounded-[2.5rem] overflow-hidden shadow-none">
                                <CardHeader className="p-10 pb-0">
                                    <CardTitle className="text-xl font-black flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                            <LayoutGrid className="h-5 w-5" />
                                        </div>
                                        Core Configuration
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-10 space-y-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <FormField
                                            control={form.control as any}
                                            name="number"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">Room Identifier</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} className="rounded-2xl bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/10 h-12 px-4 focus:ring-primary/20" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control as any}
                                            name="floor"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">Floor Level</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} className="rounded-2xl bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/10 h-12 px-4 focus:ring-primary/20" />
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control as any}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">Custom Name / Alias (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input {...field} value={field.value || ''} placeholder="e.g. Master Bedroom, Unit A" className="rounded-2xl bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/10 h-12 px-4 focus:ring-primary/20" />
                                                </FormControl>
                                                <FormMessage className="text-[10px]" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <FormField
                                            control={form.control as any}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">Room Category</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="rounded-2xl bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/10 h-12 px-4">
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                            <SelectItem value="single">Single Room</SelectItem>
                                                            <SelectItem value="double">Double Sharing</SelectItem>
                                                            <SelectItem value="dormitory">Dormitory Style</SelectItem>
                                                            <SelectItem value="studio">Studio Apartment</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control as any}
                                            name="monthlyRent"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">Monthly Base Rent (₹)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">₹</span>
                                                            <Input type="number" {...field} className="rounded-2xl bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/10 h-12 pl-8 pr-4 focus:ring-primary/20" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage className="text-[10px]" />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="glass-card border-none rounded-[2.5rem] overflow-hidden shadow-none">
                                <CardHeader className="p-10 pb-0">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-xl font-black flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                                                <AlertTriangle className="h-5 w-5" />
                                            </div>
                                            Operational Status
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-10 space-y-8">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                        <FormField
                                            control={form.control as any}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">Lifecycle Status</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="rounded-2xl bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/10 h-12 px-4">
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                            <SelectItem value="vacant">Vacant</SelectItem>
                                                            <SelectItem value="occupied">Occupied</SelectItem>
                                                            <SelectItem value="notice_period">Notice Period</SelectItem>
                                                            <SelectItem value="under_renovation">Maintenance</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription className="text-[10px] font-bold text-amber-600 mt-2">
                                                        Note: Occupancy is typically managed via allocations.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control as any}
                                            name="condition"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest opacity-60">Physical Condition</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="rounded-2xl bg-gray-50/50 dark:bg-white/5 border-gray-100 dark:border-white/10 h-12 px-4">
                                                                <SelectValue placeholder="Select condition" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                            <SelectItem value="good">Excellent</SelectItem>
                                                            <SelectItem value="needs_repair">Needs Repair</SelectItem>
                                                            <SelectItem value="under_renovation">Under Reno</SelectItem>
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

                        <div className="lg:col-span-1 space-y-8">
                            <Card className="glass-card border-none rounded-[2.5rem] overflow-hidden shadow-none">
                                <CardHeader className="p-8 pb-4">
                                    <CardTitle className="text-xl font-black flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                        Amenities
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 pt-0 space-y-4">
                                    {[
                                        { id: 'ac', label: 'Air Conditioning' },
                                        { id: 'wifi', label: 'Broadband WiFi' },
                                        { id: 'attachedBath', label: 'Attached Bathroom' },
                                        { id: 'geyser', label: 'Geyser / Water Heater' },
                                        { id: 'parking', label: 'Dedicated Parking' },
                                        { id: 'tv', label: 'Smart TV' },
                                        { id: 'fridge', label: 'Refrigerator' },
                                        { id: 'washingMachine', label: 'Washing Machine' },
                                    ].map((amenity) => (
                                        <FormField
                                            key={amenity.id}
                                            control={form.control as any}
                                            name={`amenities.${amenity.id}` as any}
                                            render={({ field }) => (
                                                <FormItem className="flex items-center space-x-4 space-y-0 p-3 rounded-2xl bg-gray-50/50 dark:bg-white/5 border border-transparent hover:border-emerald-500/20 transition-all cursor-pointer">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            className="rounded-md border-gray-300 dark:border-white/20"
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="flex-1 font-bold text-xs uppercase tracking-widest text-gray-600 dark:text-gray-300 cursor-pointer">
                                                        {amenity.label}
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </CardContent>
                            </Card>

                            <div className="sticky bottom-10 flex flex-col gap-4 animate-fade-in delay-200">
                                <Button
                                    type="submit"
                                    size="lg"
                                    className="w-full h-14 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95"
                                    disabled={isSaving}
                                >
                                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Update Specifications'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="lg"
                                    className="w-full h-14 rounded-full font-black text-xs uppercase tracking-[0.2em] glass-card border-none"
                                    onClick={() => router.back()}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}
