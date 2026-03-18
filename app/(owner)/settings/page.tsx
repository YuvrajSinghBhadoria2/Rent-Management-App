'use client';

import { useEffect, useState } from 'react';
import {
  Settings,
  User,
  Bell,
  CreditCard,
  Shield,
  Save,
  Loader2,
  Mail,
  Phone,
  Lock,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface OwnerProfile {
  name: string;
  email: string;
  phone: string | null;
}

interface PaymentSettings {
  cashfreeEnabled: boolean;
  phonepeEnabled: boolean;
  razorpayEnabled: boolean;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<OwnerProfile>({ name: '', email: '', phone: '' });
  const [notifications, setNotifications] = useState({
    emailBills: true,
    emailPayments: true,
    emailComplaints: true,
    pushReminders: true,
  });
  const [payments, setPayments] = useState<PaymentSettings>({
    cashfreeEnabled: true,
    phonepeEnabled: true,
    razorpayEnabled: true,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const token = localStorage.getItem('firebase-token');
      const response = await fetch('/api/owner/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setProfile(data.data.profile);
        setNotifications(data.data.notifications);
        setPayments(data.data.payments);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const token = localStorage.getItem('firebase-token');
      const response = await fetch('/api/owner/settings/profile', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('Profile updated');
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Preferences</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 md:px-8 py-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-white/60 bg-clip-text text-transparent">
          Account Settings
        </h1>
        <p className="text-muted-foreground mt-2 font-medium">Control your experience and manage business integrations.</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="glass-card p-1 gap-1 border-white/10 w-fit h-auto flex-wrap">
          <TabsTrigger value="profile" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg font-bold text-[10px] uppercase tracking-widest py-2 px-4">
            <User className="h-3.5 w-3.5 mr-2" />
            Profile Info
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg font-bold text-[10px] uppercase tracking-widest py-2 px-4">
            <Bell className="h-3.5 w-3.5 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg font-bold text-[10px] uppercase tracking-widest py-2 px-4">
            <CreditCard className="h-3.5 w-3.5 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-lg font-bold text-[10px] uppercase tracking-widest py-2 px-4 opacity-50">
            <Shield className="h-3.5 w-3.5 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Card className="glass-card border-white/10 shadow-2xl overflow-hidden">
                <CardHeader className="border-b border-white/5 pb-6">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <User className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-xl font-bold font-heading">Personal Details</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2.5">
                      <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Legal Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          className="pl-10 h-11 glass-card border-white/10 dark:bg-white/5 focus:border-primary/20 transition-all font-medium"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          className="pl-10 h-11 glass-card border-white/10 dark:bg-white/5 focus:border-primary/20 transition-all font-medium"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2.5 sm:col-span-2">
                      <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Registered Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          className="pl-10 h-11 glass-card border-white/10 dark:bg-white/5 focus:border-primary/20 transition-all font-medium"
                          value={profile.phone || ''}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          placeholder="+91 00000 00000"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <Button onClick={saveProfile} disabled={saving} className="shadow-lg shadow-primary/20 h-11 px-8">
                      {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Update Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="glass-card border-white/10 bg-primary/5 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Verified Owner</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Level 2 KYC Done</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Secure Access</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">2FA Not Enabled</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10 hover:bg-white/5 transition-all cursor-pointer group">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-500">
                      <ExternalLink className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest opacity-60">Audit Logs</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <Card className="glass-card border-white/10 shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-white/5 pb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">System Alerts</CardTitle>
                  <CardDescription className="text-xs">Configure how you receive critical property updates.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-8">
              {[
                {
                  id: 'emailBills',
                  title: 'Billing Automation',
                  desc: 'Get notified as soon as monthly bills are compiled.',
                  icon: CreditCard,
                  checked: notifications.emailBills
                },
                {
                  id: 'emailPayments',
                  title: 'Collection Reports',
                  desc: 'Real-time alerts when a resident clears their dues.',
                  icon: TrendingUp,
                  checked: notifications.emailPayments
                },
                {
                  id: 'emailComplaints',
                  title: 'Issue Escalations',
                  desc: 'Stay on top of resident complaints and maintenance needs.',
                  icon: Settings,
                  checked: notifications.emailComplaints
                },
                {
                  id: 'pushReminders',
                  title: 'Daily Digest',
                  desc: 'Morning summary of pending tasks and collections.',
                  icon: Smartphone,
                  checked: notifications.pushReminders
                },
              ].map((notif) => (
                <div key={notif.id} className="flex items-center justify-between group p-2 rounded-2xl hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 rounded-lg bg-white/5 group-hover:bg-primary/10 transition-colors">
                      <notif.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{notif.title}</p>
                      <p className="text-xs text-muted-foreground max-w-md mt-0.5">{notif.desc}</p>
                    </div>
                  </div>
                  <Switch
                    className="data-[state=checked]:bg-primary"
                    checked={notif.checked}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, [notif.id]: checked })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <Card className="glass-card border-white/10 shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-white/5 pb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Enabled Gateways</CardTitle>
                  <CardDescription className="text-xs">Manage online collection methods for your tenants.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              {[
                {
                  id: 'cashfreeEnabled',
                  title: 'Cashfree Payments',
                  desc: 'Direct bank transfers with ~1.75% TDR. Perfect for bulk rent.',
                  fee: '1.75%',
                  checked: payments.cashfreeEnabled
                },
                {
                  id: 'phonepeEnabled',
                  title: 'PhonePe PG',
                  desc: 'High UPI success rate with ~1.99% TDR. Native app experience.',
                  fee: '1.99%',
                  checked: payments.phonepeEnabled
                },
                {
                  id: 'razorpayEnabled',
                  title: 'Razorpay Standard',
                  desc: 'Universal support including Intnl cards. ~2.0% Flat fee.',
                  fee: '2.00%',
                  checked: payments.razorpayEnabled
                },
              ].map((gateway) => (
                <div key={gateway.id} className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2.5 rounded-xl bg-white/10 group-checked:bg-primary/20 transition-all">
                      <div className="w-6 h-6 rounded bg-gray-400 group-hover:bg-primary transition-colors" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900 dark:text-white">{gateway.title}</p>
                        <Badge variant="outline" className="text-[9px] font-bold tracking-widest bg-white/5 border-white/10 px-1.5 py-0">{gateway.fee} FEE</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground max-w-md mt-1 font-medium">{gateway.desc}</p>
                    </div>
                  </div>
                  <Switch
                    className="data-[state=checked]:bg-primary"
                    checked={gateway.checked}
                    onCheckedChange={(checked) => setPayments({ ...payments, [gateway.id]: checked })}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
          <div className="h-64 flex flex-col items-center justify-center glass-card border-white/10 opacity-30 select-none">
            <Lock className="h-12 w-12 mb-4" />
            <p className="text-xs font-bold uppercase tracking-widest italic">Enhanced Security Coming Soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
