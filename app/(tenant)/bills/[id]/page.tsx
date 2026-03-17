'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Building, 
  Calendar, 
  CreditCard,
  CheckCircle2,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LineItem {
  label: string;
  amount: number;
  type: string;
}

interface Bill {
  id: string;
  month: number;
  year: number;
  dueDate: string;
  lineItems: LineItem[];
  totalAmount: number;
  paidAmount: number;
  status: string;
  buildingName: string;
  buildingId: string;
  roomId: string;
  roomNumber: string;
  tenantName: string;
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

export default function TenantBillDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBill();
  }, [params.id]);

  async function fetchBill() {
    try {
      const token = localStorage.getItem('firebase-token');
      const response = await fetch(`/api/tenant/bills/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setBill(data.data);
      } else {
        toast.error('Bill not found');
        router.push('/bills');
      }
    } catch (error) {
      console.error('Error fetching bill:', error);
      toast.error('Failed to load bill');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!bill) return null;

  const balance = bill.totalAmount - bill.paidAmount;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => router.push('/bills')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Bills
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">
                    {monthNames[bill.month - 1]} {bill.year}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Bill #{bill.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <Badge className={statusColors[bill.status]}>
                  {bill.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{bill.buildingName} - Room {bill.roomNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Due: {format(new Date(bill.dueDate), 'MMM d, yyyy')}</span>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Bill Details</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">Description</th>
                        <th className="text-right p-3 text-sm font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bill.lineItems?.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3">{item.label}</td>
                          <td className="p-3 text-right">₹{item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="border-t bg-muted/50">
                        <td className="p-3 font-medium">Total</td>
                        <td className="p-3 text-right font-medium">₹{bill.totalAmount.toLocaleString()}</td>
                      </tr>
                      {bill.paidAmount > 0 && (
                        <tr className="border-t">
                          <td className="p-3">Paid</td>
                          <td className="p-3 text-right text-green-600">-₹{bill.paidAmount.toLocaleString()}</td>
                        </tr>
                      )}
                      {bill.status !== 'paid' && (
                        <tr className="border-t bg-red-50">
                          <td className="p-3 font-medium">Balance Due</td>
                          <td className="p-3 text-right font-medium text-red-600">₹{balance.toLocaleString()}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {bill.status === 'paid' ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-600" />
                  <p className="font-medium">Paid</p>
                  <p className="text-sm text-muted-foreground">
                    ₹{bill.paidAmount.toLocaleString()}
                  </p>
                </div>
              ) : (
                <>
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">Amount Due</p>
                    <p className="text-3xl font-bold">₹{balance.toLocaleString()}</p>
                  </div>
                  <Button className="w-full" size="lg">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Now
                  </Button>
                </>
              )}
              
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
