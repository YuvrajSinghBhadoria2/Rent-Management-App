'use client';

import Link from 'next/link';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    ChevronRight,
    MoreVertical,
    User,
    Phone,
    Mail,
    IdCard,
    Users,
    Plus,
    Loader2,
    Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Tenant {
    id: string;
    name: string;
    phone: string;
    email?: string;
    kyc?: {
        type: string;
        number: string;
    };
    currentLeaseId?: string;
    createdAt: {
        seconds: number;
    };
}

interface TenantTableProps {
    tenants: Tenant[];
    isLoading: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onViewProfile?: (id: string) => void;
    onCallTenant?: (phone: string) => void;
    onRemoveTenant?: (id: string) => void;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function TenantTable({
    tenants,
    isLoading,
    searchQuery,
    onSearchChange,
    onViewProfile,
    onCallTenant,
    onRemoveTenant,
}: TenantTableProps) {
    const filteredTenants = tenants.filter(
        (tenant) =>
            tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tenant.phone.includes(searchQuery) ||
            tenant.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search by name, phone, or email..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full h-11 px-4 pl-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 focus:border-transparent"
                    />
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <Button
                    variant="outline"
                    className="h-11 px-6 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                </Button>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-blue-700 opacity-50" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 animate-pulse">
                            Retrieving Resident Data
                        </p>
                    </div>
                </div>
            ) : filteredTenants.length > 0 ? (
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                            <TableRow className="hover:bg-transparent border-gray-100 dark:border-gray-800">
                                <TableHead className="text-xs uppercase tracking-wide text-gray-400 font-medium py-4">
                                    Resident
                                </TableHead>
                                <TableHead className="text-xs uppercase tracking-wide text-gray-400 font-medium py-4">
                                    Contact Info
                                </TableHead>
                                <TableHead className="text-xs uppercase tracking-wide text-gray-400 font-medium py-4">
                                    Lease Status
                                </TableHead>
                                <TableHead className="text-xs uppercase tracking-wide text-gray-400 font-medium py-4">
                                    Onboarded
                                </TableHead>
                                <TableHead className="text-right text-xs uppercase tracking-wide text-gray-400 font-medium py-4">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTenants.map((tenant, idx) => (
                                <TableRow
                                    key={tenant.id}
                                    className="border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <TableCell className="py-4">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12 border border-gray-200 dark:border-gray-700 ring-2 ring-transparent">
                                                <AvatarFallback className="bg-blue-50 text-blue-700 text-sm font-bold">
                                                    {getInitials(tenant.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {tenant.name}
                                                </p>
                                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5 uppercase font-medium tracking-tight">
                                                    <IdCard className="h-3 w-3" />
                                                    {tenant.kyc?.type || 'KYC'}: {tenant.kyc?.number || '—'}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                                                <div className="p-1 rounded-md bg-green-500/10 text-green-500">
                                                    <Phone className="h-3 w-3" />
                                                </div>
                                                {tenant.phone}
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] text-gray-400 font-medium">
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
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200 font-medium uppercase tracking-widest text-[9px]">
                                                    Active Lease
                                                </Badge>
                                            </div>
                                        ) : (
                                            <Badge
                                                variant="secondary"
                                                className="bg-gray-100 text-gray-500 font-medium uppercase tracking-widest text-[9px]"
                                            >
                                                No Active Lease
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm font-medium text-gray-500">
                                        {tenant.createdAt
                                            ? new Date(tenant.createdAt.seconds * 1000).toLocaleDateString('en-GB', {
                                                  day: '2-digit',
                                                  month: 'short',
                                                  year: 'numeric',
                                              })
                                            : '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-xl hover:bg-blue-50 hover:text-blue-700"
                                                asChild
                                            >
                                                <Link href={`/tenants/${tenant.id}`}>
                                                    <ChevronRight className="h-5 w-5" />
                                                </Link>
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                                                >
                                                    <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                                                        Resident Actions
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        className="rounded-lg cursor-pointer"
                                                        onClick={() => onViewProfile?.(tenant.id)}
                                                    >
                                                        <User className="mr-2 h-4 w-4" />
                                                        Full Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="rounded-lg cursor-pointer"
                                                        onClick={() => onCallTenant?.(tenant.phone)}
                                                    >
                                                        <Phone className="mr-2 h-4 w-4" />
                                                        Call Resident
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-gray-100 dark:bg-gray-800" />
                                                    <DropdownMenuItem
                                                        className="rounded-lg cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
                                                        onClick={() => onRemoveTenant?.(tenant.id)}
                                                    >
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
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl text-center">
                    <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-6">
                        <Users className="h-10 w-10 text-blue-700 opacity-50" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">No tenants found</h3>
                    <p className="text-gray-500 max-w-sm mt-3 font-medium">
                        {searchQuery
                            ? `No matching results for "${searchQuery}". Try refining your search parameters.`
                            : 'Your resident database is currently empty. Start by onboarding your first tenant.'}
                    </p>
                    {!searchQuery && (
                        <Button asChild className="mt-8 h-12 px-8 shadow-lg">
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
