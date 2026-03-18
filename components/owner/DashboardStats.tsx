'use client';

import { DollarSign, TrendingUp, Home, AlertCircle } from 'lucide-react';
import { StatCard } from './StatCard';

export interface DashboardStats {
    totalBuildings: number;
    totalTenants: number;
    pendingDues: number;
    openComplaints: number;
    rentCollected: number;
    totalRooms: number;
    vacantRooms: number;
}

interface DashboardStatsProps {
    stats: DashboardStats;
    isLoading?: boolean;
}

export function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
    const occupancyRate = stats.totalRooms
        ? Math.round(((stats.totalRooms - stats.vacantRooms) / stats.totalRooms) * 100)
        : 0;

    return (
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
                value={`${occupancyRate}%`}
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
    );
}
