'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
    Building2,
    MapPin,
    Layers,
    LayoutGrid,
    Calendar,
    CreditCard,
    ArrowLeft,
    Edit,
    Trash2,
    Loader2,
    ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/buildings')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{building.name}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground mt-1">
                            <MapPin className="h-4 w-4" />
                            <span>{building.address}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href={`/buildings/${id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Link>
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will deactivate the building. All associated rooms and records will remain but the building won&apos;t be visible in active lists.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete Building'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <Button asChild>
                        <Link href={`/buildings/${id}/rooms`}>
                            Manage Rooms
                            <ChevronRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column - Stats & Info */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Building Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Type</p>
                                    <Badge variant="outline" className="capitalize text-base px-3 py-1">
                                        {building.type.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Floors</p>
                                    <p className="text-xl font-semibold flex items-center gap-2">
                                        <Layers className="h-5 w-5 text-primary" />
                                        {building.totalFloors}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Rent Due Date</p>
                                    <p className="text-xl font-semibold flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-primary" />
                                        Day {building.dueDateDay}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Rooms</p>
                                    <p className="text-xl font-semibold flex items-center gap-2">
                                        <LayoutGrid className="h-5 w-5 text-primary" />
                                        —
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Penalty Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-muted-foreground font-medium">Grace Period</span>
                                    <span className="font-semibold">{building.penaltyConfig.gracePeriodDays} Days</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-muted-foreground font-medium">Penalty Amount</span>
                                    <span className="font-semibold">
                                        {building.penaltyConfig.type === 'flat' ? '₹' : ''}
                                        {building.penaltyConfig.amount}
                                        {building.penaltyConfig.type === 'percent' ? '%' : ''}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-muted-foreground font-medium">Daily Accrual</span>
                                    <Badge variant={building.penaltyConfig.dailyAccrual ? 'default' : 'secondary'}>
                                        {building.penaltyConfig.dailyAccrual ? 'Enabled' : 'Disabled'}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-muted-foreground font-medium">Maximum Penalty</span>
                                    <span className="font-semibold">
                                        {building.penaltyConfig.maxPenalty > 0 ? `₹${building.penaltyConfig.maxPenalty}` : 'No Limit'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-muted-foreground font-medium">Apply on Total Bill</span>
                                    <Badge variant={building.penaltyConfig.applyOnTotal ? 'default' : 'secondary'}>
                                        {building.penaltyConfig.applyOnTotal ? 'Yes' : 'Rent Only'}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Image & Quick Actions */}
                <div className="space-y-6">
                    <Card className="overflow-hidden">
                        <div className="h-48 bg-gray-100 flex items-center justify-center">
                            {building.photoUrl ? (
                                <img src={building.photoUrl} alt={building.name} className="w-full h-full object-cover" />
                            ) : (
                                <Building2 className="h-16 w-16 text-gray-300" />
                            )}
                        </div>
                        <CardContent className="p-4 text-center">
                            <p className="text-sm text-muted-foreground">Property Image</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-center text-muted-foreground py-10">
                                No recent activity for this building.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
