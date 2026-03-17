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
  Loader2
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
  open: { label: 'Open', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800 border-green-200' },
  closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800 border-gray-200' },
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
        toast.success('Status updated');
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
        toast.success('Comment added');
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
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!complaint) return null;

  const isOwner = userDoc?.role === 'owner';

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2 text-muted-foreground">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{complaint.title}</h1>
            <Badge className={statusMap[complaint.status]?.color} variant="outline">
              {statusMap[complaint.status]?.label}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Ref ID: <span className="font-mono">{complaint.id.slice(-6).toUpperCase()}</span> •
            Filed on {formatDate(new Date(complaint.createdAt))}
          </p>
        </div>

        {isOwner && (
          <div className="flex items-center gap-3">
            <Select value={complaint.status} onValueChange={handleStatusUpdate}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Update Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {complaint.description}
              </p>
            </CardContent>
            <Separator />
            <CardFooter className="py-4 bg-muted/5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full text-xs">
                <div className="space-y-1">
                  <p className="text-muted-foreground uppercase font-bold text-[10px]">Category</p>
                  <p className="font-medium capitalize">{complaint.category}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground uppercase font-bold text-[10px]">Priority</p>
                  <p className="font-medium capitalize">{complaint.priority}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground uppercase font-bold text-[10px]">Location</p>
                  <p className="font-medium">{complaint.buildingName || 'Building'} - Room {complaint.roomNumber || 'NA'}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-muted-foreground uppercase font-bold text-[10px]">Tenant</p>
                  <p className="font-medium">{complaint.tenantName}</p>
                </div>
              </div>
            </CardFooter>
          </Card>

          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Updates & Comments
            </h3>

            <div className="space-y-4">
              {complaint.comments?.length === 0 ? (
                <div className="text-center py-8 border rounded-lg border-dashed text-muted-foreground italic text-sm">
                  No updates yet.
                </div>
              ) : (
                complaint.comments?.map((comment) => (
                  <div key={comment.id} className={`flex ${comment.authorRole === userDoc?.role ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-lg shadow-sm ${comment.authorRole === userDoc?.role
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white border'
                      }`}>
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <span className={`text-[10px] font-bold uppercase opacity-80 ${comment.authorRole === userDoc?.role ? 'text-primary-foreground' : 'text-primary'}`}>
                          {comment.authorName} ({comment.authorRole})
                        </span>
                        <span className="text-[10px] opacity-60">
                          {formatDate(new Date(comment.createdAt))}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Card className="shadow-sm border-primary/20">
              <CardContent className="pt-6 space-y-4">
                <Label htmlFor="comment" className="text-sm font-bold">Add an update</Label>
                <Textarea
                  id="comment"
                  placeholder="Type your message here..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
                <div className="flex justify-end">
                  <Button onClick={handleAddComment} disabled={isSubmitting || !commentText.trim()}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-muted/10 border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Helpful Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-3">
              <div className="flex gap-2">
                <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                <p>Most requests are processed within 24-48 hours depending on severity.</p>
              </div>
              <div className="flex gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>For emergencies (gas leak, water burst), please call the building supervisor directly.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
