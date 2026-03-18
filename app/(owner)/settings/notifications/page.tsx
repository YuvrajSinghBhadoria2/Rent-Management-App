'use client';

import { useState, useEffect } from 'react';
import { Loader2, Bell, Mail, Smartphone, Save, Shield, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export default function NotificationSettings() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        emailReminders: true,
        penaltyAlerts: true,
        broadcastCopy: true,
        appNotifications: true,
    });

    useEffect(() => {
        setTimeout(() => setLoading(false), 500);
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await new Promise(r => setTimeout(r, 1000));
            toast.success('Notification settings saved');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Alerts</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-3xl mx-auto px-4 md:px-8 py-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
                        Notification Matrix
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Fine-tune how your residents and buildings interact with automated alerts.
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="shadow-lg shadow-primary/20 h-11 px-8 min-w-[160px]">
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Policy
                </Button>
            </div>

            <div className="grid gap-8">
                <Card className="glass-card border-white/10 shadow-2xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 pb-6 bg-white/5">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                <Mail className="h-4 w-4" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Email Communications</CardTitle>
                                <CardDescription className="text-xs">Automated resident engagement via email.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-8">
                        {[
                            {
                                id: 'emailReminders',
                                label: 'Rent Due Reminders',
                                desc: 'System will send alerts 7 days, 3 days, and on the due date.',
                                icon: Clock,
                                checked: settings.emailReminders
                            },
                            {
                                id: 'penaltyAlerts',
                                label: 'Penalty Policy Notifications',
                                desc: 'Inform tenants immediately when a late fee is accrued.',
                                icon: Shield,
                                checked: settings.penaltyAlerts
                            },
                            {
                                id: 'broadcastCopy',
                                label: 'Broadcast Shadowbox',
                                desc: 'Receive a BCC of every broadcast message sent to tenants.',
                                icon: Save,
                                checked: settings.broadcastCopy
                            }
                        ].map((item) => (
                            <div key={item.id} className="flex items-center justify-between group p-2 rounded-2xl hover:bg-white/5 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="mt-1 p-2 rounded-lg bg-white/5 group-hover:bg-primary/10 transition-colors">
                                        <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{item.label}</p>
                                        <p className="text-xs text-muted-foreground max-w-sm mt-0.5">{item.desc}</p>
                                    </div>
                                </div>
                                <Switch
                                    className="data-[state=checked]:bg-primary"
                                    checked={item.checked}
                                    onCheckedChange={(val) => setSettings({ ...settings, [item.id]: val })}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="glass-card border-white/10 shadow-xl overflow-hidden">
                    <CardHeader className="border-b border-white/5 pb-6 bg-white/5">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Bell className="h-4 w-4" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold">Real-time Push</CardTitle>
                                <CardDescription className="text-xs">Browser and mobile notifications for the owner bell icon.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="flex items-center justify-between group p-2 rounded-2xl hover:bg-white/5 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 p-2 rounded-lg bg-white/5 group-hover:bg-primary/10 transition-colors">
                                    <Smartphone className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">Enable Bell Alerts</p>
                                    <p className="text-xs text-muted-foreground max-w-md mt-0.5">
                                        Show real-time red badges and popovers for collections and complaints.
                                    </p>
                                </div>
                            </div>
                            <Switch
                                className="data-[state=checked]:bg-primary"
                                checked={settings.appNotifications}
                                onCheckedChange={(val) => setSettings({ ...settings, appNotifications: val })}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
