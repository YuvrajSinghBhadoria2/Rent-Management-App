'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Plus,
    Search,
    Loader2,
    User,
    Building2,
    Phone,
    ExternalLink,
    Filter,
    MoreVertical,
    Mail,
    IdCard,
    ChevronRight,
    Users
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials, cn } from '@/lib/utils';

export default function TenantsPage() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchTenants();
    }, []);

    async function fetchTenants() {
        try {
            const response = await fetch('/api/tenants');
            const result = await response.json();
            if (result.success) {
                setTenants(result.data);
            } else {
                toast.error(result.error || 'Failed to fetch tenants');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    }

    const filteredTenants = tenants.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.phone.includes(searchQuery)
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-8 py-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
                        Tenants
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Manage your resident directory, view profiles, and track active leases.
                    </p>
                </div>
                <Button asChild className="shadow-lg shadow-primary/20 h-11 px-6">
                    <Link href="/tenants/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Tenant
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search by name, phone or ID..."
                        className="pl-10 h-11 glass-card border-white/10 dark:bg-white/5 focus:border-primary/20 transition-all font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="h-11 px-6 glass-card border-white/10 hover:bg-white/5 shrink-0 w-full sm:w-auto">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                </Button>
            </div>

            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Retrieving Resident Data</p>
                    </div>
                </div>
            ) : filteredTenants.length > 0 ? (
                <div className="glass-card border-white/10 overflow-hidden shadow-2xl">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="hover:bg-transparent border-white/5">
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Resident</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Contact Info</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Lease Status</TableHead>
                                <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Onboarded</TableHead>
                                <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest py-4">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTenants.map((tenant, idx) => (
                                <TableRow
                                    key={tenant.id}
                                    className="border-white/5 hover:bg-white/5 transition-colors group"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12 border border-white/10 ring-2 ring-transparent group-hover:ring-primary/20 transition-all shadow-lg">
                                                <AvatarFallback className="bg-primary/5 text-primary text-sm font-bold">
                                                    {getInitials(tenant.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{tenant.name}</p>
                                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-tight">
                                                    <IdCard className="h-3 w-3" />
                                                    {tenant.kyc?.type || 'KYC'}: {tenant.kyc?.number || '—'}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <div className="p-1 rounded-md bg-green-500/10 text-green-500">
                                                    <Phone className="h-3 w-3" />
                                                </div>
                                                {tenant.phone}
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                                                <div className="p-1 rounded-md bg-blue-500/10 text-blue-500">
                                                    <Mail className="h-3 w-3" />
                                                </div>
                                                {tenant.email || 'No email provided'}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {tenant.currentLeaseId ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                                                <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20 font-bold uppercase tracking-widest text-[9px]">Active Lease</Badge>
                                            </div>
                                        ) : (
                                            <Badge variant="secondary" className="bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-[9px] border-transparent">No Active Lease</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm font-medium text-muted-foreground">
                                        {tenant.createdAt ? new Date(tenant.createdAt.seconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary group/btn" asChild>
                                                <Link href={`/tenants/${tenant.id}`}>
                                                    <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-0.5 transition-transform" />
                                                </Link>
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger render={
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/10">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                } />
                                                <DropdownMenuContent align="end" className="glass-card border-white/20">
                                                    <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Resident Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild className="rounded-lg">
                                                        <Link href={`/tenants/${tenant.id}`}>
                                                            <User className="mr-2 h-4 w-4" />
                                                            Full Profile
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="rounded-lg">
                                                        <Phone className="mr-2 h-4 w-4" />
                                                        Call Resident
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-white/5" />
                                                    <DropdownMenuItem className="text-destructive rounded-lg focus:bg-destructive/10 focus:text-destructive">
                                                        Remove Resident
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 glass-card border-white/10 border-dashed border-2 rounded-3xl text-center bg-white/5">
                    <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(59,130,246,0.1)]">
                        <Users className="h-10 w-10 text-primary opacity-50" />
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent">No tenants found</h3>
                    <p className="text-muted-foreground max-w-sm mt-3 font-medium">
                        {searchQuery
                            ? `No matching results for "${searchQuery}". Try refining your search parameters.`
                            : "Your resident database is currently empty. Start by onboarding your first tenant."}
                    </p>
                    {!searchQuery && (
                        <Button asChild className="mt-8 h-12 px-8 shadow-lg shadow-primary/20">
                            <Link href="/tenants/new">
                                <Plus className="mr-2 h-5 w-5" />
                                Onboard Your First Resident
                            </Link>
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
