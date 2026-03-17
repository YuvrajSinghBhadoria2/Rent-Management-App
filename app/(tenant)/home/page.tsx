'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, FileText, Receipt, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';

interface TenantData {
    currentBuildingId: string | null;
    currentRoomId: string | null;
    currentRent: number | null;
    leaseStatus: string | null;
}

interface DashboardData {
    tenant: TenantData | null;
    pendingBills: number;
    openComplaints: number;
}

export default function TenantHome() {
    const { userDoc } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch('/api/tenant/dashboard');
                const result = await response.json();
                if (result.success) {
                    setData(result.data);
                }
            } catch (error) {
                console.error('Error fetching tenant data:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-60 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Welcome back, {userDoc?.name || 'Tenant'}
                </h1>
                <p className="text-muted-foreground">
                    Here is your rental overview.
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Rent</CardTitle>
                        <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {data?.tenant?.currentRent 
                                ? `₹${data.tenant.currentRent.toLocaleString()}` 
                                : 'Not assigned'}
                        </div>
                        <p className="text-xs text-muted-foreground">per month</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Bills</CardTitle>
                        <Receipt className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.pendingBills || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {data?.pendingBills ? 'View in bills' : 'All paid!'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Open Complaints</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data?.openComplaints || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {data?.openComplaints ? 'View in complaints' : 'No complaints'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lease Status</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">
                            {data?.tenant?.leaseStatus || 'No lease'}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {data?.tenant?.leaseStatus === 'active' ? 'Lease active' : 'Contact owner'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Button asChild className="w-full justify-start">
                            <Link href="/bills">
                                <Receipt className="mr-2 h-4 w-4" />
                                View Bills & Pay
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start">
                            <Link href="/complaints/new">
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Raise Complaint
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="w-full justify-start">
                            <Link href="/lease">
                                <FileText className="mr-2 h-4 w-4" />
                                View Lease Agreement
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Room Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data?.tenant?.currentRoomId ? (
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <span className="font-medium">Assigned</span>
                                </div>
                                <Button asChild variant="outline" className="w-full">
                                    <Link href="/room">View Room Details</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                <p className="text-muted-foreground">No room assigned yet</p>
                                <p className="text-sm text-muted-foreground">Contact your owner</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
