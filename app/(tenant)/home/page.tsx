'use client';

import { useEffect, useState } from 'react';
import {
    Loader2,
    CreditCard,
    Banknote,
    Calendar,
    Clock,
    ArrowRight,
    ShieldCheck,
    Building2,
    FileText,
    Download,
    CheckCircle2,
    MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

export default function TenantHomePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [bills, setBills] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);

    useEffect(() => {
        fetchBills();
    }, []);

    async function fetchBills() {
        try {
            const response = await fetch('/api/bills');
            const result = await response.json();
            if (result.success) {
                setBills(result.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    }

    const pendingBill = bills.find(b => b.status === 'pending' || b.status === 'overdue');
    const paidBills = bills.filter(b => b.status === 'paid');

    const handlePayment = async (bill: any) => {
        setIsProcessingPayment(true);
        try {
            const res = await fetch('/api/payments/razorpay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ billId: bill.id }),
            });
            const { data, error } = await res.json();

            if (error) throw new Error(error);

            // Load Razorpay script
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);

            script.onload = () => {
                const options = {
                    key: data.razorpayKeyId,
                    amount: data.amount,
                    currency: data.currency,
                    name: 'RentFlow',
                    description: `Rent for ${bill.month} ${bill.year}`,
                    order_id: data.orderId,
                    handler: async (response: any) => {
                        const verifyRes = await fetch('/api/payments/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                ...response,
                                billId: bill.id,
                            }),
                        });
                        const verifyData = await verifyRes.json();

                        if (verifyData.success) {
                            toast.success('Payment successful!');
                            fetchBills();
                        } else {
                            toast.error(verifyData.error || 'Payment verification failed');
                        }
                    },
                    prefill: {
                        name: user?.displayName || '',
                        email: user?.email || '',
                    },
                    theme: {
                        color: '#16a34a',
                    },
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            };
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Payment initiation failed');
        } finally {
            setIsProcessingPayment(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.displayName || 'Tenant'}</h1>
                    <p className="text-muted-foreground">Here is a summary of your rent and lease details.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/profile">Edit Profile</Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {pendingBill ? (
                        <Card className="border-orange-200 bg-orange-50/30 overflow-hidden shadow-sm">
                            <CardHeader className="bg-orange-100/50 pb-4">
                                <div className="flex items-center justify-between">
                                    <Badge variant={pendingBill.status === 'overdue' ? 'destructive' : 'outline'} className="bg-white">
                                        {pendingBill.status === 'overdue' ? 'Overdue' : 'Due Soon'}
                                    </Badge>
                                    <span className="text-sm font-medium text-orange-800">{pendingBill.month} {pendingBill.year}</span>
                                </div>
                                <CardTitle className="text-3xl font-bold pt-2">
                                    {formatCurrency(pendingBill.totalAmount)}
                                </CardTitle>
                                <CardDescription className="text-orange-700 font-medium">
                                    Due by {formatDate(new Date(pendingBill.dueDate))}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Banknote className="h-4 w-4" /> Rent Amount
                                    </div>
                                    <span className="font-semibold">{formatCurrency(pendingBill.baseRent)}</span>
                                </div>
                                {pendingBill.lateFee > 0 && (
                                    <div className="flex items-center justify-between text-sm text-destructive font-medium">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" /> Late Fee / Penalty
                                        </div>
                                        <span>{formatCurrency(pendingBill.lateFee)}</span>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="bg-white border-t p-4 flex gap-4">
                                <Button
                                    className="flex-1"
                                    size="lg"
                                    onClick={() => handlePayment(pendingBill)}
                                    disabled={isProcessingPayment}
                                >
                                    {isProcessingPayment ? (
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    ) : (
                                        <CreditCard className="mr-2 h-5 w-5" />
                                    )}
                                    Pay Now Online
                                </Button>
                            </CardFooter>
                        </Card>
                    ) : (
                        <Card className="border-green-200 bg-green-50/20 shadow-sm">
                            <CardContent className="flex flex-col items-center justify-center py-16 text-center text-green-800">
                                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                    <ShieldCheck className="h-10 w-10 text-green-600" />
                                </div>
                                <h3 className="text-xl font-bold">Rent Paid</h3>
                                <p className="max-w-xs mt-2 opacity-80 text-sm">You have no outstanding bills. Great job!</p>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Recent Bills</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {paidBills.length > 0 ? (
                                <div className="divide-y">
                                    {paidBills.slice(0, 3).map((bill) => (
                                        <div key={bill.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{bill.month} {bill.year}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase">{bill.paymentMethod || 'Paid'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-sm">{formatCurrency(bill.totalAmount)}</p>
                                                <Button
                                                    variant="link"
                                                    size="sm"
                                                    className="h-6 p-0 text-primary text-xs"
                                                    asChild
                                                >
                                                    <Link href={`/bills/${bill.id}/receipt`}>Receipt</Link>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-10 text-center text-muted-foreground italic text-sm">No payment history yet.</div>
                            )}
                        </CardContent>
                        <CardFooter className="justify-center border-t py-4">
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/bills" className="flex items-center">
                                    See All Bills <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-primary" />
                                Lease Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Room</p>
                                    <p className="text-lg font-bold">R-{pendingBill?.roomNumber || '...'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Rent</p>
                                    <p className="text-lg font-bold">{formatCurrency(pendingBill?.baseRent || 0)}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                <Button variant="outline" className="w-full justify-start text-sm" size="sm" asChild>
                                    <Link href="/lease">
                                        <FileText className="mr-2 h-4 w-4 text-muted-foreground" /> Lease Agreement
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full justify-start text-sm" size="sm" asChild>
                                    <Link href="/complaints/new">
                                        <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" /> Raise Complaint
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary text-primary-foreground shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <ShieldCheck className="h-8 w-8 opacity-50 text-white" />
                                <h4 className="font-bold">Secure Billing</h4>
                            </div>
                            <p className="text-xs opacity-90 leading-relaxed">
                                Your payments are processed securely via integration with major gateways. Download your official receipts anytime from the bills section.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
