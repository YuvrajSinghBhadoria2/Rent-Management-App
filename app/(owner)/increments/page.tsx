'use client';

import { useState, useEffect } from 'react';
import { Loader2, TrendingUp, Calendar, ChevronRight, Plus, Search } from 'lucide-react';
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
import { formatDate, formatCurrency } from '@/lib/utils';

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
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }

    const handleSchedule = async () => {
        if (!selectedLeaseId || !effectiveDate || !newAmount) {
            return toast.error('Please fill all fields');
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
                toast.success('Rent increment scheduled successfully');
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
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Rent Increments</h1>
                    <p className="text-muted-foreground">Schedule future rent increases for your active leases.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Schedule Increment
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Schedule New Rent Increment</DialogTitle>
                            <DialogDescription>
                                The new rent will be automatically applied to bills generated on or after the effective date.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">
                            <div className="space-y-2">
                                <Label>Select Tenant / Lease</Label>
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search tenant or room..."
                                        className="pl-9 mb-2"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="max-h-[200px] overflow-y-auto border rounded-md p-1 space-y-1">
                                    {filteredLeases.map(lease => (
                                        <div
                                            key={lease.id}
                                            className={`p-2 rounded text-sm cursor-pointer flex justify-between items-center ${selectedLeaseId === lease.id ? 'bg-primary text-primary-foreground' : 'hover:bg-slate-100'}`}
                                            onClick={() => setSelectedLeaseId(lease.id)}
                                        >
                                            <span>{lease.tenantName} ({lease.roomNumber})</span>
                                            <span className="font-bold">{formatCurrency(lease.rentAmount)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="effectiveDate">Effective Date</Label>
                                    <Input
                                        id="effectiveDate"
                                        type="date"
                                        value={effectiveDate}
                                        onChange={(e) => setEffectiveDate(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newAmount">New Monthly Rent (₹)</Label>
                                    <Input
                                        id="newAmount"
                                        type="number"
                                        placeholder="e.g. 15000"
                                        value={newAmount}
                                        onChange={(e) => setNewAmount(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSchedule} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Schedule Now
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-3 shadow-sm">
                    <CardHeader>
                        <CardTitle>History & Scheduled Increments</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {increments.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tenant</TableHead>
                                        <TableHead>Effective Date</TableHead>
                                        <TableHead>Old Rent</TableHead>
                                        <TableHead>New Rent</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {increments.map((inc) => (
                                        <TableRow key={inc.id}>
                                            <TableCell className="font-medium">{inc.tenantName}</TableCell>
                                            <TableCell>{formatDate(new Date(inc.effectiveDate))}</TableCell>
                                            <TableCell>{formatCurrency(inc.previousAmount)}</TableCell>
                                            <TableCell className="text-primary font-bold">
                                                {formatCurrency(inc.newAmount)}
                                                <TrendingUp className="inline ml-1 h-3 w-3" />
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={inc.isApplied ? "outline" : "secondary"}>
                                                    {inc.isApplied ? "Applied" : "Scheduled"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {!inc.isApplied && (
                                                    <Button variant="ghost" size="sm" className="text-destructive">Cancel</Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="py-20 text-center text-muted-foreground italic">
                                No rent increments scheduled yet.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
