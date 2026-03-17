'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';

interface DashboardStats {
    totalBuildings: number;
    totalTenants: number;
    pendingDues: number;
    openComplaints: number;
    rentCollected: number;
}

export default function OwnerDashboard() {
    const { userDoc } = useAuth();
    const [stats, setStats] = useState<DashboardStats>({
        totalBuildings: 0,
        totalTenants: 0,
        pendingDues: 0,
        openComplaints: 0,
        rentCollected: 0,
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

    const statCards = [
        { title: 'Total Buildings', value: stats.totalBuildings, icon: Building2, color: 'text-blue-600' },
        { title: 'Total Tenants', value: stats.totalTenants, icon: Users, color: 'text-green-600' },
        { title: 'Pending Dues', value: `₹${stats.pendingDues.toLocaleString()}`, icon: TrendingUp, color: 'text-orange-600' },
        { title: 'Open Complaints', value: stats.openComplaints, icon: AlertCircle, color: 'text-red-600' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userDoc?.name || 'Owner'}</h1>
                <p className="text-muted-foreground">
                    Here is what is happening with your properties today.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="h-8 w-16 animate-pulse bg-muted rounded" />
                            ) : (
                                <div className="text-2xl font-bold">{stat.value}</div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Rent Collected This Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="h-20 animate-pulse bg-muted rounded" />
                        ) : (
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 rounded-full">
                                    <DollarSign className="h-8 w-8 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold">₹{stats.rentCollected.toLocaleString()}</div>
                                    <p className="text-sm text-muted-foreground">Total collected</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <a href="/buildings/new" className="flex items-center justify-center w-full p-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                            Add New Building
                        </a>
                        <a href="/tenants/new" className="flex items-center justify-center w-full p-2 text-sm font-medium border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground">
                            Add New Tenant
                        </a>
                        <a href="/billing/generate" className="flex items-center justify-center w-full p-2 text-sm font-medium border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground">
                            Generate Bill
                        </a>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
