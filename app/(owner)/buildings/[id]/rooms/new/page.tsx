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
    CheckCircle2
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

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
        // Validation for PG beds
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

            toast.success('Room created successfully!');
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
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Add Room</h1>
                    <p className="text-muted-foreground">{building?.name}</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left Column - Main Details */}
                        <div className="md:col-span-2 space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <LayoutGrid className="h-5 w-5 text-primary" />
                                        Room Details
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
                                                        <Input placeholder="e.g. 101, A-1" {...field} />
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
                                                        <Input type="number" min="0" {...field} />
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
                                                <FormLabel>Room Name (Optional)</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Master Bedroom" {...field} value={field.value || ''} />
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
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                                        <Input type="number" min="0" {...field} />
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
                                                    <FormLabel>Initial Status</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="vacant">Vacant</SelectItem>
                                                            <SelectItem value="under_renovation">Under Renovation</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>
                                                        Cannot set to Occupied manually here.
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
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                            {/* PG Bed Management */}
                            {building?.type === 'pg_hostel' && (
                                <Card className="border-primary/20 bg-primary/5">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center justify-between">
                                            Manage Beds
                                            <Badge variant="outline" className="bg-white">{beds.length} Beds</Badge>
                                        </CardTitle>
                                        <CardDescription>
                                            Assign specific bed numbers for bed-level tracking.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="e.g. B1"
                                                value={newBedNumber}
                                                onChange={(e) => setNewBedNumber(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        addBed();
                                                    }
                                                }}
                                            />
                                            <Button type="button" onClick={addBed}>Add Bed</Button>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {beds.map((bed, index) => (
                                                <Badge key={index} variant="secondary" className="pl-3 pr-1 py-1 gap-2 text-sm">
                                                    {bed}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-5 w-5 rounded-full hover:bg-destructive hover:text-white"
                                                        onClick={() => removeBed(index)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </Badge>
                                            ))}
                                            {beds.length === 0 && (
                                                <p className="text-sm text-muted-foreground italic flex items-center gap-2">
                                                    <Info className="h-4 w-4" />
                                                    No beds added yet. Add at least one bed for higher occupancy tracking.
                                                </p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Right Column - Amenities */}
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
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel className="font-normal cursor-pointer">
                                                            {amenity.label}
                                                        </FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    ))}
                                </CardContent>
                            </Card>

                            <div className="flex flex-col gap-3 pt-4">
                                <Button type="submit" className="w-full" disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Room
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
