'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  User,
  Calendar,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Wrench,
  Loader2,
  MoreVertical,
  ShieldAlert,
  MapPin,
  Layout
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { formatDate } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  tenantName: string;
  buildingName: string;
  roomNumber: string;
  createdAt: string;
  comments?: Comment[];
}

const statusMap: any = {
  open: { label: 'Open', color: 'bg-rose-500/10 text-rose-600 border-rose-500/20', icon: AlertCircle },
  in_progress: { label: 'In Progress', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: Clock },
  resolved: { label: 'Resolved', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
  closed: { label: 'Closed', color: 'bg-gray-500/10 text-gray-600 border-gray-500/20', icon: Layout },
};

const priorityMap: any = {
  urgent: "bg-rose-600 text-white",
  normal: "bg-blue-600 text-white",
  low: "bg-gray-400 text-white",
};

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { userDoc } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  async function fetchComplaint() {
    try {
      const response = await fetch(`/api/complaints/${id}`);
      const result = await response.json();
      if (result.success) {
        setComplaint(result.data);
      } else {
        toast.error(result.error || 'Failed to load complaint');
        router.back();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load complaint');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate(newStatus: string) {
    try {
      const response = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(`Ticket marked as ${newStatus.replace('_', ' ')}`);
        fetchComplaint();
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  }

  async function handleAddComment() {
    if (!commentText.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText }),
      });
      const result = await response.json();
      if (result.success) {
        setCommentText('');
        toast.success('System update broadcasted');
        fetchComplaint();
      }
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Wrench className="h-6 w-6 text-primary opacity-50 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!complaint) return null;

  const isOwner = userDoc?.role === 'owner';
  const CurrentStatusIcon = statusMap[complaint.status]?.icon || AlertCircle;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 space-y-10 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full hover:bg-white/10 glass-card"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white uppercase">{complaint.title}</h1>
              <Badge className={cn(
                "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none",
                statusMap[complaint.status]?.color
              )}>
                {statusMap[complaint.status]?.label}
              </Badge>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1.5 font-medium italic">
              Ticket ID: <span className="font-mono font-black text-primary px-2 bg-primary/5 rounded-md uppercase">{complaint.id.slice(-8)}</span> • Filed {formatDate(new Date(complaint.createdAt))}
            </p>
          </div>
        </div>

        {isOwner && (
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2 hidden sm:flex">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">State Transition</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-600">Sync Active</span>
              </div>
            </div>
            <Select value={complaint.status} onValueChange={handleStatusUpdate}>
              <SelectTrigger className="w-[180px] h-12 rounded-full glass-card border-none font-black text-[10px] uppercase tracking-widest shadow-xl">
                <SelectValue placeholder="Transition to..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-none shadow-2xl glass-card">
                <SelectItem value="open" className="rounded-xl font-bold py-3">Open Ticket</SelectItem>
                <SelectItem value="in_progress" className="rounded-xl font-bold py-3">In Progress</SelectItem>
                <SelectItem value="resolved" className="rounded-xl font-bold py-3">Mark Resolved</SelectItem>
                <SelectItem value="closed" className="rounded-xl font-bold py-3">Close Ticket</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-10">
          {/* Detailed Description */}
          <Card className="glass-card border-none rounded-[2.5rem] shadow-none overflow-hidden">
            <CardHeader className="p-10 pb-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-black tracking-tight">Technical Breakdown</CardTitle>
                <CardDescription className="text-gray-500 font-medium">Original report provided by the resident.</CardDescription>
              </div>
              <div className={cn("p-3 rounded-2xl", statusMap[complaint.status]?.color)}>
                <CurrentStatusIcon className="h-6 w-6" />
              </div>
            </CardHeader>
            <CardContent className="p-10 pt-0">
              <div className="p-8 rounded-[2rem] bg-white/50 dark:bg-black/20 border border-gray-100 dark:border-white/5">
                <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  {complaint.description}
                </p>
              </div>
            </CardContent>
            <Separator className="opacity-10" />
            <CardFooter className="p-10 bg-gray-50/50 dark:bg-white/5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                <div className="space-y-1.5">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Category</p>
                  <p className="font-black text-sm dark:text-white capitalize flex items-center gap-2 text-primary">
                    <Wrench className="h-3.5 w-3.5" />
                    {complaint.category}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Priority</p>
                  <Badge className={cn("rounded-full border-none font-black text-[9px] uppercase tracking-widest", priorityMap[complaint.priority])}>
                    {complaint.priority}
                  </Badge>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Location</p>
                  <p className="font-black text-sm dark:text-white flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-rose-500" />
                    {complaint.roomNumber}
                  </p>
                </div>
                <div className="space-y-1.5 text-right">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">Subscribed Tenant</p>
                  <p className="font-black text-sm dark:text-white">{complaint.tenantName}</p>
                </div>
              </div>
            </CardFooter>
          </Card>

          {/* Activity Timeline */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <MessageSquare className="h-5 w-5" />
                </div>
                Incident Timeline
              </h3>
              <Badge variant="outline" className="rounded-full px-4 py-1 text-[9px] font-black uppercase tracking-widest opacity-50">
                {complaint.comments?.length || 0} Events Logged
              </Badge>
            </div>

            <div className="relative pl-8 space-y-10">
              {/* Vertical Line */}
              <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gray-100 dark:bg-white/5" />

              {complaint.comments?.length === 0 ? (
                <div className="ml-4 py-16 px-10 glass-card rounded-[2.5rem] border-none text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto opacity-50">
                    <Clock className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-black dark:text-white">Awaiting Diagnostics</p>
                    <p className="text-sm text-gray-400 font-medium">No system updates or comments have been broadcasted yet.</p>
                  </div>
                </div>
              ) : (
                complaint.comments?.map((comment) => (
                  <div key={comment.id} className="relative">
                    {/* Dot on line */}
                    <div className={cn(
                      "absolute -left-[23px] top-6 w-4 h-4 rounded-full border-4 border-white dark:border-gray-950",
                      comment.authorRole === 'owner' ? "bg-primary" : "bg-emerald-500"
                    )} />

                    <div className={cn(
                      "p-8 rounded-[2rem] glass-card border-none transition-all duration-300 group hover:scale-[1.01]",
                      comment.authorRole === 'owner' ? "bg-primary/5 shadow-xl shadow-primary/5" : "bg-white dark:bg-black/20"
                    )}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
                            comment.authorRole === 'owner' ? "bg-primary text-white" : "bg-emerald-500 text-white"
                          )}>
                            {comment.authorName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-sm dark:text-white uppercase tracking-tight">{comment.authorName}</p>
                            <Badge variant="ghost" className="p-0 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                              {comment.authorRole}
                            </Badge>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 italic">
                          {formatDate(new Date(comment.createdAt))}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 font-medium whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}

              {/* Add Update Input */}
              <div className="relative pt-4">
                <div className="absolute -left-[23px] top-10 w-4 h-4 rounded-full border-4 border-white dark:border-gray-950 bg-gray-300" />
                <Card className="glass-card border-none rounded-[2.5rem] shadow-2xl overflow-hidden ring-4 ring-primary/5">
                  <CardContent className="p-8 space-y-6">
                    <Label htmlFor="comment" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Internal Broadcast / Resident Update</Label>
                    <div className="relative">
                      <Textarea
                        id="comment"
                        placeholder="Document technical progress or instructions for the resident..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="min-h-[120px] rounded-[1.5rem] bg-gray-50/50 dark:bg-black/20 border-none focus-visible:ring-primary/20 p-6 font-medium text-sm leading-relaxed"
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 opacity-40">
                        <ShieldAlert className="h-4 w-4" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Visible to Resident</span>
                      </div>
                      <Button
                        onClick={handleAddComment}
                        disabled={isSubmitting || !commentText.trim()}
                        className="rounded-full px-8 h-12 font-black text-xs uppercase tracking-[0.2em] shadow-xl group"
                      >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                        Sync Update
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-10">
          <Card className="glass-card border-none rounded-[2.5rem] shadow-none overflow-hidden sticky top-24">
            <CardHeader className="p-8">
              <CardTitle className="text-xl font-black">Ticket Metadata</CardTitle>
              <CardDescription className="text-gray-500">Technical context from registry.</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-8">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 transition-all group-hover:scale-110">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Property Asset</p>
                  <p className="font-black text-sm dark:text-white line-clamp-1">{complaint.buildingName}</p>
                </div>
              </div>
              <Separator className="opacity-5" />
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 transition-all group-hover:scale-110">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Internal Point</p>
                  <p className="font-black text-sm dark:text-white">Floor {Math.floor(parseInt(complaint.roomNumber) / 100 || 0)} · Room {complaint.roomNumber}</p>
                </div>
              </div>
              <Separator className="opacity-5" />
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 transition-all group-hover:scale-110">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Reporting Resident</p>
                  <p className="font-black text-sm dark:text-white">{complaint.tenantName}</p>
                </div>
              </div>

              <div className="mt-10 p-6 rounded-[1.5rem] border border-dashed border-gray-100 dark:border-white/5 space-y-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Service Level Target</p>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-400">Response</span>
                  <span className="text-emerald-500">Met (2h)</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-gray-400">Resolution</span>
                  <span className="text-amber-500">Pending</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

