'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';

interface LeaseData {
    id: string;
    startDate: any;
    endDate: any;
    rentAmount: number;
    securityDeposit: number;
    lockInMonths: number;
    noticePeriodDays: number;
    status: string;
    buildingName: string;
    roomNumber: string;
    agreementUrl: string | null;
}

export default function TenantLeasePage() {
    const [lease, setLease] = useState<LeaseData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchLease() {
            try {
                const response = await fetch('/api/tenant/lease');
                const result = await response.json();
                if (result.success) {
                    setLease(result.data);
                }
            } catch (error) {
                console.error('Error fetching lease:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchLease();
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-60 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!lease) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">My Lease</h1>
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No lease agreement yet</p>
                        <p className="text-sm text-muted-foreground">Contact your owner for lease details</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const startDate = lease.startDate?.toDate ? format(lease.startDate.toDate(), 'dd MMM yyyy') : 'N/A';
    const endDate = lease.endDate?.toDate ? format(lease.endDate.toDate(), 'dd MMM yyyy') : 'N/A';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">My Lease</h1>
                {lease.agreementUrl && (
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download Agreement
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lease Details</CardTitle>
                    <CardDescription>
                        Current lease agreement with your landlord
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Property</p>
                            <p className="font-medium">{lease.buildingName} - Room {lease.roomNumber}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Status</p>
                            <p className={`font-medium capitalize ${
                                lease.status === 'active' ? 'text-green-600' : 
                                lease.status === 'notice_period' ? 'text-orange-600' : 'text-gray-600'
                            }`}>
                                {lease.status}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Start Date</p>
                            <p className="font-medium">{startDate}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">End Date</p>
                            <p className="font-medium">{endDate}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Monthly Rent</p>
                            <p className="font-medium">₹{lease.rentAmount.toLocaleString()}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Security Deposit</p>
                            <p className="font-medium">₹{lease.securityDeposit.toLocaleString()}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Lock-in Period</p>
                            <p className="font-medium">{lease.lockInMonths} months</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Notice Period</p>
                            <p className="font-medium">{lease.noticePeriodDays} days</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Terms & Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                    <ol className="list-decimal list-inside space-y-2">
                        <li>Rent is due by the 5th of each month</li>
                        <li>Late payment may incur penalty charges as per agreement</li>
                        <li>Minimum lock-in period of {lease.lockInMonths} months</li>
                        <li>{lease.noticePeriodDays} days notice required before moving out</li>
                        <li>No subletting without written consent from owner</li>
                        <li>Tenant responsible for damages beyond normal wear and tear</li>
                    </ol>
                </CardContent>
            </Card>
        </div>
    );
}
