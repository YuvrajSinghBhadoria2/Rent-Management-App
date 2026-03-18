'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import {
    ChevronRight,
    Users,
    Building2,
    Calendar,
    MessageSquare,
    ShieldAlert,
    Wrench,
    Loader2,
    CheckSquare,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface Complaint {
    id: string;
    tenantName: string;
    buildingName: string;
    roomNumber: string;
    category: string;
    title: string;
    description: string;
    priority: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

interface ComplaintListProps {
    complaints: Complaint[];
    loading: boolean;
    searchQuery: string;
    statusFilter: string;
    onSearchChange: (query: string) => void;
    onStatusFilterChange: (status: string) => void;
    onComplaintClick?: (id: string) => void;
}

const categoryLabels: Record<string, string> = {
    plumbing: 'Plumbing',
    electrical: 'Electrical',
    furniture: 'Furniture',
    internet: 'Internet',
    cleaning: 'Cleaning',
    security: 'Security',
    other: 'Other',
};

const priorityColors: Record<string, string> = {
    urgent: 'bg-red-100 text-red-800',
    normal: 'bg-blue-100 text-blue-800',
    low: 'bg-gray-100 text-gray-600',
};

const statusColors: Record<string, string> = {
    open: 'text-amber-500 bg-amber-500/10',
    in_progress: 'text-blue-500 bg-blue-500/10',
    resolved: 'text-emerald-500 bg-emerald-500/10',
    closed: 'text-gray-400 bg-gray-100',
};

const priorityIndicatorColors: Record<string, string> = {
    urgent: 'bg-red-500',
    normal: 'bg-blue-500',
    low: 'bg-gray-400',
};

export function ComplaintList({
    complaints,
    loading,
    searchQuery,
    statusFilter,
    onSearchChange,
    onStatusFilterChange,
    onComplaintClick,
}: ComplaintListProps) {
    const filteredComplaints = complaints.filter((c) => {
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        const matchesSearch =
            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.buildingName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Input
                        type="text"
                        placeholder="Search complaints..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="h-11 pl-10 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700"
                    />
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
                <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                    <SelectTrigger className="h-11 w-full sm:w-[180px] rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Complaint List */}
            {loading ? (
                <div className="flex h-60 items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-700 opacity-50" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 animate-pulse">
                            Syncing Escalations
                        </p>
                    </div>
                </div>
            ) : filteredComplaints.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
                        <CheckSquare className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Zero active issues</h3>
                    <p className="text-gray-500 text-sm mt-1 max-w-xs">
                        Building systems are operating within normal parameters.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredComplaints.map((complaint, idx) => (
                        <Link
                            key={complaint.id}
                            href={`/complaints/${complaint.id}`}
                            onClick={() => onComplaintClick?.(complaint.id)}
                            className="group block p-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg transition-all"
                            style={{ animationDelay: `${idx * 100}ms` }}
                        >
                            {/* Priority Indicator Line */}
                            <div
                                className={cn(
                                    'absolute left-0 top-0 bottom-0 w-1 rounded-full',
                                    priorityIndicatorColors[complaint.priority] || 'bg-gray-400'
                                )}
                            />

                            <div className="flex items-start justify-between gap-6">
                                <div className="space-y-4 flex-1">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <p className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 transition-colors">
                                                {complaint.title}
                                            </p>
                                            <ChevronRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                className={cn(
                                                    'rounded-lg px-2 py-0 text-[9px] font-semibold uppercase tracking-wider',
                                                    priorityColors[complaint.priority] || 'bg-gray-100 text-gray-600'
                                                )}
                                            >
                                                {complaint.priority}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className={cn(
                                                    'rounded-lg px-2 py-0 text-[9px] font-semibold uppercase tracking-wider border-gray-200 dark:border-gray-700',
                                                    statusColors[complaint.status] || 'text-gray-400 bg-gray-100'
                                                )}
                                            >
                                                {complaint.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500">
                                            <Users className="h-3.5 w-3.5 text-blue-700/60" />
                                            <span className="truncate">{complaint.tenantName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500">
                                            <Building2 className="h-3.5 w-3.5 text-blue-700/60" />
                                            <span className="truncate">
                                                {complaint.buildingName} · {complaint.roomNumber}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                <MessageSquare className="h-3 w-3 text-gray-400" />
                                            </div>
                                            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                                                {categoryLabels[complaint.category] || complaint.category} Escalation
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[9px] font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                            <Calendar className="h-3 w-3" />
                                            {format(new Date(complaint.createdAt), 'MMM d')}
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={cn(
                                        'h-12 w-12 rounded-xl flex items-center justify-center border transition-colors',
                                        complaint.priority === 'urgent'
                                            ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'
                                            : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    )}
                                >
                                    {complaint.priority === 'urgent' ? (
                                        <ShieldAlert className="h-6 w-6 text-red-500" />
                                    ) : (
                                        <Wrench className="h-6 w-6 text-gray-400" />
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
