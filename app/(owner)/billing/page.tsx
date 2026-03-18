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
    Building2,
    Users,
    TrendingUp,
    FileText,
    Receipt,
    ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { StatCard } from '@/components/owner/StatCard';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    const router = useRouter();
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
        <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-8 py-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
                        Financial Ledger
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">Monitor revenue streams, track outstanding dues, and manage digital receipts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="glass-card border-white/10 h-11 px-6 font-bold text-[10px] uppercase tracking-widest">
                        <Download className="mr-2 h-3.5 w-3.5" /> Export Ledger
                    </Button>
                    <Button
                        className="shadow-lg shadow-primary/20 h-11 px-8 font-bold text-[10px] uppercase tracking-widest"
                        onClick={() => toast.info("Cycle automation handles global billing generation.")}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Manual Generation
                    </Button>
                </div>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="Portfolio Yield"
                    value={formatCurrency(stats.collected)}
                    icon={TrendingUp}
                    color="green"
                    sub="Total collections in current cycle"
                />
                <StatCard
                    label="Outstanding Dues"
                    value={formatCurrency(stats.pending + stats.overdue)}
                    icon={Clock}
                    color="amber"
                    sub="Estimated receivables pending"
                />
                <StatCard
                    label="Delinquency Risk"
                    value={formatCurrency(stats.overdue)}
                    icon={AlertCircle}
                    color="red"
                    sub="Critical bills past grace period"
                />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Filter by resident ID or billing month..."
                        className="pl-11 h-12 glass-card border-white/10 dark:bg-white/5 focus:border-primary/20 transition-all font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value || 'all')}>
                    <SelectTrigger className="w-full md:w-[220px] h-12 glass-card border-white/10 px-5 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <SelectValue placeholder="All Status" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/10 rounded-2xl shadow-2xl">
                        <SelectItem value="all" className="font-bold text-[10px] uppercase tracking-widest">All Records</SelectItem>
                        <SelectItem value="paid" className="font-bold text-[10px] uppercase tracking-widest text-emerald-500">Collected</SelectItem>
                        <SelectItem value="pending" className="font-bold text-[10px] uppercase tracking-widest text-amber-500">Pending</SelectItem>
                        <SelectItem value="overdue" className="font-bold text-[10px] uppercase tracking-widest text-red-500">System Overdue</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? (
                <div className="flex h-80 items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Ledger</p>
                    </div>
                </div>
            ) : filteredBills.length > 0 ? (
                <Card className="glass-card border-white/10 shadow-2xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-white/5 border-b border-white/5">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="px-8 h-16 text-[10px] font-bold uppercase tracking-widest">Billing Period</TableHead>
                                <TableHead className="h-16 text-[10px] font-bold uppercase tracking-widest">Asset Resident</TableHead>
                                <TableHead className="h-16 text-[10px] font-bold uppercase tracking-widest">Invoice Value</TableHead>
                                <TableHead className="h-16 text-[10px] font-bold uppercase tracking-widest text-center">Settlement Status</TableHead>
                                <TableHead className="px-8 h-16 text-right text-[10px] font-bold uppercase tracking-widest">Channel</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBills.map((bill, idx) => (
                                <TableRow
                                    key={bill.id}
                                    className="hover:bg-white/5 border-white/5 transition-all group"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <TableCell className="px-8 py-6">
                                        <div className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors text-base tracking-tight">{bill.month} {bill.year}</div>
                                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Due: {bill.dueDate ? formatDate(new Date(bill.dueDate)) : 'N/A'}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                                                {bill.roomId}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm tracking-tight">{bill.tenantName || 'Standard Resident'}</span>
                                                <span className="text-[10px] font-mono font-bold text-muted-foreground tracking-tighter uppercase">{bill.tenantId.substring(0, 12)}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-bold text-base tracking-tight">{formatCurrency(bill.totalAmount)}</div>
                                        {bill.lateFee > 0 && (
                                            <Badge variant="outline" className="text-[9px] font-bold text-red-500 bg-red-500/5 border-red-500/10 px-1 py-0 mt-1">+{formatCurrency(bill.lateFee)} penalty</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className={cn(
                                            "rounded-lg px-3 py-1 text-[9px] font-bold uppercase tracking-widest border-none shadow-sm",
                                            bill.status === 'paid' ? "bg-emerald-500/10 text-emerald-500" :
                                                bill.status === 'overdue' ? "bg-red-500/10 text-red-500 animate-pulse" :
                                                    "bg-amber-500/10 text-amber-500"
                                        )}>
                                            {bill.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="px-8 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {bill.status !== 'paid' && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 rounded-lg bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-white"
                                                    onClick={() => {
                                                        setSelectedBill(bill);
                                                        setIsRecordOpen(true);
                                                    }}
                                                >
                                                    Record Manual
                                                </Button>
                                            )}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white/10 transition-all">
                                                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="glass-card border-white/10 rounded-2xl shadow-2xl p-2 min-w-[200px]">
                                                    <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground px-4 py-2">Invoice Ops</DropdownMenuLabel>
                                                    {bill.status !== 'paid' && (
                                                        <DropdownMenuItem className="rounded-xl px-4 py-2.5 cursor-pointer font-bold text-xs" onClick={() => {
                                                            setSelectedBill(bill);
                                                            setIsRecordOpen(true);
                                                        }}>
                                                            <Banknote className="mr-3 h-4 w-4 text-primary" />
                                                            Apply Payment
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem className="rounded-xl px-4 py-2.5 cursor-pointer font-bold text-xs">
                                                        <Receipt className="mr-3 h-4 w-4 text-muted-foreground" />
                                                        Download PDF
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-white/5 my-2" />
                                                    <DropdownMenuItem className="rounded-xl px-4 py-2.5 cursor-pointer font-bold text-xs" onClick={() => router.push(`/tenants/${bill.tenantId}`)}>
                                                        <ExternalLink className="mr-3 h-4 w-4 text-muted-foreground" />
                                                        Resident Profile
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            ) : (
                <div className="flex flex-col items-center justify-center p-24 glass-card border-white/10 rounded-[3rem] text-center bg-primary/5">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center mb-6 border border-white/5 shadow-inner opacity-20">
                        <FileText className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight uppercase opacity-50">Empty Ledger</h3>
                    <p className="text-muted-foreground max-w-sm mt-2 text-sm font-medium leading-relaxed">
                        Rent invoices are generated systematically on the cycle start date. Manual overrides can be triggered from the header.
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
