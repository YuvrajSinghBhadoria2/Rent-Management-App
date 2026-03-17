'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Loader2,
    ArrowLeft,
    User,
    Phone,
    Mail,
    MapPin,
    FileText,
    Calendar,
    CreditCard,
    Building2,
    ExternalLink,
    ShieldCheck,
    Download
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function TenantDetailPage() {
    const router = useRouter();
    const { id } = useParams();
    const [tenant, setTenant] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchTenant();
    }, [id]);

    async function fetchTenant() {
        try {
            const response = await fetch(`/api/tenants/${id}`);
            const result = await response.json();
            if (result.success) {
                setTenant(result.data);
            } else {
                toast.error('Failed to fetch tenant details');
                router.push('/tenants');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
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
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push('/tenants')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight">{tenant.name}</h1>
                        <Badge variant={tenant.isActive ? 'default' : 'secondary'}>
                            {tenant.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4" /> {tenant.phone}
                    </p>
                </div>
                <Button variant="outline">Edit Profile</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="md:col-span-1 border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Tenant Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium uppercase">Email</p>
                            <p className="text-sm font-semibold flex items-center gap-2">
                                <Mail className="h-4 w-4 opacity-50" />
                                {tenant.email || 'Not provided'}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium uppercase">Address</p>
                            <p className="text-sm font-semibold flex items-center gap-2">
                                <MapPin className="h-4 w-4 opacity-50 shrink-0" />
                                {tenant.permanentAddress}
                            </p>
                        </div>
                        <Separator />
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium uppercase">KYC Status</p>
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-semibold capitalize">{tenant.kyc.type} Verified</span>
                            </div>
                            <p className="text-xs font-mono bg-white px-2 py-1 rounded border inline-block mt-1">
                                {tenant.kyc.number}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs for Lease, Documents, History */}
                <div className="md:col-span-2">
                    <Tabs defaultValue="lease" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="lease">Current Lease</TabsTrigger>
                            <TabsTrigger value="documents">Documents</TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>

                        <TabsContent value="lease" className="mt-4">
                            {tenant.currentLease ? (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-primary" />
                                            Lease Details
                                        </CardTitle>
                                        <CardDescription>Active agreement for current room allocation.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">Allocation</p>
                                                <p className="font-semibold flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-primary" />
                                                    Building & Room ID: {tenant.currentRoomId}
                                                    {tenant.currentBedId && <Badge variant="secondary" className="ml-1">Bed {tenant.currentBedId}</Badge>}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">Monthly Rent</p>
                                                <p className="text-xl font-bold text-primary">
                                                    {formatCurrency(tenant.currentLease.rentAmount)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">Start Date</p>
                                                <p className="font-semibold flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    {tenant.currentLease.startDate}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">Deposit Paid</p>
                                                <p className="font-semibold flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                    {formatCurrency(tenant.currentLease.securityDeposit)}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card>
                                    <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                                        <FileText className="h-10 w-10 text-muted-foreground mb-3 opacity-20" />
                                        <h3 className="text-lg font-medium">No active lease</h3>
                                        <p className="text-muted-foreground max-w-xs mt-1">This tenant is currently registered but not allocated to any room.</p>
                                        <Button variant="outline" className="mt-4">Allocate Room</Button>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="documents" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">KYC Documents</CardTitle>
                                    <CardDescription>Proof of identity and address documents.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="border rounded-lg p-4 bg-muted/20">
                                            <p className="text-sm font-medium mb-3 capitalize">{tenant.kyc.type} — Front Side</p>
                                            {tenant.kyc.frontUrl ? (
                                                <div className="space-y-2">
                                                    <div className="h-32 bg-gray-100 rounded border overflow-hidden">
                                                        <img src={tenant.kyc.frontUrl} alt="KYC Front" className="w-full h-full object-cover" />
                                                    </div>
                                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                                        <a href={tenant.kyc.frontUrl} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="mr-2 h-4 w-4" /> View Full
                                                        </a>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic">No image uploaded</p>
                                            )}
                                        </div>

                                        <div className="border rounded-lg p-4 bg-muted/20">
                                            <p className="text-sm font-medium mb-3 capitalize">{tenant.kyc.type} — Back Side</p>
                                            {tenant.kyc.backUrl ? (
                                                <div className="space-y-2">
                                                    <div className="h-32 bg-gray-100 rounded border overflow-hidden">
                                                        <img src={tenant.kyc.backUrl} alt="KYC Back" className="w-full h-full object-cover" />
                                                    </div>
                                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                                        <a href={tenant.kyc.backUrl} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="mr-2 h-4 w-4" /> View Full
                                                        </a>
                                                    </Button>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic">No image uploaded</p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history" className="mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Tenant Activity History</CardTitle>
                                </CardHeader>
                                <CardContent className="py-20 text-center">
                                    <p className="text-muted-foreground italic">No past activity or leases found for this tenant.</p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
