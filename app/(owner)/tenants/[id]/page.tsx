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
import Link from 'next/link';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

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
        <div className="space-y-10 max-w-6xl mx-auto pb-20 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/tenants')}
                        className="rounded-full hover:bg-white/10 glass-card"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">{tenant.name}</h1>
                            <Badge className={cn(
                                "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest",
                                tenant.isActive
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                    : "bg-gray-100 text-gray-500 border-gray-200"
                            )}>
                                {tenant.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1.5 font-medium">
                            <Phone className="h-3.5 w-3.5" /> {tenant.phone}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="rounded-full glass-card border-none px-6 font-bold text-xs uppercase tracking-widest">Edit Profile</Button>
                    {tenant.isActive && (
                        <Button
                            className="rounded-full px-6 flex items-center gap-2 group shadow-xl"
                            onClick={() => window.open(`/api/tenants/${tenant.id}/ledger`, '_blank')}
                        >
                            <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                            <span>Download Ledger</span>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="glass-card border-none rounded-[2rem] overflow-hidden shadow-none">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                    <User className="h-5 w-5" />
                                </div>
                                Tenant Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-8">
                            <div className="space-y-1.5">
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em]">Contact Email</p>
                                <p className="text-sm font-bold flex items-center gap-2.5 dark:text-white">
                                    <Mail className="h-4 w-4 text-primary opacity-60" />
                                    {tenant.email || 'Not provided'}
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-black uppercase tracking-[0.2em]">Permanent Address</p>
                                <p className="text-sm font-bold flex items-center gap-2.5 dark:text-white leading-relaxed">
                                    <MapPin className="h-4 w-4 text-primary opacity-60 shrink-0 mt-0.5" />
                                    {tenant.permanentAddress}
                                </p>
                            </div>

                            <div className="p-6 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 space-y-3">
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.2em]">Compliance Check</p>
                                <div className="flex items-center gap-2.5">
                                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                                    <span className="text-sm font-black dark:text-white capitalize">{tenant.kyc.type} Verified</span>
                                </div>
                                <div className="text-[11px] font-mono bg-white dark:bg-black/40 px-3 py-1.5 rounded-xl border border-emerald-500/10 inline-block text-emerald-700 dark:text-emerald-300">
                                    {tenant.kyc.number}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs Area */}
                <div className="md:col-span-2">
                    <Tabs defaultValue="lease" className="w-full">
                        <TabsList className="bg-transparent border-b border-gray-100 dark:border-white/5 w-full justify-start rounded-none h-auto p-0 gap-8 mb-8">
                            <TabsTrigger
                                value="lease"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 data-[state=active]:text-primary"
                            >
                                Current Lease
                            </TabsTrigger>
                            <TabsTrigger
                                value="documents"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 data-[state=active]:text-primary"
                            >
                                KYC Documents
                            </TabsTrigger>
                            <TabsTrigger
                                value="history"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 data-[state=active]:text-primary"
                            >
                                Activity History
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="lease" className="focus-visible:ring-0 animate-fade-in">
                            {tenant.currentLease ? (
                                <Card className="glass-card border-none rounded-[2rem] shadow-none overflow-hidden">
                                    <CardHeader className="p-8">
                                        <CardTitle className="text-xl font-black flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            Allocation Details
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-8 pt-0 space-y-10">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                                            <div className="space-y-2.5">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Allocated Space</p>
                                                <div className="flex items-center gap-3 group">
                                                    <div className="p-4 rounded-[1.5rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 group-hover:border-primary/20 transition-colors">
                                                        <Building2 className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-lg dark:text-white line-clamp-1">Room {tenant.currentRoomId}</p>
                                                        {tenant.currentBedId && (
                                                            <Badge variant="secondary" className="mt-1 bg-primary/10 text-primary border-none text-[9px] font-bold">
                                                                BED {tenant.currentBedId}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2.5">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Monthly Commitment</p>
                                                <div className="flex flex-col">
                                                    <p className="text-4xl font-black tracking-tighter text-primary">
                                                        {formatCurrency(tenant.currentLease.rentAmount)}
                                                    </p>
                                                    <p className="text-[11px] font-bold text-gray-500 mt-1 uppercase tracking-widest">Includes maintenance</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 p-8 rounded-[2rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                                            <div className="space-y-2">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Move-in Date</p>
                                                <div className="flex items-center gap-2.5">
                                                    <Calendar className="h-5 w-5 text-gray-400" />
                                                    <span className="font-black text-sm dark:text-white">{formatDate(tenant.currentLease.startDate)}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Security Deposit</p>
                                                <div className="flex items-center gap-2.5">
                                                    <CreditCard className="h-5 w-5 text-gray-400" />
                                                    <span className="font-black text-sm dark:text-white">{formatCurrency(tenant.currentLease.securityDeposit)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="glass-card rounded-[2rem] p-16 flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="p-4 rounded-full bg-gray-50 dark:bg-white/5">
                                        <FileText className="h-10 w-10 text-gray-300 opacity-50" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black dark:text-white">Incomplete Allocation</h3>
                                        <p className="text-gray-400 max-w-[280px] text-sm mt-1 mx-auto font-medium">This tenant is currently registered but not assigned to any active billing unit.</p>
                                    </div>
                                    <Button className="rounded-full px-8 mt-4 font-bold">Assign Room</Button>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="documents" className="focus-visible:ring-0 animate-fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[
                                    { label: 'KYC Front', url: tenant.kyc.frontUrl },
                                    { label: 'KYC Back', url: tenant.kyc.backUrl }
                                ].map((doc, idx) => (
                                    <div key={idx} className="glass-card border-none rounded-[2rem] p-6 space-y-4 group">
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{doc.label}</p>
                                            {doc.url && (
                                                <Link href={doc.url} target="_blank">
                                                    <ExternalLink className="h-3.5 w-3.5 text-primary opacity-50 hover:opacity-100 transition-opacity" />
                                                </Link>
                                            )}
                                        </div>
                                        {doc.url ? (
                                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 dark:bg-black group-hover:scale-[1.02] transition-transform shadow-lg">
                                                <img src={doc.url} alt={doc.label} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                                    <p className="text-white text-[10px] font-black uppercase tracking-widest">Click to enlarge</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-100 dark:border-white/5 flex items-center justify-center">
                                                <p className="text-[11px] font-bold text-gray-300 uppercase italic">Image Missing</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="history" className="focus-visible:ring-0 animate-fade-in">
                            <div className="glass-card rounded-[2rem] p-16 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                <div className="p-4 rounded-full bg-gray-50 dark:bg-white/5">
                                    <Calendar className="h-10 w-10 text-gray-300" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">No Past Records</h3>
                                    <p className="text-gray-400 max-w-[280px] text-sm mt-1 mx-auto">Movement and billing history will appear here over time.</p>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
