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
    MoreVertical
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
import { getInitials } from '@/lib/utils';

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
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Tenants</h1>
                    <p className="text-muted-foreground">
                        Manage your residents, view profiles, and track leases.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/tenants/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Tenant
                    </Link>
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or phone..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                </Button>
            </div>

            {isLoading ? (
                <div className="flex h-60 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredTenants.length > 0 ? (
                <div className="border rounded-lg bg-white overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tenant</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Current Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTenants.map((tenant) => (
                                <TableRow key={tenant.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border">
                                                <AvatarFallback className="bg-primary/5 text-primary text-xs">
                                                    {getInitials(tenant.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium leading-none">{tenant.name}</p>
                                                <p className="text-xs text-muted-foreground mt-1 capitalize">{tenant.kyc.type}: {tenant.kyc.number}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5 text-sm">
                                                <Phone className="h-3 w-3 text-muted-foreground" />
                                                {tenant.phone}
                                            </div>
                                            <p className="text-xs text-muted-foreground">{tenant.email || 'No email'}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {tenant.currentLeaseId ? (
                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Active Lease</Badge>
                                        ) : (
                                            <Badge variant="secondary">No Active Lease</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {tenant.createdAt ? new Date(tenant.createdAt.seconds * 1000).toLocaleDateString() : '—'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/tenants/${tenant.id}`}>
                                                        <User className="mr-2 h-4 w-4" />
                                                        View Profile
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Phone className="mr-2 h-4 w-4" />
                                                    Call Tenant
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">
                                                    Remove Tenant
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg text-center bg-white">
                    <User className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">No tenants found</h3>
                    <p className="text-muted-foreground max-w-sm mt-1">
                        {searchQuery
                            ? `No results match your search "${searchQuery}".`
                            : "You haven't added any tenants yet. Click the button above to onboard your first tenant."}
                    </p>
                    {!searchQuery && (
                        <Button asChild className="mt-6">
                            <Link href="/tenants/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Your First Tenant
                            </Link>
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
