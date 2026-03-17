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
        <div className="space-y-6 max-w-4xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Room {room?.number}</h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            Status: <Badge variant="outline" className="capitalize">{room?.status.replace('_', ' ')}</Badge>
                        </p>
                    </div>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Room
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete Room {room?.number}. This action cannot be undone.
                                Keep in mind that you shouldn&apos;t delete rooms that have active leases.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <LayoutGrid className="h-5 w-5 text-primary" />
                                        Modify Room
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="number"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Room Number*</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
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
                                                    <FormLabel>Floor</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
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
                                                <FormLabel>Room Name</FormLabel>
                                                <FormControl>
                                                    <Input {...field} value={field.value || ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Room Type</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="single">Single</SelectItem>
                                                            <SelectItem value="double">Double</SelectItem>
                                                            <SelectItem value="dormitory">Dormitory</SelectItem>
                                                            <SelectItem value="studio">Studio</SelectItem>
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
                                                    <FormLabel>Monthly Rent (₹)*</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Status</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="vacant">Vacant</SelectItem>
                                                            <SelectItem value="occupied">Occupied</SelectItem>
                                                            <SelectItem value="notice_period">Notice Period</SelectItem>
                                                            <SelectItem value="under_renovation">Under Renovation</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription className="text-xs text-orange-600 flex gap-1 items-start">
                                                        <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                                                        Use allocation tools instead for Occupied status.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="condition"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Condition</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select condition" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="good">Good</SelectItem>
                                                            <SelectItem value="needs_repair">Needs Repair</SelectItem>
                                                            <SelectItem value="under_renovation">Under Renovation</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Beds summary for PG */}
                            {room?.beds?.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Beds In Room</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {room.beds.map((bed: any) => (
                                                <Badge key={bed.id} variant={bed.status === 'occupied' ? 'default' : 'secondary'} className="px-3 py-1">
                                                    {bed.bedNumber} • <span className="capitalize ml-1">{bed.status}</span>
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                        Amenities
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        { id: 'ac', label: 'AC' },
                                        { id: 'wifi', label: 'WiFi' },
                                        { id: 'attachedBath', label: 'Attached Bath' },
                                        { id: 'geyser', label: 'Geyser' },
                                        { id: 'parking', label: 'Parking' },
                                        { id: 'tv', label: 'TV' },
                                        { id: 'fridge', label: 'Fridge' },
                                        { id: 'washingMachine', label: 'Washing Machine' },
                                    ].map((amenity) => (
                                        <FormField
                                            key={amenity.id}
                                            control={form.control}
                                            name={`amenities.${amenity.id}` as any}
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-1">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal cursor-pointer">
                                                        {amenity.label}
                                                    </FormLabel>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </CardContent>
                            </Card>

                            <div className="flex flex-col gap-3 pt-4">
                                <Button type="submit" className="w-full" disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                                <Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>
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
