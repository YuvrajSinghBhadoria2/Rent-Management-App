'use client';

import { useState, useEffect } from 'react';
import {
    Loader2,
    TrendingUp,
    Calendar,
    ChevronRight,
    Plus,
    Search,
    History,
    ArrowUpRight,
    Target,
    DollarSign,
    CheckCircle2,
    Users,
    Building2,
    Clock
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function IncrementsPage() {
    const [increments, setIncrements] = useState<any[]>([]);
    const [leases, setLeases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [selectedLeaseId, setSelectedLeaseId] = useState('');
    const [effectiveDate, setEffectiveDate] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const [incRes, leaseRes] = await Promise.all([
                fetch('/api/increments'),
                fetch('/api/leases')
            ]);
            const incResult = await incRes.json();
            const leaseResult = await leaseRes.json();

            if (incResult.success) setIncrements(incResult.data);
            if (leaseResult.success) setLeases(leaseResult.data.filter((l: any) => l.status === 'active'));
        } catch (error) {
            toast.error('Failed to load portfolio yield data');
        } finally {
            setLoading(false);
        }
    }

    const handleSchedule = async () => {
        if (!selectedLeaseId || !effectiveDate || !newAmount) {
            return toast.error('Please fill all mandatory fields');
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/increments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    leaseId: selectedLeaseId,
                    effectiveDate,
                    newAmount
                })
            });
            const result = await res.json();
            if (result.success) {
                toast.success('Rent increment strategy scheduled');
                setIsDialogOpen(false);
                fetchData();
                // Reset form
                setSelectedLeaseId('');
                setEffectiveDate('');
                setNewAmount('');
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to schedule increment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredLeases = leases.filter(l =>
        l.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Analyzing Portfolio Yield</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-8 py-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
                        Rent Optimization
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">Manage and schedule future rent increments to maximize portfolio yield.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="shadow-lg shadow-primary/20 h-11 px-8">
                            <Plus className="h-4 w-4 mr-2" />
                            Schedule Increment
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-white/20 sm:max-w-[550px] p-0 overflow-hidden shadow-2xl">
                        <DialogHeader className="p-6 border-b border-white/5 bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
                                    <TrendingUp className="h-5 w-5" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-bold">New Rent Strategy</DialogTitle>
                                    <DialogDescription className="text-xs">Schedule an automated rent increase for an active resident.</DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="p-6 space-y-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Target Resident / Asset</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <Input
                                        placeholder="Search by name or unit number..."
                                        className="pl-10 h-11 glass-card border-white/10 dark:bg-white/5 focus:border-primary/20 transition-all font-medium"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="glass-card border-white/10 rounded-2xl overflow-hidden shadow-inner">
                                    <ScrollArea className="h-[180px]">
                                        <div className="p-1.5 space-y-1">
                                            {filteredLeases.map(lease => (
                                                <div
                                                    key={lease.id}
                                                    className={cn(
                                                        "p-3 rounded-xl flex justify-between items-center transition-all cursor-pointer group",
                                                        selectedLeaseId === lease.id
                                                            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[0.99]"
                                                            : "hover:bg-white/5 hover:border-white/10"
                                                    )}
                                                    onClick={() => setSelectedLeaseId(lease.id)}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-[10px]", selectedLeaseId === lease.id ? "bg-white/20" : "bg-primary/10 text-primary")}>
                                                            {lease.tenantName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm tracking-tight">{lease.tenantName}</p>
                                                            <p className={cn("text-[9px] uppercase font-bold tracking-widest", selectedLeaseId === lease.id ? "text-white/70" : "text-muted-foreground")}>{lease.roomNumber}</p>
                                                        </div>
                                                    </div>
                                                    <span className={cn("font-bold text-sm", selectedLeaseId === lease.id ? "text-white" : "text-primary")}>{formatCurrency(lease.rentAmount)}</span>
                                                </div>
                                            ))}
                                            {filteredLeases.length === 0 && (
                                                <div className="py-12 text-center">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">No matching assets found</p>
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="effectiveDate" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Effective Scaling Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="effectiveDate"
                                            type="date"
                                            className="pl-10 h-11 glass-card border-white/10 dark:bg-white/5 focus:border-primary/20 transition-all font-medium"
                                            value={effectiveDate}
                                            onChange={(e) => setEffectiveDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="newAmount" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Target Rent Amount</Label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</div>
                                        <Input
                                            id="newAmount"
                                            type="number"
                                            className="pl-7 h-11 glass-card border-white/10 dark:bg-white/5 focus:border-primary/20 transition-all font-bold text-lg"
                                            placeholder="0.00"
                                            value={newAmount}
                                            onChange={(e) => setNewAmount(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="p-6 bg-white/5 border-t border-white/5 gap-3">
                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-[10px] font-bold uppercase tracking-widest">Abort</Button>
                            <Button onClick={handleSchedule} disabled={isSubmitting} className="h-11 px-8 shadow-lg shadow-primary/20">
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Commit Increment
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Stats Summary Panel */}
                <div className="md:col-span-1 space-y-6">
                    <Card className="glass-card border-white/10 bg-primary/5 shadow-2xl relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 p-8 opacity-10">
                            <ArrowUpRight className="h-24 w-24 text-primary" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Strategic Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                        <TrendingUp className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold">Planned Yield</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Across next {increments.length} events</p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-primary">+₹—</span>
                            </div>
                            <div className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-500/10 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all">
                                        <Target className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold">Optimal Rent Gap</p>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Market cap vs Current</p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-green-500">~12%</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-white/10 shadow-xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Portfolio Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { label: 'Scheduled', count: increments.filter(i => !i.isApplied).length, color: 'bg-primary' },
                                { label: 'Completed', count: increments.filter(i => i.isApplied).length, color: 'bg-green-500' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/5 hover:bg-white/5 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className={cn("w-2 h-2 rounded-full", item.color)} />
                                        <span className="text-xs font-bold opacity-60 group-hover:opacity-100 transition-opacity uppercase tracking-widest">{item.label}</span>
                                    </div>
                                    <span className="font-bold">{item.count}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* History Matrix Table */}
                <Card className="md:col-span-2 glass-card border-white/10 shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 pb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-white/5 text-muted-foreground">
                                <History className="h-4 w-4" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold font-heading">Trajectory Matrix</CardTitle>
                                <CardDescription className="text-xs">Real-time tracking of scheduled and applied rent adjustments.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {increments.length > 0 ? (
                            <Table>
                                <TableHeader className="bg-white/5 border-b border-white/5">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Asset Resident</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Scaling Date</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Yield Growth</TableHead>
                                        <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Protocol Status</TableHead>
                                        <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest py-4">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {increments.map((inc, idx) => (
                                        <TableRow
                                            key={inc.id}
                                            className="hover:bg-white/5 transition-colors group border-white/5"
                                            style={{ animationDelay: `${idx * 50}ms` }}
                                        >
                                            <TableCell className="py-5">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{inc.tenantName}</span>
                                                    <span className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">{inc.propertyName || 'Portfolio Asset'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium text-muted-foreground">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <Clock className="h-3 w-3 text-primary/40" />
                                                    {formatDate(new Date(inc.effectiveDate))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-bold text-muted-foreground line-through opacity-50">{formatCurrency(inc.previousAmount)}</span>
                                                        <span className="text-sm font-bold text-primary flex items-center gap-1">
                                                            {formatCurrency(inc.newAmount)}
                                                            <ArrowUpRight className="h-3 w-3" />
                                                        </span>
                                                    </div>
                                                    <Badge variant="outline" className="text-[9px] font-bold text-green-500 bg-green-500/5 border-green-500/20 px-1 py-0 shadow-sm">
                                                        +{Math.round(((inc.newAmount - inc.previousAmount) / inc.previousAmount) * 100)}%
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        inc.isApplied ? "bg-green-500" : "bg-primary animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                                    )} />
                                                    <span className={cn(
                                                        "text-[10px] font-bold uppercase tracking-widest",
                                                        inc.isApplied ? "text-green-500" : "text-primary"
                                                    )}>
                                                        {inc.isApplied ? "Committed" : "Queued"}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {!inc.isApplied && (
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-white/10 group-hover:text-primary transition-all">
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6 border border-white/5 opacity-30 shadow-inner">
                                    <TrendingUp className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-500 uppercase tracking-widest opacity-50">Stagnant Growth Pipeline</h3>
                                <p className="text-[10px] text-muted-foreground mt-2 max-w-[200px] font-medium leading-relaxed">No rent adjustments have been committed yet. Optimize your revenue by scheduling your first increment.</p>
                                <Button
                                    variant="link"
                                    onClick={() => setIsDialogOpen(true)}
                                    className="mt-6 text-[10px] font-bold uppercase tracking-widest text-primary hover:tracking-[0.15em] transition-all"
                                >
                                    Scale Portfolio Now
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
