'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Building, Calendar, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface Bill {
    id: string;
    month: number;
    year: number;
    totalAmount: number;
    paidAmount: number;
    status: 'unpaid' | 'partial' | 'paid';
    dueDate: string;
    buildingName: string;
    roomNumber: string;
}

interface BillCardProps {
    bill: Bill;
    onClick?: (id: string) => void;
}

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const statusColors: Record<string, string> = {
    paid: 'bg-green-100 text-green-800 border-green-200',
    partial: 'bg-amber-100 text-amber-800 border-amber-200',
    unpaid: 'bg-red-100 text-red-800 border-red-200',
};

export function BillCard({ bill, onClick }: BillCardProps) {
    const balance = bill.totalAmount - bill.paidAmount;

    return (
        <Link
            href={`/bills/${bill.id}`}
            onClick={() => onClick?.(bill.id)}
            className="block"
        >
            <Card className="hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {monthNames[bill.month - 1]} {bill.year}
                                </h3>
                                <Badge className={cn('text-[10px] font-medium uppercase tracking-wider', statusColors[bill.status])}>
                                    {bill.status}
                                </Badge>
                            </div>

                            <div className="space-y-1 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Building className="h-3.5 w-3.5 text-blue-700/60" />
                                    <span>
                                        {bill.buildingName} · Room {bill.roomNumber}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5 text-blue-700/60" />
                                    <span>Due: {format(new Date(bill.dueDate), 'd MMM yyyy')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right space-y-1">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                ₹{bill.totalAmount.toLocaleString('en-IN')}
                            </p>
                            {bill.status !== 'paid' && (
                                <p className="text-sm text-gray-500">
                                    Balance: ₹{balance.toLocaleString('en-IN')}
                                </p>
                            )}
                            {bill.status === 'paid' && bill.paidAmount > 0 && (
                                <p className="text-sm text-green-600 font-medium">
                                    Paid: ₹{bill.paidAmount.toLocaleString('en-IN')}
                                </p>
                            )}
                        </div>

                        <ChevronRight className="h-5 w-5 text-gray-400 self-center" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
