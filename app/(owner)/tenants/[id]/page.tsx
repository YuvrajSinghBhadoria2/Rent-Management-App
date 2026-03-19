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
    Download,
    Sparkles,
    ChevronRight,
    History,
    FileSearch,
    UserCog
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
                toast.error('Failed to retrieve resident profile');
                router.push('/tenants');
            }
        } catch (error) {
            console.error(error);
            toast.error('Internal server error');
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <User className="h-6 w-6 text-primary opacity-50" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-6xl mx-auto pb-24 animate-fade-in px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between">
                <div className="flex items-center gap-5">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/tenants')}
                        className="rounded-full hover:bg-white/10 glass-card"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">{tenant.name}</h1>
                            <Badge className={cn(
                                "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none",
                                tenant.isActive
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : "bg-gray-100 dark:bg-white/5 text-gray-500"
                            )}>
                                {tenant.isActive ? 'Active Resident' : 'Inactive'}
                            </Badge>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1.5 font-medium italic">
                            <Phone className="h-3.5 w-3.5 text-primary opacity-50" /> {tenant.phone}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="rounded-full glass-card border-none px-6 font-black text-[10px] uppercase tracking-widest transition-transform hover:scale-105">
                        <UserCog className="mr-2 h-4 w-4" />
                        Edit Profile
                    </Button>
                    {tenant.isActive && (
                        <Button
                            className="rounded-full px-8 h-12 flex items-center gap-3 group shadow-2xl transition-all hover:scale-105"
                            onClick={() => window.open(`/api/tenants/${tenant.id}/ledger`, '_blank')}
                        >
                            <Download className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" />
                            <span className="font-black text-[10px] uppercase tracking-widest">Financial Ledger</span>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Profile Card Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                    <Card className="glass-card border-none rounded-[2.5rem] overflow-hidden shadow-none ring-4 ring-primary/5">
                        <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent relative">
                            <div className="absolute -bottom-10 left-8">
                                <div className="w-20 h-20 rounded-3xl bg-white dark:bg-black shadow-2xl flex items-center justify-center font-black text-3xl text-primary border-4 border-white dark:border-black/40">
                                    {tenant.name ? tenant.name[0] : 'T'}
                                </div>
                            </div>
                        </div>
                        <CardHeader className="p-8 pt-12 pb-4">
                            <CardTitle className="text-xl font-black flex items-center gap-3">
                                Resident Dossier
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                                        <Mail className="h-4 w-4 text-primary opacity-60" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Electronic Mail</p>
                                        <p className="text-sm font-bold dark:text-white truncate max-w-[180px]">{tenant.email || 'Not registered'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                                        <MapPin className="h-4 w-4 text-primary opacity-60" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Permanent Address</p>
                                        <p className="text-sm font-bold dark:text-white leading-relaxed">{tenant.permanentAddress}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator className="opacity-10" />

                            <div className="p-6 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 space-y-4 relative overflow-hidden group">
                                <ShieldCheck className="absolute -right-2 -bottom-2 h-16 w-16 text-emerald-500/10 group-hover:scale-110 transition-transform" />
                                <div className="space-y-1 relative z-10">
                                    <p className="text-[9px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest">KYC Protocol Verified</p>
                                    <p className="text-sm font-black dark:text-white capitalize">{tenant.kyc.type} Identity</p>
                                </div>
                                <div className="text-[10px] font-mono bg-white dark:bg-black/40 px-4 py-2 rounded-xl border border-emerald-500/10 inline-block text-emerald-700 dark:text-emerald-300 font-black relative z-10">
                                    {tenant.kyc.number}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2">
                    <Tabs defaultValue="lease" className="w-full">
                        <TabsList className="bg-transparent border-b border-gray-100 dark:border-white/5 w-full justify-start rounded-none h-auto p-0 gap-10 mb-10 overflow-x-auto scrollbar-none">
                            <TabsTrigger
                                value="lease"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 data-[state=active]:text-primary transition-all"
                            >
                                Current Lease
                            </TabsTrigger>
                            <TabsTrigger
                                value="documents"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 data-[state=active]:text-primary transition-all"
                            >
                                KYC Documents
                            </TabsTrigger>
                            <TabsTrigger
                                value="history"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 data-[state=active]:text-primary transition-all"
                            >
                                Activity Log
                            </TabsTrigger>
                        </TabsList>

                        {/* Lease Tab */}
                        <TabsContent value="lease" className="focus-visible:ring-0 animate-fade-in space-y-8">
                            {tenant.currentLease ? (
                                <Card className="glass-card border-none rounded-[2.5rem] shadow-none overflow-hidden">
                                    <CardHeader className="p-10 pb-6">
                                        <CardTitle className="text-2xl font-black flex items-center gap-4">
                                            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-500">
                                                <FileText className="h-6 w-6" />
                                            </div>
                                            Allocation Metrics
                                        </CardTitle>
                                        <CardDescription className="font-medium ml-16">Active occupational parameters and commitment details.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-10 pt-0 space-y-12">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                            <div className="space-y-4">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Allocated Inventory</p>
                                                <div className="flex items-center gap-5 group cursor-pointer" onClick={() => router.push(`/buildings/${tenant.currentBuildingId}/rooms/${tenant.currentRoomId}`)}>
                                                    <div className="p-5 rounded-[2rem] bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 group-hover:border-primary/30 transition-all group-hover:scale-105">
                                                        <Building2 className="h-8 w-8 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-2xl dark:text-white tracking-tighter">Room {tenant.currentRoomId}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[9px] font-black uppercase tracking-widest px-3">
                                                                UNIT ACTIVE
                                                            </Badge>
                                                            {tenant.currentBedId && (
                                                                <Badge variant="outline" className="text-[9px] font-black px-3 border-primary/20 text-primary uppercase tracking-widest">
                                                                    BED {tenant.currentBedId}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Monthly Commitment</p>
                                                <div className="flex flex-col">
                                                    <p className="text-5xl font-black tracking-tighter text-gray-900 dark:text-white">
                                                        {formatCurrency(tenant.currentLease.rentAmount)}
                                                    </p>
                                                    <p className="text-[11px] font-bold text-emerald-600 mt-2 uppercase tracking-[0.15em] flex items-center gap-2">
                                                        <Sparkles className="h-3 w-3" />
                                                        Includes Full Maintenance
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <Separator className="opacity-10" />

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 p-10 rounded-[2.5rem] bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-gray-400 mb-1">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">Move-in Date</p>
                                                </div>
                                                <p className="font-black text-lg dark:text-white">{formatDate(tenant.currentLease.startDate)}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-gray-400 mb-1">
                                                    <CreditCard className="h-3.5 w-3.5" />
                                                    <p className="text-[10px] font-black uppercase tracking-widest">Security Escrow</p>
                                                </div>
                                                <p className="font-black text-lg text-primary">{formatCurrency(tenant.currentLease.securityDeposit)}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <div className="px-10 pb-10">
                                        <Button variant="ghost" className="w-full h-14 rounded-2xl border-2 border-dashed border-gray-100 dark:border-white/5 text-gray-400 font-bold text-xs uppercase tracking-widest hover:border-primary/20 hover:text-primary hover:bg-primary/5 transition-all">
                                            View Digital Lease Agreement
                                        </Button>
                                    </div>
                                </Card>
                            ) : (
                                <div className="glass-card rounded-[2.5rem] p-20 flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="p-6 rounded-full bg-gray-50 dark:bg-white/5">
                                        <FileSearch className="h-12 w-12 text-gray-300 opacity-40" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black dark:text-white tracking-tight">Zero-Allocation Detected</h3>
                                        <p className="text-gray-400 max-w-[320px] text-sm mt-1 mx-auto font-medium italic">This resident is currently on-boarded but not assigned to any active inventory protocol.</p>
                                    </div>
                                    <Button className="rounded-full px-10 h-12 font-black text-[10px] uppercase tracking-widest shadow-xl">Initialize Allocation</Button>
                                </div>
                            )}
                        </TabsContent>

                        {/* Documents Tab */}
                        <TabsContent value="documents" className="focus-visible:ring-0 animate-fade-in">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                                {[
                                    { label: 'Primary Identity Front', url: tenant.kyc.frontUrl },
                                    { label: 'Primary Identity Back', url: tenant.kyc.backUrl }
                                ].map((doc, idx) => (
                                    <div key={idx} className="glass-card border-none rounded-[2.5rem] p-8 space-y-6 group relative overflow-hidden">
                                        <div className="flex items-center justify-between relative z-10">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">{doc.label}</p>
                                            {doc.url && (
                                                <Link href={doc.url} target="_blank" className="p-2 rounded-xl bg-primary/10 text-primary hover:scale-110 transition-transform">
                                                    <ExternalLink className="h-4 w-4" />
                                                </Link>
                                            )}
                                        </div>
                                        {doc.url ? (
                                            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 dark:bg-black group-hover:scale-[1.02] shadow-2xl transition-all duration-500 ring-1 ring-white/10">
                                                <img src={doc.url} alt={doc.label} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-full bg-white/20 backdrop-blur-md">
                                                            <Sparkles className="h-3 w-3 text-white" />
                                                        </div>
                                                        <p className="text-white text-[10px] font-black uppercase tracking-widest">Encrypted Document Access</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="aspect-[4/3] rounded-3xl border-2 border-dashed border-gray-100 dark:border-white/5 flex flex-col items-center justify-center gap-3 opacity-40">
                                                <FileSearch className="h-8 w-8 text-gray-400" />
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Document Pending</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        {/* History Tab */}
                        <TabsContent value="history" className="focus-visible:ring-0 animate-fade-in">
                            <Card className="glass-card border-none rounded-[2.5rem] overflow-hidden">
                                <CardContent className="p-20 flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                                    <div className="p-6 rounded-full bg-gray-50 dark:bg-white/5">
                                        <History className="h-12 w-12 text-gray-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black dark:text-white tracking-tight">Registry Clean</h3>
                                        <p className="text-gray-400 max-w-[320px] text-sm mt-1 mx-auto font-medium italic">Historical movement and financial cycles will materialize here over time.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}

