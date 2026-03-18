'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PayButtonProps {
    billId: string;
    amount: number;
    status: 'unpaid' | 'partial' | 'paid';
    onSuccess?: () => void;
    onError?: (error: Error) => void;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg';
    className?: string;
}

const gatewayOptions = [
    { id: 'cashfree', name: 'Cashfree', fee: '1.75%', badge: 'Lowest fee', badgeColor: 'bg-green-100 text-green-800' },
    { id: 'phonepe', name: 'PhonePe', fee: '1.99%' },
    { id: 'razorpay', name: 'Razorpay', fee: '2.00%' },
];

export function PayButton({
    billId,
    amount,
    status,
    onSuccess,
    onError,
    variant = 'default',
    size = 'default',
    className,
}: PayButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedGateway, setSelectedGateway] = useState('cashfree');
    const [showGatewaySelector, setShowGatewaySelector] = useState(false);

    if (status === 'paid') {
        return (
            <div className={cn('flex items-center justify-center gap-2 text-green-600', className)}>
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Payment Complete</span>
            </div>
        );
    }

    async function handlePayment() {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('firebase-token');

            const response = await fetch('/api/payments/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    billId,
                    amount,
                    gateway: selectedGateway,
                }),
            });

            const result = await response.json();

            if (result.success && result.data?.paymentUrl) {
                window.location.href = result.data.paymentUrl;
                onSuccess?.();
            } else {
                throw new Error(result.error || 'Failed to create payment');
            }
        } catch (error) {
            console.error('Payment error:', error);
            onError?.(error as Error);
        } finally {
            setIsLoading(false);
        }
    }

    function handleClick() {
        if (showGatewaySelector) {
            handlePayment();
        } else {
            setShowGatewaySelector(true);
        }
    }

    return (
        <div className={cn('space-y-4', className)}>
            {/* Gateway Selector */}
            {showGatewaySelector && (
                <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Payment Method</p>
                    <div className="space-y-2">
                        {gatewayOptions.map((gw) => (
                            <label
                                key={gw.id}
                                className={cn(
                                    'flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors',
                                    selectedGateway === gw.id
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="gateway"
                                        value={gw.id}
                                        checked={selectedGateway === gw.id}
                                        onChange={() => setSelectedGateway(gw.id)}
                                        className="sr-only"
                                    />
                                    <div
                                        className={cn(
                                            'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                                            selectedGateway === gw.id
                                                ? 'border-blue-500'
                                                : 'border-gray-300 dark:border-gray-600'
                                        )}
                                    >
                                        {selectedGateway === gw.id && (
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium text-sm text-gray-900 dark:text-white">
                                            {gw.name}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            UPI · Cards · Netbanking · {gw.fee} fee
                                        </div>
                                    </div>
                                </div>
                                {gw.badge && (
                                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', gw.badgeColor)}>
                                        {gw.badge}
                                    </span>
                                )}
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Pay Button */}
            <Button
                variant={variant}
                size={size}
                onClick={handleClick}
                disabled={isLoading}
                className={cn('w-full', variant === 'default' && 'shadow-lg')}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        {showGatewaySelector ? `Pay ₹${amount.toLocaleString('en-IN')}` : 'Pay Now'}
                    </>
                )}
            </Button>

            {showGatewaySelector && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowGatewaySelector(false)}
                    className="w-full text-gray-500"
                >
                    Cancel
                </Button>
            )}
        </div>
    );
}
