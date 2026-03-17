'use client';

import { useState } from 'react';
import { Loader2, DoorOpen, Calendar, MessageSquare, AlertTriangle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function VacatePage() {
    const router = useRouter();
    const [vacateDate, setVacateDate] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!vacateDate) return toast.error('Please select a vacate date');

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/leases/current/vacate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vacateDate, reason })
            });
            const result = await res.json();
            if (result.success) {
                toast.success('Vacate request submitted successfully');
                router.push('/home');
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto py-8 px-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Request to Vacate</h1>
                <p className="text-muted-foreground">Submit your notice to move out. The owner will review and process your refund.</p>
            </div>

            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Notice Period</AlertTitle>
                <AlertDescription>
                    As per your lease agreement, a 30-day notice period is required. Deductions may apply for shorter notice.
                </AlertDescription>
            </Alert>

            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DoorOpen className="h-5 w-5 text-primary" />
                        Notice Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="vacateDate">Move-out Date</Label>
                        <Input
                            id="vacateDate"
                            type="date"
                            value={vacateDate}
                            onChange={(e) => setVacateDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Vacating (Optional)</Label>
                        <Textarea
                            id="reason"
                            placeholder="Tell us why you're moving..."
                            className="min-h-[100px]"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t py-4">
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} variant="destructive">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                        Confirm Notice
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
