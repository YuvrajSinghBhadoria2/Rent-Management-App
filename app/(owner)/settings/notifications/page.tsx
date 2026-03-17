'use client';

import { useState, useEffect } from 'react';
import { Loader2, Bell, Mail, Smartphone, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
        // Fetch settings - simplified for demo
        setTimeout(() => setLoading(false), 500);
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            // API call would go here
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
            <div className="flex h-60 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold border-b pb-2">Notification Settings</h1>
                <p className="text-muted-foreground mt-2">
                    Manage how you and your tenants receive automated alerts.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Email Communications
                    </CardTitle>
                    <CardDescription>
                        Control automated emails sent to tenants.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Rent Due Reminders</Label>
                            <p className="text-sm text-muted-foreground">
                                Send automated emails 7 days, 3 days, and on the due date.
                            </p>
                        </div>
                        <Switch
                            checked={settings.emailReminders}
                            onCheckedChange={(val) => setSettings({ ...settings, emailReminders: val })}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Penalty Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Notify tenants immediately when a late fee is added.
                            </p>
                        </div>
                        <Switch
                            checked={settings.penaltyAlerts}
                            onCheckedChange={(val) => setSettings({ ...settings, penaltyAlerts: val })}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Broadcast Copies</Label>
                            <p className="text-sm text-muted-foreground">
                                Send a copy of broadcast messages to your own email.
                            </p>
                        </div>
                        <Switch
                            checked={settings.broadcastCopy}
                            onCheckedChange={(val) => setSettings({ ...settings, broadcastCopy: val })}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        In-App Notifications
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Enable Notifications</Label>
                            <p className="text-sm text-muted-foreground">
                                Show real-time alerts in the top navigation bell.
                            </p>
                        </div>
                        <Switch
                            checked={settings.appNotifications}
                            onCheckedChange={(val) => setSettings({ ...settings, appNotifications: val })}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                </Button>
            </div>
        </div>
    );
}
