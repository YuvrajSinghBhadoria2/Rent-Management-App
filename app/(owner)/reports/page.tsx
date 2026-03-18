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
  ChevronRight,
  BarChart3,
  PieChart,
  Calendar,
  ArrowRight
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
import { formatCurrency, cn } from '@/lib/utils';
import { StatCard } from '@/components/owner/StatCard';

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
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Compiling Analytics</p>
        </div>
      </div>
    );
  }

  if (!data) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <BarChart3 className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
      <p className="text-muted-foreground">No data available for reporting.</p>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-8 py-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
            Business Analytics
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Comprehensive overview of your rental collection and portfolio health.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="glass-card border-white/10 hover:bg-white/5 h-11 px-6">
            <Filter className="h-4 w-4 mr-2" />
            Customize View
          </Button>
          <Button onClick={handleExport} className="shadow-lg shadow-primary/20 h-11 px-6">
            <Download className="h-4 w-4 mr-2" />
            Export MS Excel
          </Button>
        </div>
      </div>

      {/* Top Row: Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Pending Dues"
          value={formatCurrency(data.summary.pendingDuesTotal)}
          icon={IndianRupee}
          trend={{ value: 12, isPositive: false }}
          className="border-destructive/20 bg-destructive/5"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${data.summary.occupancyRate}%`}
          icon={Users}
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Portfolio Size"
          value={data.summary.totalBuildings}
          icon={Building2}
        />
        <StatCard
          title="Avg. Collection"
          value={formatCurrency(data.monthlyCollections[data.monthlyCollections.length - 1].amount)}
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Collection Distribution Chart */}
        <Card className="lg:col-span-2 glass-card border-white/10 shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-8">
            <div>
              <CardTitle className="text-xl font-bold">Collection Distribution</CardTitle>
              <CardDescription className="text-xs">Rent collected over the last 12 months</CardDescription>
            </div>
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
              <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold px-3 bg-white/10">12M</Button>
              <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold px-3">6M</Button>
            </div>
          </CardHeader>
          <CardContent className="h-[350px] flex items-end gap-3 px-6 pb-12">
            {data.monthlyCollections.map((month: any, idx: number) => {
              const maxHeight = 280;
              const maxAmount = Math.max(...data.monthlyCollections.map((m: any) => m.amount)) || 1;
              const height = (month.amount / maxAmount) * maxHeight;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-3 group relative">
                  <div className="w-full relative h-[280px] flex flex-col justify-end">
                    <div
                      className="w-full bg-primary/20 rounded-t-xl group-hover:bg-primary/40 transition-all duration-500 relative shadow-[0_0_20px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.2)]"
                      style={{ height: `${height}px` }}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 glass-card px-2 py-1 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-10">
                        <p className="text-[10px] font-bold">{formatCurrency(month.amount)}</p>
                      </div>
                      {/* Glow effect at top of bar */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-primary/40 blur-sm rounded-t-xl" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider group-hover:text-primary transition-colors">
                    {month.month.substring(0, 3)}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Triage Side Card */}
        <Card className="glass-card border-white/10 bg-primary/5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ArrowUpRight className="h-24 w-24 text-primary" />
          </div>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold">Critical Dues</CardTitle>
            <CardDescription className="text-xs">Buildings requiring immediate triage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.buildings
              .sort((a: any, b: any) => b.pendingDues - a.pendingDues)
              .slice(0, 5)
              .map((b: any) => (
                <div key={b.id} className="flex items-center justify-between p-4 glass-card border-white/10 hover:bg-white/5 transition-all group">
                  <div>
                    <p className="text-sm font-bold group-hover:text-primary transition-colors">{b.name}</p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                      <Users className="h-3 w-3" />
                      {b.occupiedRooms}/{b.totalRooms} Units
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-destructive">{formatCurrency(b.pendingDues)}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5 opacity-50">Pending</p>
                  </div>
                </div>
              ))}
            <Button variant="ghost" className="w-full mt-4 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all group" asChild>
              <Link href="/billing">
                View Recovery Manager <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Performance Matrix Table */}
      <Card className="glass-card border-white/10 shadow-2xl overflow-hidden">
        <CardHeader className="pb-6 border-b border-white/5">
          <CardTitle className="text-xl font-bold">Portfolio Performance Matrix</CardTitle>
          <CardDescription className="text-xs">Granular analysis of building-level efficiency</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Property Name</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Total Inventory</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest py-4">Occupancy Ratio</TableHead>
                <TableHead className="text-right text-[10px] font-bold uppercase tracking-widest py-4">Pending Leakage</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.buildings.map((building: any) => (
                <TableRow key={building.id} className="hover:bg-white/5 transition-colors group border-white/5">
                  <TableCell className="font-bold py-5">{building.name}</TableCell>
                  <TableCell className="font-medium text-muted-foreground">{building.totalRooms} Units</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-[120px] h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-1000 bg-primary",
                            building.occupancyRate < 50 ? "bg-amber-500" : ""
                          )}
                          style={{ width: `${building.occupancyRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold">{building.occupancyRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell className={cn(
                    "text-right font-bold",
                    building.pendingDues > 0 ? 'text-destructive' : 'text-green-500'
                  )}>
                    {formatCurrency(building.pendingDues)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-white/10 group-hover:text-primary transition-all" asChild>
                      <Link href={`/buildings/${building.id}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
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
