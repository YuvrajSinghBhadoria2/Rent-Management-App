'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, ArrowLeft, Building2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const buildingSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    address: z.string().min(1, 'Address is required'),
    type: z.enum(['residential', 'pg_hostel']),
    totalFloors: z.coerce.number().min(1, 'Must have at least 1 floor'),
    dueDateDay: z.coerce.number().min(1).max(28, 'Day must be 1-28'),
    penaltyConfig: z.object({
        gracePeriodDays: z.coerce.number().min(0).default(3),
        type: z.enum(['flat', 'percent']).default('flat'),
        amount: z.coerce.number().min(0).default(0),
        dailyAccrual: z.boolean().default(false),
        maxPenalty: z.coerce.number().min(0).default(0),
        applyOnTotal: z.boolean().default(false),
    }),
});

export default function EditBuildingPage() {
    const router = useRouter();
    const { id } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<z.infer<typeof buildingSchema>>({
        resolver: zodResolver(buildingSchema),
        defaultValues: {
            name: '',
            address: '',
            type: 'residential',
            totalFloors: 1,
            dueDateDay: 5,
            penaltyConfig: {
                gracePeriodDays: 3,
                type: 'flat',
                amount: 0,
                dailyAccrual: false,
                maxPenalty: 0,
                applyOnTotal: false,
            },
        },
    });

    useEffect(() => {
        fetchBuilding();
    }, [id]);

    async function fetchBuilding() {
        try {
            const response = await fetch(`/api/buildings/${id}`);
            const result = await response.json();
            if (result.success) {
                form.reset(result.data);
            } else {
                toast.error(result.error || 'Failed to fetch building');
                router.push('/buildings');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    }

    async function onSubmit(values: z.infer<typeof buildingSchema>) {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/buildings/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to update building');
            }

            toast.success('Building updated successfully!');
            router.push(`/buildings/${id}`);
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
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Edit Building</h1>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                Basic Information
                            </CardTitle>
                            <CardDescription>
                                Update general details about your property.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Building Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Sunshine Residency" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Address</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Street, Area, Landmark, City, State, PIN"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Property Type</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="residential">Residential Flats</SelectItem>
                                                    <SelectItem value="pg_hostel">PG / Hostel</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="totalFloors"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Total Floors</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="1" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Billing Config */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Billing Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="dueDateDay"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Monthly Due Date (Day)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="1" max="28" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Separator />

                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    Late Payment Penalties
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="penaltyConfig.gracePeriodDays"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Grace Period (Days)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="penaltyConfig.type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Penalty Type</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                                                        <SelectItem value="percent">Percentage (%)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="penaltyConfig.amount"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Penalty Amount / Rate</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="penaltyConfig.maxPenalty"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Maximum Penalty (₹)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="penaltyConfig.dailyAccrual"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Daily Accrual</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="penaltyConfig.applyOnTotal"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                                                <div className="space-y-0.5">
                                                    <FormLabel>Apply on Total Bill</FormLabel>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
