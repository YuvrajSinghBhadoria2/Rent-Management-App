'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
    Loader2,
    ArrowLeft,
    Building2,
    Calendar,
    CreditCard,
    ShieldCheck,
    Info,
    Settings2,
    Hash,
    Sparkles,
    Save
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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

type BuildingFormValues = z.infer<typeof buildingSchema>;


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

            toast.success('Asset protocol updated successfully!');
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
            <div className="flex h-[80vh] items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-primary opacity-50" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-5xl mx-auto pb-24 animate-fade-in px-4">
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
                        <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">Edit Protocol</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium italic">
                            Modifying the operational parameters for <span className="text-primary font-black uppercase">{form.getValues('name')}</span>.
                        </p>
                    </div>
                </div>
                <div className="hidden md:flex items-center gap-3 glass-card px-5 py-2.5 rounded-full border-none">
                    <Sparkles className="h-4 w-4 text-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Sync Active</span>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Summary & Tips */}
                        <div className="lg:col-span-1 space-y-8 order-2 lg:order-1">
                            <Card className="glass-card border-none rounded-[2.5rem] shadow-none overflow-hidden sticky top-24">
                                <CardHeader className="p-8 pb-4">
                                    <CardTitle className="text-xl font-black flex items-center gap-3 text-primary">
                                        <Info className="h-5 w-5" />
                                        Update Guard
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 pt-0 space-y-6">
                                    <p className="text-sm font-medium text-gray-500 leading-relaxed">
                                        Modifying core operational parameters like **Due Dates** or **Penalty Structures**
                                        will only impact future billing cycles. Existing invoices remain unchanged.
                                    </p>
                                    <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 space-y-4">
                                        <div className="flex gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                            <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400">Structural changes to property type may affect bed assignments.</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                            <p className="text-[11px] font-bold text-gray-600 dark:text-gray-400">Ensure the new 'Total Floors' covers all existing rooms.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Form Fields */}
                        <div className="lg:col-span-2 space-y-10 order-1 lg:order-2">
                            {/* Basic Info */}
                            <Card className="glass-card border-none rounded-[2.5rem] shadow-none overflow-hidden">
                                <CardHeader className="p-10 pb-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                            <Building2 className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="text-2xl font-black tracking-tight">Core Vitals</CardTitle>
                                    </div>
                                    <CardDescription className="text-gray-500 font-medium ml-14">Update the primary identification for this asset.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-10 pt-0 space-y-8">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Asset Nomenclature</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Skyline Towers Phase I" className="h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold focus:ring-primary/20 text-lg" {...field} />
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
                                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Geospatial Address</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Enter full physical address..."
                                                        className="min-h-[120px] rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold focus:ring-primary/20 p-5 leading-relaxed"
                                                        {...field}
                                                    />
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
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Protocol Type</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold">
                                                                <SelectValue placeholder="Selection Required" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="rounded-2xl border-none shadow-2xl glass-card">
                                                            <SelectItem value="residential" className="rounded-xl font-bold py-3">Residential Flats</SelectItem>
                                                            <SelectItem value="pg_hostel" className="rounded-xl font-bold py-3">PG / Hostel (Bed-Level)</SelectItem>
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
                                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Vertical Scale (Floors)</FormLabel>
                                                    <FormControl>
                                                        <div className="relative group">
                                                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                                            <Input type="number" min="1" className="pl-12 h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold focus:ring-primary/20" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Billing Config */}
                            <Card className="glass-card border-none rounded-[2.5rem] shadow-none overflow-hidden">
                                <CardHeader className="p-10 pb-6">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="text-2xl font-black tracking-tight">Billing Governance</CardTitle>
                                    </div>
                                    <CardDescription className="text-gray-500 font-medium ml-14">Refine fiscal deadlines and penalty logic.</CardDescription>
                                </CardHeader>
                                <CardContent className="p-10 pt-0 space-y-10">
                                    <FormField
                                        control={form.control}
                                        name="dueDateDay"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Cycle Deadline (Day of Month)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="1" max="28" className="h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold focus:ring-primary/20" {...field} />
                                                </FormControl>
                                                <FormDescription className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest pl-1">Invoices will automatically escalate after this day.</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="pt-2">
                                        <div className="flex items-center gap-3 mb-8 px-1">
                                            <Settings2 className="h-4 w-4 text-primary" />
                                            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-gray-400">Penalty Algorithms</h3>
                                            <Separator className="flex-1 opacity-10" />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <FormField
                                                control={form.control}
                                                name="penaltyConfig.gracePeriodDays"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Grace Window (Days)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" min="0" className="h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold focus:ring-primary/20" {...field} />
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
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Calculation Method</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent className="rounded-2xl border-none shadow-2xl glass-card">
                                                                <SelectItem value="flat" className="rounded-xl font-bold py-3">Flat Value (INR)</SelectItem>
                                                                <SelectItem value="percent" className="rounded-xl font-bold py-3">Percentage (%)</SelectItem>
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
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Threshold / Rate</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" min="0" className="h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold focus:ring-primary/20" {...field} />
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
                                                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Capped Limit (Max Cap)</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" min="0" className="h-14 rounded-2xl bg-white dark:bg-black/20 border-gray-100 dark:border-white/10 font-bold focus:ring-primary/20" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                                            <FormField
                                                control={form.control}
                                                name="penaltyConfig.dailyAccrual"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center justify-between rounded-[2rem] border border-gray-100 dark:border-white/5 p-8 bg-gray-50/50 dark:bg-white/5 transition-all hover:border-primary/20">
                                                        <div className="space-y-1">
                                                            <FormLabel className="text-sm font-black dark:text-white uppercase tracking-tight">Compound Recovery</FormLabel>
                                                            <FormDescription className="text-[10px] font-bold text-gray-400">Apply daily for incremental pressure.</FormDescription>
                                                        </div>
                                                        <FormControl>
                                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="penaltyConfig.applyOnTotal"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center justify-between rounded-[2rem] border border-gray-100 dark:border-white/5 p-8 bg-gray-50/50 dark:bg-white/5 transition-all hover:border-primary/20">
                                                        <div className="space-y-1">
                                                            <FormLabel className="text-sm font-black dark:text-white uppercase tracking-tight">Full Portfolio Scope</FormLabel>
                                                            <FormDescription className="text-[10px] font-bold text-gray-400">Calculate on total dues, not just rent.</FormDescription>
                                                        </div>
                                                        <FormControl>
                                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-6 pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="h-16 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.25em] px-10 border border-gray-100 dark:border-white/5"
                                    onClick={() => router.back()}
                                >
                                    Revert Protocol
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 h-16 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.25em] shadow-2xl transition-all hover:scale-[1.02]"
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
                                            Commit Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}

