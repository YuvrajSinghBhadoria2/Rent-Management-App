'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatCard } from '@/components/owner/StatCard';
import {
    Building2,
    Users,
    AlertCircle,
    TrendingUp,
    DollarSign,
    ArrowRight,
    Home,
    BarChart3,
    Zap,
    Plus,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    Activity,
    Clock
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface DashboardStats {
    totalBuildings: number;
    totalTenants: number;
    pendingDues: number;
    openComplaints: number;
    rentCollected: number;
    totalRooms: number;
    vacantRooms: number;
}

export default function OwnerDashboard() {
    const { userDoc } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalBuildings: 0,
        totalTenants: 0,
        pendingDues: 0,
        openComplaints: 0,
        rentCollected: 0,
        totalRooms: 0,
        vacantRooms: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const response = await fetch('/api/dashboard/stats');
                const result = await response.json();
                if (result.success) {
                    setStats(result.data);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchStats();
    }, []);

    return (
        <div className="space-y-10 max-w-7xl mx-auto px-4 md:px-8 py-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
                        Protocol Dashboard
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        Welcome back, <span className="text-primary font-bold">{userDoc?.name?.split(' ')[0] || 'Portfolio Manager'}</span>. Systems are operational.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/billing">
                        <Button className="shadow-lg shadow-primary/20 h-11 px-8 font-bold text-[10px] uppercase tracking-widest group">
                            <span>Execute Collections</span>
                            <ArrowRight className="h-3.5 w-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Premium Stat Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Yield Collected"
                    value={`₹${stats.rentCollected.toLocaleString('en-IN')}`}
                    sub="Gross monthly revenue"
                    color="green"
                    icon={DollarSign}
                />
                <StatCard
                    label="System Receivables"
                    value={`₹${stats.pendingDues.toLocaleString('en-IN')}`}
                    sub="Outstanding debt pipeline"
                    color="red"
                    icon={TrendingUp}
                />
                <StatCard
                    label="Asset Occupancy"
                    value={stats.totalRooms ? `${Math.round(((stats.totalRooms - stats.vacantRooms) / stats.totalRooms) * 100)}%` : '0%'}
                    sub={`${stats.totalRooms - stats.vacantRooms} Units actively yielding`}
                    color="blue"
                    icon={Home}
                />
                <StatCard
                    label="Critical Issues"
                    value={stats.openComplaints.toString()}
                    sub="Requires triage or escalation"
                    color="amber"
                    icon={AlertCircle}
                />
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-12">
                {/* Left Column: Actions & Trends */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="glass-card border-white/10 shadow-2xl overflow-hidden bg-white/5">
                        <CardHeader className="border-b border-white/5 pb-6">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Zap className="h-4 w-4" />
                                </div>
                                <CardTitle className="text-xl font-bold">Priority Protocols</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <Link href="/buildings" className="flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-primary/30 hover:bg-primary/5 transition-all group relative overflow-hidden">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowUpRight className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="p-4 rounded-2xl bg-primary/10 mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                        <Building2 className="h-8 w-8 text-primary group-hover:text-white" />
                                    </div>
                                    <span className="text-base font-bold text-gray-900 dark:text-white mt-1">Manage Assets</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{stats.totalBuildings} Active Properties</span>
                                </Link>
                                <Link href="/tenants" className="flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group relative overflow-hidden">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                                    </div>
                                    <div className="p-4 rounded-2xl bg-emerald-500/10 mb-4 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                                        <Users className="h-8 w-8 text-emerald-600 group-hover:text-white" />
                                    </div>
                                    <span className="text-base font-bold text-gray-900 dark:text-white mt-1">Resident Matrix</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{stats.totalTenants} Verified Profiles</span>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Analytics Teaser */}
                    <Card className="glass-card border-white/10 shadow-2xl bg-gradient-to-br from-white/5 to-transparent min-h-[400px] flex flex-col items-center justify-center text-center p-12">
                        <div className="relative mb-8">
                            <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse" />
                            <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center relative backdrop-blur-3xl shadow-2xl">
                                <Activity className="h-10 w-10 text-primary opacity-50" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-3">Predictive Yield Analysis</h3>
                        <p className="text-muted-foreground max-w-sm font-medium leading-relaxed">
                            Aggregating cross-portfolio data. Multi-dimension collection trends and occupancy forecasting will synchronize as your data builds.
                        </p>
                        <div className="mt-8 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-primary">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-primary/20" />)}
                            </div>
                            <span>Used by top managers</span>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Portfolio Health & Notifications */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="glass-card border-white/10 shadow-2xl overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-bold">Portfolio Vitals</CardTitle>
                                <Target className="h-5 w-5 text-primary opacity-50" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <div className="space-y-8">
                                <div className="space-y-6">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mb-1">Portfolio Saturation</div>
                                            <div className="text-5xl font-bold tracking-tighter text-gray-900 dark:text-white">
                                                {stats.totalRooms ? Math.round(((stats.totalRooms - stats.vacantRooms) / stats.totalRooms) * 100) : 0}%
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-emerald-500 flex items-center justify-end gap-1">
                                                <TrendingUp className="h-3 w-3" />
                                                Optimal
                                            </div>
                                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Target: 98%</div>
                                        </div>
                                    </div>
                                    <div className="relative h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-blue-400 to-emerald-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all duration-1500 ease-elastic"
                                            style={{ width: `${stats.totalRooms ? ((stats.totalRooms - stats.vacantRooms) / stats.totalRooms) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-3xl bg-primary/5 border border-white/5 hover:bg-primary/10 transition-all group">
                                        <div className="text-2xl font-bold text-primary tracking-tight">{stats.totalRooms - stats.vacantRooms}</div>
                                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] mt-1 group-hover:text-primary transition-colors">Yielding Units</div>
                                    </div>
                                    <div className="p-5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                                        <div className="text-2xl font-bold text-gray-400 tracking-tight">{stats.vacantRooms}</div>
                                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] mt-1 group-hover:text-white transition-colors">Ghost Units</div>
                                    </div>
                                </div>

                                <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between group cursor-pointer hover:bg-amber-500/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                            <AlertCircle className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Escalations</div>
                                            <div className="text-base font-bold">{stats.openComplaints} Critical</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-amber-500 transition-all" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-white/10 shadow-2xl overflow-hidden bg-white/5">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-bold">System Logs</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground opacity-30" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            <div className="space-y-6">
                                {[
                                    { msg: 'Global billing cycle generated', time: '2h ago', icon: DollarSign, color: 'text-emerald-500' },
                                    { msg: 'New escalation: Room 204C', time: '5h ago', icon: AlertCircle, color: 'text-amber-500' },
                                    { msg: 'Verified KYC: Rajesh Kumar', time: '1d ago', icon: Users, color: 'text-blue-500' },
                                ].map((log, i) => (
                                    <div key={i} className="flex items-start gap-4 group">
                                        <div className={cn("mt-1 p-1.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-all", log.color)}>
                                            <log.icon className="h-3 w-3" />
                                        </div>
                                        <div className="flex-1 border-b border-white/5 pb-4 group-last:border-0">
                                            <p className="text-xs font-bold tracking-tight">{log.msg}</p>
                                            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{log.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button variant="link" className="w-full mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all">
                                View Intelligence Feed
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
