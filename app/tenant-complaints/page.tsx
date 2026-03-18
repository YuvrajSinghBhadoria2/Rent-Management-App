'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Wrench,
    AlertCircle,
    CheckCircle2,
    Clock,
    MessageSquare,
    ChevronRight,
    Filter
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

interface Complaint {
    id: string;
    category: string;
    title: string;
    priority: string;
    status: string;
    createdAt: string;
}

const statusMap: any = {
    open: { label: 'Open', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800 border-green-200' },
    closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800 border-gray-200' },
};

const priorityMap: any = {
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
    normal: { label: 'Normal', color: 'bg-blue-100 text-blue-800' },
    low: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
};

export default function TenantComplaintsPage() {
    const router = useRouter();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchComplaints();
    }, []);

    async function fetchComplaints() {
        try {
            const response = await fetch('/api/complaints');
            const result = await response.json();
            if (result.success) {
                setComplaints(result.data);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load complaints');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Support & Maintenance</h1>
                    <p className="text-muted-foreground">Raise and track your issues with the property management.</p>
                </div>
                <Button asChild>
                    <Link href="/complaints/new">
                        <Plus className="h-4 w-4 mr-2" />
                        New Complaint
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-yellow-50/30 border-yellow-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-yellow-700 font-medium">Active Issues</CardDescription>
                        <CardTitle className="text-2xl font-bold">{complaints.filter(c => c.status === 'open' || c.status === 'in_progress').length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-green-50/30 border-green-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-green-700 font-medium">Resolved</CardDescription>
                        <CardTitle className="text-2xl font-bold">{complaints.filter(c => c.status === 'resolved' || c.status === 'closed').length}</CardTitle>
                    </CardHeader>
                </Card>
                <Card className="bg-blue-50/30 border-blue-100 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-blue-700 font-medium">Total Requests</CardDescription>
                        <CardTitle className="text-2xl font-bold">{complaints.length}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">Complaint History</CardTitle>
                        <CardDescription>View status updates and notes from the owner</CardDescription>
                    </div>
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-10 italic text-muted-foreground">Loading complaints...</div>
                    ) : complaints.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 opacity-40">
                                <Wrench className="h-8 w-8" />
                            </div>
                            <p className="text-muted-foreground">No complaints filed yet.</p>
                            <Button variant="link" asChild className="mt-2">
                                <Link href="/tenant-complaints/new">File your first request</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y border rounded-lg overflow-hidden">
                            {complaints.map((complaint) => (
                                <div
                                    key={complaint.id}
                                    className="p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                                    onClick={() => router.push(`/tenant-complaints/${complaint.id}`)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm group-hover:text-primary transition-colors">{complaint.title}</span>
                                                <Badge className={`${statusMap[complaint.status]?.color} text-[10px] px-1.5 py-0 border`} variant="outline">
                                                    {statusMap[complaint.status]?.label}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                <span className="capitalize">{complaint.category}</span>
                                                <span className="h-1 w-1 rounded-full bg-muted-foreground opacity-30" />
                                                <span>{formatDate(new Date(complaint.createdAt))}</span>
                                                <span className="h-1 w-1 rounded-full bg-muted-foreground opacity-30" />
                                                <span className={`font-medium ${priorityMap[complaint.priority]?.color} bg-transparent p-0`}>
                                                    {priorityMap[complaint.priority]?.label} Priority
                                                </span>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
