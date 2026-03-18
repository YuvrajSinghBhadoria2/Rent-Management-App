'use client';

import { useState, useEffect } from 'react';
import { Loader2, Megaphone, Send, Building2, Check, Users, MessageSquare, Info, AlertCircle, ChevronRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function BroadcastPage() {
    const [buildings, setBuildings] = useState<any[]>([]);
    const [selectedBuildings, setSelectedBuildings] = useState<string[]>([]);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchBuildings();
    }, []);

    async function fetchBuildings() {
        try {
            const res = await fetch('/api/buildings');
            const result = await res.json();
            if (result.success) setBuildings(result.data);
        } catch (error) {
            toast.error('Failed to load buildings');
        } finally {
            setIsLoading(false);
        }
    }

    const handleToggleBuilding = (id: string) => {
        setSelectedBuildings(prev =>
            prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedBuildings(buildings.map(b => b.id));
        } else {
            setSelectedBuildings([]);
        }
    };

    const handleSendBroadcast = async () => {
        if (selectedBuildings.length === 0) return toast.error('Select at least one building');
        if (!title || !message) return toast.error('Title and message are required');

        setIsSending(true);
        try {
            const res = await fetch('/api/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    buildingIds: selectedBuildings,
                    title,
                    message
                })
            });
            const result = await res.json();
            if (result.success) {
                toast.success(result.message);
                setTitle('');
                setMessage('');
                setSelectedBuildings([]);
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to send broadcast');
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Initializing Communication Channels</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto px-4 md:px-8 py-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
                        Broadcast Hub
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">Send high-priority announcements and emergency alerts to your residents.</p>
                </div>
                <div className="flex items-center gap-3 bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Channel Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Building Selection Sidebar */}
                <Card className="lg:col-span-4 glass-card border-white/10 shadow-2xl flex flex-col h-fit sticky top-24">
                    <CardHeader className="border-b border-white/5 pb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-primary" />
                                <CardTitle className="text-lg font-bold">Target Audience</CardTitle>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label className="text-[10px] uppercase font-bold text-muted-foreground">All</Label>
                                <Checkbox
                                    className="data-[state=checked]:bg-primary"
                                    checked={selectedBuildings.length === buildings.length && buildings.length > 0}
                                    onCheckedChange={handleSelectAll}
                                />
                            </div>
                        </div>
                        <CardDescription className="text-[11px] mt-1">Select the buildings to receive this message.</CardDescription>
                    </CardHeader>
                    <ScrollArea className="max-h-[450px]">
                        <CardContent className="p-4 space-y-2">
                            {buildings.map(building => (
                                <div
                                    key={building.id}
                                    className={cn(
                                        "flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group",
                                        selectedBuildings.includes(building.id)
                                            ? "bg-primary/10 border-primary/20"
                                            : "bg-white/5 border-white/5 hover:border-white/10"
                                    )}
                                    onClick={() => handleToggleBuilding(building.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                            selectedBuildings.includes(building.id) ? "bg-primary text-white" : "bg-white/5 text-muted-foreground group-hover:text-white"
                                        )}>
                                            <Building2 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold group-hover:text-primary transition-colors">{building.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{building.type.replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                    <Checkbox
                                        className="data-[state=checked]:bg-primary border-white/20"
                                        checked={selectedBuildings.includes(building.id)}
                                        onCheckedChange={() => handleToggleBuilding(building.id)}
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </ScrollArea>
                    <CardFooter className="bg-white/5 border-t border-white/5 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-primary tracking-tight">
                            <Users className="h-3 w-3" />
                            <span className="text-[10px] uppercase tracking-widest">{selectedBuildings.length} Selected</span>
                        </div>
                    </CardFooter>
                </Card>

                {/* Composer Main Area */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="glass-card border-white/10 shadow-2xl overflow-hidden">
                        <CardHeader className="border-b border-white/5 pb-6">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <MessageSquare className="h-4 w-4" />
                                </div>
                                <CardTitle className="text-xl font-bold">Compose Message</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-6">
                            <div className="space-y-3">
                                <Label htmlFor="title" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Announcement Subject</Label>
                                <div className="relative">
                                    <Megaphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="title"
                                        placeholder="e.g., Scheduled Maintenance Notification"
                                        className="pl-10 h-12 glass-card border-white/10 dark:bg-white/5 focus:border-primary/20 transition-all font-medium text-base"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label htmlFor="message" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Message Content</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Type your official announcement here. Keep it clear and concise."
                                    className="min-h-[250px] p-4 glass-card border-white/10 dark:bg-white/5 focus:border-primary/20 transition-all font-medium resize-none leading-relaxed"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>

                            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                                <Info className="h-4 w-4 text-amber-500 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Protocol Reminder</p>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">This will be sent as a push notification and in-app alert to all residents in selected properties. Ensure information is accurate and authorized.</p>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex items-center justify-between border-t border-white/5 pt-6 pb-6 px-8 bg-white/5">
                            <div className="flex flex-col">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Selected Delivery</p>
                                <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5 tracking-tight">
                                    {selectedBuildings.length === 0 ? 'No property selected' : `${selectedBuildings.length} Propery Channels`}
                                </p>
                            </div>
                            <Button
                                onClick={handleSendBroadcast}
                                disabled={isSending || selectedBuildings.length === 0}
                                className="shadow-lg shadow-primary/20 h-11 px-8 min-w-[180px]"
                            >
                                {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                                Push Announcement
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Quick Templates or Guide */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="glass-card border-white/10 hover:bg-white/5 transition-all cursor-pointer group">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recent Sent</CardTitle>
                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm font-bold truncate">Maintenance alert for Galaxy Residency</p>
                                <p className="text-[10px] text-muted-foreground mt-1">Sent 2 days ago to 24 residents</p>
                            </CardContent>
                        </Card>
                        <Card className="glass-card border-white/10 hover:bg-white/5 transition-all cursor-pointer group">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Drafts</CardTitle>
                                <Plus className="h-4 w-4 text-muted-foreground group-hover:scale-110 transition-transform" />
                            </CardHeader>
                            <CardContent className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">No active drafts</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
