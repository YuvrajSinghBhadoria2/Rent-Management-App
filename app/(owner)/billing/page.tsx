'use client';

import { useEffect, useState } from 'react';
import {
    Loader2,
    Search,
    Filter,
    Banknote,
    Clock,
    AlertCircle,
    CheckCircle2,
    Plus,
    ArrowRight,
    Download,
    MoreVertical,
    Building2
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatCurrency, formatDate } from '@/lib/utils';
import RecordPaymentDialog from '@/components/owner/RecordPaymentDialog';

export default function BillingPage() {
    const [bills, setBills] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Dialog State
    const [selectedBill, setSelectedBill] = useState<any>(null);
    const [isRecordOpen, setIsRecordOpen] = useState(false);

    useEffect(() => {
        fetchBills();
    }, [statusFilter]);

    async function fetchBills() {
        try {
            let url = '/api/bills';
            if (statusFilter !== 'all') url += `?status=${statusFilter}`;

            const response = await fetch(url);
            const result = await response.json();
            if (result.success) {
                setBills(result.data);
            } else {
                toast.error(result.error || 'Failed to fetch bills');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    }

    const filteredBills = bills.filter(b =>
        b.tenantId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.month.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        pending: bills.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.totalAmount, 0),
        overdue: bills.filter(b => b.status === 'overdue').reduce((sum, b) => sum + b.totalAmount, 0),
        collected: bills.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.totalAmount, 0),
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Billing & Payments</h1>
                    <p className="text-muted-foreground">Monitor revenue, track overdue rent, and manage receipts.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Export Report
                    </Button>
                    <Button onClick={() => toast.info("Daily cron job handles this automatically, but you can trigger it from Settings.")}>
                        <Plus className="mr-2 h-4 w-4" /> Generate Bills
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Collection</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.collected)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total rent collected this month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.pending)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Awaiting payment from tenants</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
                        <AlertCircle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{formatCurrency(stats.overdue)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Past due date + grace period</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by tenant ID or month..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || 'all')}>
                    <SelectTrigger className="w-[180px]">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <SelectValue placeholder="All Status" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="flex h-60 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredBills.length > 0 ? (
                <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Bill Period</TableHead>
                                <TableHead>Tenant ID</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBills.map((bill) => (
                                <TableRow key={bill.id}>
                                    <TableCell>
                                        <div className="font-medium">{bill.month} {bill.year}</div>
                                        <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5 uppercase tracking-wider">
                                            <Building2 className="h-3 w-3" /> Room {bill.roomId}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{bill.tenantId.substring(0, 8)}...</TableCell>
                                    <TableCell>
                                        <div className="font-semibold">{formatCurrency(bill.totalAmount)}</div>
                                        {bill.lateFee > 0 && (
                                            <p className="text-[10px] text-destructive">+ {formatCurrency(bill.lateFee)} penalty</p>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {bill.dueDate ? formatDate(new Date(bill.dueDate)) : '—'}
                                    </TableCell>
                                    <TableCell>
                                        {bill.status === 'paid' ? (
                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Paid</Badge>
                                        ) : bill.status === 'overdue' ? (
                                            <Badge variant="destructive">Overdue</Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Pending</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Manage Bill</DropdownMenuLabel>
                                                {bill.status !== 'paid' && (
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedBill(bill);
                                                        setIsRecordOpen(true);
                                                    }}>
                                                        <Banknote className="mr-2 h-4 w-4" />
                                                        Record Payment
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download Receipt
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <ArrowRight className="mr-2 h-4 w-4" />
                                                    View Tenant
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
                <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-lg text-center bg-white shadow-sm">
                    <Banknote className="h-12 w-12 text-muted-foreground mb-4 opacity-10" />
                    <h3 className="text-lg font-medium">No bills found</h3>
                    <p className="text-muted-foreground max-w-sm mt-1">
                        Rent bills are generated automatically on the 1st of every month.
                    </p>
                </div>
            )}

            {selectedBill && (
                <RecordPaymentDialog
                    bill={selectedBill}
                    isOpen={isRecordOpen}
                    onClose={() => setIsRecordOpen(false)}
                    onSuccess={fetchBills}
                />
            )}
        </div>
    );
}
