'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  Receipt, 
  CreditCard, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Building
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Bill {
  id: string;
  month: number;
  year: number;
  totalAmount: number;
  paidAmount: number;
  status: string;
  dueDate: string;
  buildingName: string;
  roomNumber: string;
  createdAt: string;
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const statusColors: Record<string, string> = {
  unpaid: 'bg-red-100 text-red-800 border-red-200',
  partial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
};

export default function TenantBillsPage() {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  async function fetchBills() {
    try {
      const token = localStorage.getItem('firebase-token');
      const response = await fetch('/api/tenant/bills', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setBills(data.data);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  }

  const unpaidCount = bills.filter(b => b.status === 'unpaid').length;
  const partialCount = bills.filter(b => b.status === 'partial').length;
  const totalDue = bills
    .filter(b => b.status !== 'paid')
    .reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Bills</h1>
        <p className="text-muted-foreground">View and pay your rent bills</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Due</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalDue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unpaidCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bills.length - unpaidCount - partialCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Bills</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : bills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No bills yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bills.map((bill) => (
                <Link
                  key={bill.id}
                  href={`/bills/${bill.id}`}
                  className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {monthNames[bill.month - 1]} {bill.year}
                        </p>
                        <Badge className={statusColors[bill.status]}>
                          {bill.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <Building className="h-3 w-3 inline mr-1" />
                        {bill.buildingName} - Room {bill.roomNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Due: {format(new Date(bill.dueDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{bill.totalAmount.toLocaleString()}</p>
                      {bill.status !== 'paid' && (
                        <p className="text-sm text-muted-foreground">
                          Balance: ₹{(bill.totalAmount - bill.paidAmount).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
