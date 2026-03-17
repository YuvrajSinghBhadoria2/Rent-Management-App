'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Loader2,
    ArrowLeft,
    Download,
    Printer,
    CheckCircle2,
    Building2,
    User,
    Calendar,
    CreditCard,
    Phone
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function ReceiptPage() {
    const router = useRouter();
    const { id } = useParams();
    const [bill, setBill] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchBill();
    }, [id]);

    async function fetchBill() {
        try {
            // Re-using bills GET logic for single bill
            const response = await fetch(`/api/bills?id=${id}`);
            const result = await response.json();
            if (result.success && result.data.length > 0) {
                setBill(result.data[0]);
            } else {
                toast.error('Receipt not found');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    const handlePrint = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!bill) {
        return <div className="p-20 text-center">Receipt not found.</div>;
    }

    return (
        <div className="max-w-3xl mx-auto py-10 px-6 space-y-8 print:py-0 print:px-0">
            <div className="flex items-center justify-between print:hidden">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" /> Print
                    </Button>
                    <Button>
                        <Download className="mr-2 h-4 w-4" /> PDF
                    </Button>
                </div>
            </div>

            <Card className="border-2 shadow-lg print:shadow-none print:border-none">
                <CardContent className="p-10 space-y-10">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-primary italic uppercase leading-none">RentFlow</h1>
                            <p className="text-sm text-muted-foreground mt-2 font-medium">Payment Settlement Receipt</p>
                        </div>
                        <div className="text-right">
                            <Badge className="bg-green-100 text-green-800 border-green-200 uppercase tracking-widest px-3">Paid</Badge>
                            <p className="text-xs text-muted-foreground mt-2">Receipt ID: RF-{(bill.razorpayPaymentId || bill.id).substring(0, 10).toUpperCase()}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Property Details</h3>
                            <div className="space-y-2">
                                <p className="flex items-center gap-2 font-semibold">
                                    <Building2 className="h-4 w-4 text-primary" /> Building ID: {bill.buildingId.substring(0, 8)}
                                </p>
                                <p className="text-sm font-medium">Room Number: {bill.roomId}</p>
                                {bill.bedId && <p className="text-sm font-medium">Bed Assigned: {bill.bedId}</p>}
                            </div>
                        </div>
                        <div className="space-y-4 text-right">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Billed To</h3>
                            <div className="space-y-2">
                                <p className="flex items-center gap-2 justify-end font-semibold">
                                    <User className="h-4 w-4 text-primary" /> Tenant ID: {bill.tenantId.substring(0, 8)}
                                </p>
                                <p className="text-sm font-medium">Billing Period: {bill.month} {bill.year}</p>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="border rounded-xl overflow-hidden mt-8">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="text-left py-4 px-6 font-bold uppercase tracking-wider text-[10px]">Description</th>
                                    <th className="text-right py-4 px-6 font-bold uppercase tracking-wider text-[10px]">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <tr>
                                    <td className="py-4 px-6 font-medium">Monthly Rent (Period: {bill.month} {bill.year})</td>
                                    <td className="py-4 px-6 text-right font-semibold">{formatCurrency(bill.baseRent)}</td>
                                </tr>
                                {bill.lateFee > 0 && (
                                    <tr>
                                        <td className="py-4 px-6 font-medium text-destructive">Late Fees & Penalties</td>
                                        <td className="py-4 px-6 text-right font-semibold text-destructive">{formatCurrency(bill.lateFee)}</td>
                                    </tr>
                                )}
                                {bill.otherCharges > 0 && (
                                    <tr>
                                        <td className="py-4 px-6 font-medium">Other Charges / Utilities</td>
                                        <td className="py-4 px-6 text-right font-semibold">{formatCurrency(bill.otherCharges)}</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="bg-primary/5">
                                <tr>
                                    <td className="py-6 px-6 font-bold text-lg">Total Amount Paid</td>
                                    <td className="py-6 px-6 text-right font-black text-2xl text-primary">{formatCurrency(bill.totalAmount)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Payment Info */}
                    <div className="grid grid-cols-3 gap-6 pt-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Payment Method</p>
                            <p className="text-sm font-semibold capitalize flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-primary" /> {bill.paymentMethod}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Transaction Date</p>
                            <p className="text-sm font-semibold flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-primary" /> {bill.paidAt ? formatDate(new Date(bill.paidAt.seconds * 1000)) : '—'}
                            </p>
                        </div>
                        <div className="space-y-1 text-right">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Status</p>
                            <div className="flex items-center gap-2 justify-end text-green-600 font-black italic uppercase text-sm">
                                <CheckCircle2 className="h-4 w-4" /> Successful
                            </div>
                        </div>
                    </div>

                    {/* Footer Footer */}
                    <div className="pt-20 text-center opacity-40 grayscale flex flex-col items-center gap-4">
                        <div className="h-10 w-40 bg-gray-300 rounded print:bg-gray-200"></div>
                        <p className="text-[10px] font-medium max-w-xs uppercase tracking-widest leading-relaxed">
                            This is a computer-generated document and does not require a physical signature.
                            Issued by RentFlow Management on behalf of the Property Owner.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Simple Badge component if not imported
function Badge({ className, children }: { className?: string, children: React.ReactNode }) {
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
            {children}
        </span>
    );
}
