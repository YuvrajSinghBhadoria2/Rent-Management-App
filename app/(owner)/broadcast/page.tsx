'use client';

import { useState, useEffect } from 'react';
import { Loader2, Megaphone, Send, Building2, Check } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

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

    const handleSelectAll = () => {
        if (selectedBuildings.length === buildings.length) {
            setSelectedBuildings([]);
        } else {
            setSelectedBuildings(buildings.map(b => b.id));
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
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto py-8 px-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Broadcast Message</h1>
                <p className="text-muted-foreground">Send an announcement or alert to all tenants in specific buildings.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-1 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center justify-between">
                            Select Buildings
                            <Button variant="link" size="sm" className="h-0 px-0 text-xs" onClick={handleSelectAll}>
                                {selectedBuildings.length === buildings.length ? 'Deselect All' : 'Select All'}
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
                        {buildings.map(building => (
                            <div key={building.id} className="flex items-center space-x-3 space-y-0 rounded-md border p-3 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => handleToggleBuilding(building.id)}>
                                <Checkbox checked={selectedBuildings.includes(building.id)} onCheckedChange={() => handleToggleBuilding(building.id)} />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">{building.name}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="bg-slate-50 border-t p-4">
                        <p className="text-xs text-muted-foreground">{selectedBuildings.length} buildings selected</p>
                    </CardFooter>
                </Card>

                <Card className="md:col-span-2 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Megaphone className="h-5 w-5 text-primary" />
                            Compose Message
                        </CardTitle>
                        <CardDescription>This message will be sent as a notification to all active tenants in the selected buildings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Subject / Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g. Water Tank Cleaning Schedule"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message">Message Body</Label>
                            <Textarea
                                id="message"
                                placeholder="Type your message here..."
                                className="min-h-[200px]"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t py-4">
                        <p className="text-xs text-muted-foreground italic truncate max-w-[200px]">
                            {selectedBuildings.length > 0 ? `Targeting: ${selectedBuildings.length} buildings` : 'No building selected'}
                        </p>
                        <Button onClick={handleSendBroadcast} disabled={isSending}>
                            {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Send Broadcast
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
