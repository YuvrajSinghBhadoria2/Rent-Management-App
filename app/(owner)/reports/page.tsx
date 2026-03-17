'use client';

import { useEffect, useState } from 'react';
import {
  Loader2,
  TrendingUp,
  Users,
  Building2,
  IndianRupee,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const response = await fetch('/api/reports');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load financial reports');
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    try {
      const response = await fetch('/api/reports?format=excel');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'rentflow-financial-report.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success('Report downloaded successfully');
      } else {
        toast.error('Failed to generate report');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred during export');
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Analytics</h1>
          <p className="text-muted-foreground">Comprehensive overview of your rental collection and portfolio health.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Customize
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Monthly Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm border-primary/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center text-xs uppercase font-bold text-muted-foreground tracking-wider">
              <IndianRupee className="h-3 w-3 mr-1" /> Total Pending Dues
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-destructive">
              {formatCurrency(data.summary.pendingDuesTotal)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-muted-foreground">Calculated across all active leases</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-primary/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center text-xs uppercase font-bold text-muted-foreground tracking-wider">
              <TrendingUp className="h-3 w-3 mr-1" /> Current Occupancy
            </CardDescription>
            <CardTitle className="text-2xl font-bold text-primary">
              {data.summary.occupancyRate}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={data.summary.occupancyRate} className="h-1.5" />
            <p className="text-[10px] text-muted-foreground mt-2">{data.summary.occupiedRooms} / {data.summary.totalUnits || data.summary.totalRooms} Units Occupied</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-primary/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center text-xs uppercase font-bold text-muted-foreground tracking-wider">
              <Building2 className="h-3 w-3 mr-1" /> Portfolio Size
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {data.summary.totalBuildings}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[10px] text-muted-foreground">Active Buildings Managed</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-primary/5">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center text-xs uppercase font-bold text-muted-foreground tracking-wider">
              <IndianRupee className="h-3 w-3 mr-1" /> Avg. Collection
            </CardDescription>
            <CardTitle className="text-2xl font-bold">
              {formatCurrency(data.monthlyCollections[data.monthlyCollections.length - 1].amount)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-[10px] text-green-600 font-medium">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> 8% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle>Historical Collection Distribution</CardTitle>
            <CardDescription>Rent collected over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-end gap-2 px-6 pt-10">
            {data.monthlyCollections.map((month: any, idx: number) => {
              const maxHeight = 200;
              const maxAmount = Math.max(...data.monthlyCollections.map((m: any) => m.amount)) || 1;
              const height = (month.amount / maxAmount) * maxHeight;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full relative">
                    <div
                      className="w-full bg-primary/20 rounded-t-sm group-hover:bg-primary/40 transition-all duration-300 relative"
                      style={{ height: `${height}px` }}
                    >
                      {month.amount > 0 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          {formatCurrency(month.amount)}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground rotate-45 mt-2 origin-left whitespace-nowrap">
                    {month.month}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-primary/5 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Triage Required</CardTitle>
            <CardDescription>Buildings with highest pending dues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.buildings
              .sort((a: any, b: any) => b.pendingDues - a.pendingDues)
              .slice(0, 5)
              .map((b: any) => (
                <div key={b.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-primary/10">
                  <div>
                    <p className="text-sm font-bold">{b.name}</p>
                    <p className="text-[10px] text-muted-foreground">{b.occupiedRooms} / {b.totalRooms} Rooms Occupied</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-destructive">{formatCurrency(b.pendingDues)}</p>
                    <p className="text-[10px] text-muted-foreground italic">Pending</p>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Building Performance Matrix</CardTitle>
          <CardDescription>Detailed breakdown of your property portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Building Name</TableHead>
                <TableHead>Total Units</TableHead>
                <TableHead>Occupancy</TableHead>
                <TableHead className="text-right">Pending Dues</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.buildings.map((building: any) => (
                <TableRow key={building.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold">{building.name}</TableCell>
                  <TableCell>{building.totalRooms}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={building.occupancyRate} className="h-1 w-20" />
                      <span className="text-xs font-medium">{building.occupancyRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell className={`text-right font-bold ${building.pendingDues > 0 ? 'text-destructive' : 'text-green-600'}`}>
                    {formatCurrency(building.pendingDues)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function formatCurrencySmall(amount: number) {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount.toString();
}
