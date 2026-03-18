'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Wrench,
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  MessageSquare,
  Users,
  Building2,
  Loader2,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Layers,
  Search,
  CheckSquare
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { StatCard } from '@/components/owner/StatCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Complaint {
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

const categoryLabels: Record<string, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  furniture: 'Furniture',
  internet: 'Internet',
  cleaning: 'Cleaning',
  security: 'Security',
  other: 'Other',
};

export default function ComplaintsPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  async function fetchComplaints() {
    try {
      const token = localStorage.getItem('firebase-token');
      const response = await fetch('/api/complaints', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setComplaints(data.data);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
      toast.error('Failed to load asset maintenance logs');
    } finally {
      setLoading(false);
    }
  }

  const filteredComplaints = complaints.filter(c => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.buildingName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const openCount = complaints.filter(c => c.status === 'open').length;
  const inProgressCount = complaints.filter(c => c.status === 'in_progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-8 py-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
            Issue Tracking
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Manage resident reports and prioritize building maintenance work-orders.</p>
        </div>
        <div className="flex items-center gap-3 bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
          <Wrench className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Ops Control Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          label="Awaiting Initial Review"
          value={openCount.toString()}
          icon={AlertCircle}
          color="amber"
          sub="New open tickets requiring triage"
        />
        <StatCard
          label="Active Workorders"
          value={inProgressCount.toString()}
          icon={Clock}
          color="blue"
          sub="Tickets currently with technicians"
        />
        <StatCard
          label="Closed Records"
          value={resolvedCount.toString()}
          icon={CheckCircle2}
          color="green"
          sub="Successfully resolved this month"
        />
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search by issue title, resident, or property..."
            className="pl-11 h-12 glass-card border-white/10 dark:bg-white/5 focus:border-primary/20 transition-all font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[220px] h-12 glass-card border-white/10 px-5 rounded-2xl">
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-gray-400" />
              <SelectValue placeholder="System Triage" />
            </div>
          </SelectTrigger>
          <SelectContent className="glass-card border-white/10 rounded-2xl shadow-2xl">
            <SelectItem value="all" className="font-bold text-[10px] uppercase tracking-widest">All Workorders</SelectItem>
            <SelectItem value="open" className="font-bold text-[10px] uppercase tracking-widest text-amber-500">Unassigned / Open</SelectItem>
            <SelectItem value="in_progress" className="font-bold text-[10px] uppercase tracking-widest text-blue-500">In Progress</SelectItem>
            <SelectItem value="resolved" className="font-bold text-[10px] uppercase tracking-widest text-emerald-500">Resolved</SelectItem>
            <SelectItem value="closed" className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="glass-card border-white/10 shadow-2xl overflow-hidden pb-8">
        <CardHeader className="border-b border-white/5 pb-6 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Maintenance Queue</CardTitle>
              <CardDescription className="text-xs">Prioritized list of all active building escalations.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8 px-4 md:px-10">
          {loading ? (
            <div className="flex h-60 items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Escalations</p>
              </div>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center mb-6 border border-white/5 shadow-inner opacity-20">
                <CheckSquare className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold tracking-tight uppercase opacity-50">Zero active issues</h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-xs font-medium italic">Building systems are operating within normal parameters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredComplaints.map((complaint, idx) => (
                <Link
                  key={complaint.id}
                  href={`/complaints/${complaint.id}`}
                  className="group block p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-primary/20 transition-all hover:scale-[1.02] relative overflow-hidden"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  {/* Priority Indicator Line */}
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-1 rounded-full",
                    complaint.priority === 'urgent' ? "bg-red-500" :
                      complaint.priority === 'normal' ? "bg-blue-500" :
                        "bg-gray-500 opacity-20"
                  )} />

                  <div className="flex items-start justify-between gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold tracking-tight text-gray-900 dark:text-white group-hover:text-primary transition-colors">{complaint.title}</p>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={cn(
                            "rounded-lg px-2 py-0 text-[8px] font-bold uppercase tracking-widest border-none shadow-sm",
                            complaint.priority === 'urgent' ? "bg-red-500/10 text-red-500" :
                              complaint.priority === 'normal' ? "bg-blue-500/10 text-blue-500" :
                                "bg-gray-500/10 text-gray-600"
                          )}>
                            {complaint.priority}
                          </Badge>
                          <Badge variant="outline" className={cn(
                            "rounded-lg px-2 py-0 text-[8px] font-bold uppercase tracking-widest border-white/5",
                            complaint.status === 'open' ? "text-amber-500 bg-amber-500/5" :
                              complaint.status === 'in_progress' ? "text-blue-500 bg-blue-500/5" :
                                complaint.status === 'resolved' ? "text-emerald-500 bg-emerald-500/5" :
                                  "text-muted-foreground bg-white/5"
                          )}>
                            {complaint.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-tight">
                          <Users className="h-3.5 w-3.5 text-primary/40" />
                          <span className="truncate">{complaint.tenantName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground uppercase tracking-tight">
                          <Building2 className="h-3.5 w-3.5 text-primary/40" />
                          <span className="truncate">{complaint.buildingName} • {complaint.roomNumber}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-lg bg-white/5 flex items-center justify-center">
                            <MessageSquare className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{categoryLabels[complaint.category]} Escalation</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground bg-white/5 px-2 py-1 rounded-full uppercase">
                          <Calendar className="h-3 w-3 opacity-50" />
                          {format(new Date(complaint.createdAt), 'MMM d')}
                        </div>
                      </div>
                    </div>

                    <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all border border-white/5 group-hover:border-primary/20">
                      {complaint.priority === 'urgent' ? <ShieldAlert className="h-6 w-6 text-red-500/50 group-hover:text-red-500 transition-colors" /> : <Wrench className="h-6 w-6 opacity-20 group-hover:opacity-100" />}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="p-8 glass-card border-white/10 bg-primary/5 rounded-[3rem] flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
            <MessageSquare className="h-8 w-8 text-primary opacity-50" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Standardize your responses</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">Define template responses for common issues like plumbing or internet outages to speed up resolution.</p>
          </div>
        </div>
        <Button variant="outline" className="h-11 px-8 rounded-2xl font-bold text-[10px] uppercase tracking-widest glass-card border-white/10">Configure Templates</Button>
      </div>
    </div>
  );
}
