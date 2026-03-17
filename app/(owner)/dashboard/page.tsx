'use client';

import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, AlertCircle, TrendingUp } from 'lucide-react';

export default function OwnerDashboard() {
    const { userDoc } = useAuth();

    const stats = [
        { title: 'Total Buildings', value: '0', icon: Building2, color: 'text-blue-600' },
        { title: 'Total Tenants', value: '0', icon: Users, color: 'text-green-600' },
        { title: 'Pending Dues', value: '₹0', icon: TrendingUp, color: 'text-orange-600' },
        { title: 'Open Complaints', value: '0', icon: AlertCircle, color: 'text-red-600' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back, {userDoc?.name}</h1>
                <p className="text-muted-foreground">
                    Here is what is happening with your properties today.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground py-10 text-center">
                            No recent activity yet.
                        </p>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground text-center py-10">
                            Quick actions will appear here.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
