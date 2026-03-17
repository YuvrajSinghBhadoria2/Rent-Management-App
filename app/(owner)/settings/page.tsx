'use client';

import { useEffect, useState } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  CreditCard, 
  Shield,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment Gateways
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>
              <Button onClick={saveProfile} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications for Bills</p>
                  <p className="text-sm text-muted-foreground">Get notified when bills are generated</p>
                </div>
                <Switch 
                  checked={notifications.emailBills}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailBills: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications for Payments</p>
                  <p className="text-sm text-muted-foreground">Get notified when tenants make payments</p>
                </div>
                <Switch 
                  checked={notifications.emailPayments}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailPayments: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications for Complaints</p>
                  <p className="text-sm text-muted-foreground">Get notified when tenants raise complaints</p>
                </div>
                <Switch 
                  checked={notifications.emailComplaints}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailComplaints: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Reminders</p>
                  <p className="text-sm text-muted-foreground">Daily reminders for pending tasks</p>
                </div>
                <Switch 
                  checked={notifications.pushReminders}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, pushReminders: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateways</CardTitle>
              <CardDescription>Enable or disable payment methods for tenants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Cashfree</p>
                  <p className="text-sm text-muted-foreground">1.75% fee - Lowest fee</p>
                </div>
                <Switch 
                  checked={payments.cashfreeEnabled}
                  onCheckedChange={(checked) => setPayments({ ...payments, cashfreeEnabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">PhonePe</p>
                  <p className="text-sm text-muted-foreground">1.99% fee - Best for UPI</p>
                </div>
                <Switch 
                  checked={payments.phonepeEnabled}
                  onCheckedChange={(checked) => setPayments({ ...payments, phonepeEnabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Razorpay</p>
                  <p className="text-sm text-muted-foreground">2% fee - Best developer experience</p>
                </div>
                <Switch 
                  checked={payments.razorpayEnabled}
                  onCheckedChange={(checked) => setPayments({ ...payments, razorpayEnabled: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
