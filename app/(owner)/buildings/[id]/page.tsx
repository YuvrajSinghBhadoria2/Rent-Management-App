'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Building2,
    MapPin,
    Layers,
    LayoutGrid,
    ArrowLeft,
    Edit,
    Trash2,
    Loader2,
    ChevronRight,
    Calendar,
    Settings2,
    Activity,
    Plus,
    Home
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';

export default function BuildingDetailPage() {
    const router = useRouter();
    const { id } = useParams();
    const [building, setBuilding] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchBuilding();
    }, [id]);

    async function fetchBuilding() {
        try {
            const response = await fetch(`/api/buildings/${id}`);
            const result = await response.json();
            if (result.success) {
                setBuilding(result.data);
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

    async function onDelete() {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/buildings/${id}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (result.success) {
                toast.success('Building deleted successfully');
                router.push('/buildings');
            } else {
                toast.error(result.error || 'Failed to delete building');
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
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                    <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Loading Asset Details</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-8 py-6 animate-fade-in">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/buildings')}
                        className="group -ml-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Portfolio
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                            <Building2 className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
                                {building.name}
                            </h1>
                            <div className="flex items-center gap-2 text-muted-foreground mt-1.5 font-medium">
                                <MapPin className="h-4 w-4 text-primary/60" />
                                <span>{building.address}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" asChild className="glass-card hover:bg-white/5 border-white/10">
                        <Link href={`/buildings/${id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Settings
                        </Link>
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="outline" className="text-destructive hover:bg-destructive/5 hover:text-destructive border-white/10">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass-card border-white/20">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Deactivate Property?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will mark the building as inactive. Existing records and room data will be preserved but it will no longer appear in your active portfolio.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={onDelete} className="bg-destructive text-white hover:bg-destructive/90 transition-all font-bold">
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Deactivation'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <Button asChild className="shadow-lg shadow-primary/20">
                        <Link href={`/buildings/${id}/rooms`}>
                            View Inventory
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Main Stats Column */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Units', value: '—', icon: Home, color: 'text-primary' },
                            { label: 'Floors', value: building.totalFloors, icon: Layers, color: 'text-blue-500' },
                            { label: 'Due Day', value: building.dueDateDay, icon: Calendar, color: 'text-amber-500' },
                            { label: 'Type', value: building.type.replace('_', ' '), icon: Building2, color: 'text-green-500' },
                        ].map((stat, i) => (
                            <div key={i} className="glass-card p-4 space-y-3 relative overflow-hidden group hover:scale-[1.02] transition-all">
                                <div className={cn("p-2 rounded-lg w-fit", stat.color.replace('text-', 'bg-') + '/10')}>
                                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                                    <p className="text-xl font-bold mt-1 group-hover:text-primary transition-colors capitalize">{stat.value}</p>
                                </div>
                                <div className="absolute -right-2 -bottom-2 opacity-5 pointer-events-none group-hover:scale-125 transition-transform">
                                    <stat.icon className="h-16 w-16" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <Card className="glass-card border-white/10 overflow-hidden shadow-2xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-white/5">
                            <div>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Settings2 className="h-5 w-5 text-primary" />
                                    Penalty Policy
                                </CardTitle>
                                <CardDescription className="text-xs mt-1">Automated late fee configuration for this property.</CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3">
                                {building.penaltyConfig.dailyAccrual ? 'Active Accrual' : 'Flat Charge'}
                            </Badge>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                                <div className="space-y-1.5 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Grace Period</p>
                                    <p className="text-2xl font-bold">{building.penaltyConfig.gracePeriodDays} Days</p>
                                    <p className="text-[10px] text-muted-foreground">Before fees are applied</p>
                                </div>
                                <div className="space-y-1.5 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Penalty Charge</p>
                                    <p className="text-2xl font-bold">
                                        {building.penaltyConfig.type === 'flat' ? '₹' : ''}
                                        {building.penaltyConfig.amount}
                                        {building.penaltyConfig.type === 'percent' ? '%' : ''}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">{building.penaltyConfig.type === 'flat' ? 'One-time fixed fee' : 'Percentage of dues'}</p>
                                </div>
                                <div className="space-y-1.5 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-colors">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Cap Limit</p>
                                    <p className="text-2xl font-bold">
                                        {building.penaltyConfig.maxPenalty > 0 ? `₹${building.penaltyConfig.maxPenalty}` : 'None'}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">Maximum accruable amount</p>
                                </div>
                            </div>

                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                                            <Activity className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">Daily Accrual</p>
                                            <p className="text-[10px] text-gray-500">Calculate fees every 24 hours</p>
                                        </div>
                                    </div>
                                    <Badge variant={building.penaltyConfig.dailyAccrual ? 'default' : 'secondary'} className="rounded-md">
                                        {building.penaltyConfig.dailyAccrual ? 'ON' : 'OFF'}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                                            <Layers className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-900 dark:text-white">Tax Scope</p>
                                            <p className="text-[10px] text-gray-500">Apply on total bill amount</p>
                                        </div>
                                    </div>
                                    <Badge variant={building.penaltyConfig.applyOnTotal ? 'default' : 'secondary'} className="rounded-md">
                                        {building.penaltyConfig.applyOnTotal ? 'FULL' : 'RENT'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Column */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-card overflow-hidden group shadow-2xl">
                        <div className="h-56 bg-white/5 flex items-center justify-center relative overflow-hidden">
                            {building.photoUrl ? (
                                <img src={building.photoUrl} alt={building.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 opacity-20 group-hover:opacity-40 transition-opacity">
                                    <Building2 className="h-20 w-20 text-gray-400" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">No Property Image</p>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                <Button size="sm" variant="secondary" className="w-full glass-card border-white/20">
                                    Update Photo
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Card className="glass-card border-white/10 shadow-xl">
                        <CardHeader className="pb-4 border-b border-white/5">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Activity className="h-4 w-4 text-primary" />
                                Asset Health
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        <span>Occupancy</span>
                                        <span className="text-primary text-sm tracking-normal">—%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary transition-all duration-1000" style={{ width: '0%' }} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1 border-l-2 border-primary/20">Quick Navigation</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        <Button variant="ghost" className="justify-between group h-11 hover:bg-white/5 px-2" asChild>
                                            <Link href={`/buildings/${id}/rooms`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                                        <LayoutGrid className="h-4 w-4" />
                                                    </div>
                                                    <span className="font-bold text-sm">Room Inventory</span>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" className="justify-between group h-11 hover:bg-white/5 px-2" asChild>
                                            <Link href={`/tenants?building=${id}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 rounded-lg bg-green-500/10 text-green-500">
                                                        <Users className="h-4 w-4" />
                                                    </div>
                                                    <span className="font-bold text-sm">Active Tenants</span>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
