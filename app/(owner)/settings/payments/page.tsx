'use client';

import { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, CreditCard, Smartphone, Zap, Save, Globe, Lock, Terminal } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
            console.error(error);
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
                toast.success('Payment gateway configuration synchronized');
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
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Establishing Secure Connection</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto px-4 md:px-8 py-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
                        Financial Integrations
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">Link your business accounts to enable frictionless rent collection.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="text-xs font-bold uppercase tracking-widest">Restore Defaults</Button>
                    <Button onClick={handleSave} disabled={isSaving} className="shadow-lg shadow-primary/20 h-11 px-8 min-w-[180px]">
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Sync Credentials
                    </Button>
                </div>
            </div>

            <div className="grid gap-8">
                {[
                    {
                        id: 'razorpay',
                        title: 'Razorpay',
                        icon: CreditCard,
                        color: 'text-blue-500 bg-blue-500/10',
                        desc: 'Universal support for EMI, NB and all Credit Cards.',
                        enabled: config.razorpayEnabled,
                        fields: [
                            { label: 'Key ID', key: 'razorpayKeyId', placeholder: 'rzp_live_...', type: 'text' },
                            { label: 'Key Secret', key: 'razorpayKeySecret', placeholder: '••••••••', type: 'password' },
                        ],
                        envKey: 'razorpayEnv',
                        envs: ['TEST', 'LIVE']
                    },
                    {
                        id: 'cashfree',
                        title: 'Cashfree',
                        icon: Zap,
                        color: 'text-teal-500 bg-teal-500/10',
                        desc: 'Optimized for low TDR settlements with bank accounts.',
                        enabled: config.cashfreeEnabled,
                        fields: [
                            { label: 'App ID', key: 'cashfreeAppId', placeholder: 'APP_...', type: 'text' },
                            { label: 'Secret Key', key: 'cashfreeSecretKey', placeholder: '••••••••', type: 'password' },
                        ],
                        envKey: 'cashfreeEnv',
                        envs: ['TEST', 'PROD']
                    },
                    {
                        id: 'phonepe',
                        title: 'PhonePe',
                        icon: Smartphone,
                        color: 'text-purple-500 bg-purple-500/10',
                        desc: 'High-conversion UPI flows via the PhonePe ecosystem.',
                        enabled: config.phonePeEnabled,
                        fields: [
                            { label: 'Merchant ID', key: 'phonePeMerchantId', placeholder: 'MID...', type: 'text' },
                            { label: 'Salt Key', key: 'phonePeSaltKey', placeholder: '••••••••', type: 'password' },
                            { label: 'Salt Index', key: 'phonePeSaltIndex', placeholder: '1', type: 'text' },
                        ],
                        envKey: 'phonePeEnv',
                        envs: ['UAT', 'PROD']
                    },
                ].map((gateway) => (
                    <Card key={gateway.id} className={cn(
                        "glass-card border-white/10 shadow-2xl overflow-hidden transition-all duration-500",
                        !gateway.enabled && "opacity-60 saturate-50"
                    )}>
                        <CardHeader className="border-b border-white/5 pb-6 bg-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={cn("p-3 rounded-2xl", gateway.color)}>
                                        <gateway.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-xl font-bold">{gateway.title}</CardTitle>
                                            <Badge variant="outline" className="text-[9px] font-bold tracking-widest bg-white/5 border-white/10 opacity-70">
                                                {gateway.enabled ? 'ACTIVE API' : 'INACTIVE'}
                                            </Badge>
                                        </div>
                                        <CardDescription className="text-xs mt-0.5">{gateway.desc}</CardDescription>
                                    </div>
                                </div>
                                <Switch
                                    className="data-[state=checked]:bg-primary"
                                    checked={gateway.enabled}
                                    onCheckedChange={(val) => setConfig({ ...config, [`${gateway.id}Enabled`]: val })}
                                />
                            </div>
                        </CardHeader>
                        {gateway.enabled && (
                            <CardContent className="pt-8 space-y-6 animate-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {gateway.fields.map((field) => (
                                        <div key={field.key} className="space-y-2.5">
                                            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{field.label}</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                                <Input
                                                    type={field.type}
                                                    className="pl-10 h-11 glass-card border-white/10 dark:bg-white/5 focus:border-primary/20 transition-all font-medium"
                                                    value={(config as any)[field.key]}
                                                    onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                                                    placeholder={field.placeholder}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="space-y-2.5">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Environment</Label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                            <select
                                                className="flex h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 py-2 text-sm focus:border-primary/20 transition-all outline-none font-medium text-gray-900 dark:text-white appearance-none"
                                                value={(config as any)[gateway.envKey]}
                                                onChange={(e) => setConfig({ ...config, [gateway.envKey as string]: e.target.value })}
                                            >
                                                {gateway.envs.map(env => (
                                                    <option key={env} value={env} className="bg-gray-900">{env === 'PROD' || env === 'LIVE' ? 'Production' : 'Sandbox (UAT)'}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                        <Terminal className="h-3.5 w-3.5" />
                                    </div>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Status: Waiting for first transaction</p>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                ))}
            </div>

            <div className="p-8 glass-card border-white/10 bg-primary/5 rounded-3xl flex flex-col items-center justify-center text-center">
                <ShieldCheck className="h-12 w-12 text-primary opacity-50 mb-4" />
                <h3 className="text-xl font-bold">Encrypted Storage</h3>
                <p className="text-sm text-muted-foreground max-w-md mt-2">Your API keys are stored with AES-256 encryption. We never initiate transfers without authenticated requests from your validated domain.</p>
            </div>
        </div>
    );
}
