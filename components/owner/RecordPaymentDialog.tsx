'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2, Banknote, CreditCard, Landmark, QrCode } from 'lucide-react';
import { toast } from 'sonner';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
    method: z.enum(['cash', 'upi', 'cheque', 'bank_transfer']),
    amount: z.coerce.number().min(0),
    paymentDate: z.string().min(1, 'Payment date is required'),
    notes: z.string().optional(),
});

interface RecordPaymentDialogProps {
    bill: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function RecordPaymentDialog({
    bill,
    isOpen,
    onClose,
    onSuccess
}: RecordPaymentDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            method: 'cash',
            amount: bill?.totalAmount || 0,
            paymentDate: new Date().toISOString().split('T')[0],
            notes: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/bills/${bill.id}/offline`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            const result = await response.json();
            if (result.success) {
                toast.success('Payment recorded successfully');
                onSuccess();
                onClose();
            } else {
                toast.error(result.error || 'Failed to record payment');
            }
        } catch (error) {
            console.error(error);
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Record Offline Payment</DialogTitle>
                    <DialogDescription>
                        Recording payment for {bill?.month} {bill?.year} bill.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="method"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Method</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select method" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="cash">
                                                <div className="flex items-center gap-2">
                                                    <Banknote className="h-4 w-4" /> Cash
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="upi">
                                                <div className="flex items-center gap-2">
                                                    <QrCode className="h-4 w-4" /> UPI / PhonePe
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="cheque">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4" /> Cheque
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="bank_transfer">
                                                <div className="flex items-center gap-2">
                                                    <Landmark className="h-4 w-4" /> Bank Transfer
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount Received (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="paymentDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Transaction ID / Cheque # / Notes"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Confirm Payment'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
