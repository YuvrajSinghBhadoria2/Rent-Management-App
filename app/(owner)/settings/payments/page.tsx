'use client';

import { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, CreditCard, Smartphone, Zap, Save } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function PaymentSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [config, setConfig] = useState({
        razorpayEnabled: true,
        razorpayKeyId: '',
        razorpayKeySecret: '',
        cashfreeEnabled: false,
        cashfreeAppId: '',
        cashfreeSecretKey: '',
        phonePeEnabled: false,
        phonePeMerchantId: '',
        phonePeSaltKey: '',
        phonePeSaltIndex: '1',
        razorpayEnv: 'TEST',
        cashfreeEnv: 'TEST',
        phonePeEnv: 'UAT',
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    async function fetchSettings() {
        try {
            const res = await fetch('/api/owner/settings/payments');
            const result = await res.json();
            if (result.success && result.data) {
                setConfig(result.data);
            }
        } catch (error) {
            // toast.error('Failed to load settings');
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/owner/settings/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });
            const result = await res.json();
            if (result.success) {
                toast.success('Payment settings updated');
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto py-8 px-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payment Gateways</h1>
                <p className="text-muted-foreground">Configure your credentials to receive rent payments directly to your account.</p>
            </div>

            <div className="grid gap-6">
                <Card className="shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                                <CardTitle>Razorpay</CardTitle>
                            </div>
                            <Switch
                                checked={config.razorpayEnabled}
                                onCheckedChange={(val) => setConfig({ ...config, razorpayEnabled: val })}
                            />
                        </div>
                        <CardDescription>Most popular gateway in India. Supports all payment methods.</CardDescription>
                    </CardHeader>
                    {config.razorpayEnabled && (
                        <CardContent className="space-y-4 pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Key ID</Label>
                                    <Input
                                        value={config.razorpayKeyId}
                                        onChange={(e) => setConfig({ ...config, razorpayKeyId: e.target.value })}
                                        placeholder="rzp_live_..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Key Secret</Label>
                                    <Input
                                        type="password"
                                        value={config.razorpayKeySecret}
                                        onChange={(e) => setConfig({ ...config, razorpayKeySecret: e.target.value })}
                                        placeholder="••••••••••••"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Environment</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={config.razorpayEnv}
                                        onChange={(e) => setConfig({ ...config, razorpayEnv: e.target.value })}
                                    >
                                        <option value="TEST">Test / Sandbox</option>
                                        <option value="LIVE">Live / Production</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-teal-600" />
                                <CardTitle>Cashfree</CardTitle>
                            </div>
                            <Switch
                                checked={config.cashfreeEnabled}
                                onCheckedChange={(val) => setConfig({ ...config, cashfreeEnabled: val })}
                            />
                        </div>
                        <CardDescription>Known for low fees (1.75% + GST) and fast settlements.</CardDescription>
                    </CardHeader>
                    {config.cashfreeEnabled && (
                        <CardContent className="space-y-4 pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>App ID</Label>
                                    <Input
                                        value={config.cashfreeAppId}
                                        onChange={(e) => setConfig({ ...config, cashfreeAppId: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Secret Key</Label>
                                    <Input
                                        type="password"
                                        value={config.cashfreeSecretKey}
                                        onChange={(e) => setConfig({ ...config, cashfreeSecretKey: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Environment</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={config.cashfreeEnv}
                                        onChange={(e) => setConfig({ ...config, cashfreeEnv: e.target.value })}
                                    >
                                        <option value="TEST">Test / Sandbox</option>
                                        <option value="PROD">Production</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Smartphone className="h-5 w-5 text-purple-600" />
                                <CardTitle>PhonePe</CardTitle>
                            </div>
                            <Switch
                                checked={config.phonePeEnabled}
                                onCheckedChange={(val) => setConfig({ ...config, phonePeEnabled: val })}
                            />
                        </div>
                        <CardDescription>Best for UPI payments. Reliable and high success rates.</CardDescription>
                    </CardHeader>
                    {config.phonePeEnabled && (
                        <CardContent className="space-y-4 pt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Merchant ID</Label>
                                    <Input
                                        value={config.phonePeMerchantId}
                                        onChange={(e) => setConfig({ ...config, phonePeMerchantId: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Salt Key</Label>
                                    <Input
                                        type="password"
                                        value={config.phonePeSaltKey}
                                        onChange={(e) => setConfig({ ...config, phonePeSaltKey: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Salt Index</Label>
                                    <Input
                                        value={config.phonePeSaltIndex}
                                        onChange={(e) => setConfig({ ...config, phonePeSaltIndex: e.target.value })}
                                        placeholder="1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Environment</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={config.phonePeEnv}
                                        onChange={(e) => setConfig({ ...config, phonePeEnv: e.target.value })}
                                    >
                                        <option value="UAT">UAT / Sandbox</option>
                                        <option value="PROD">Production</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    )}
                </Card>

                <div className="flex items-center justify-end gap-4">
                    <Button variant="outline">Reset to Defaults</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}
