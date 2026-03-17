'use client';

import { useEffect, useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Home,
  Calendar,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TenantProfile {
  name: string;
  email: string;
  phone: string | null;
  currentBuildingId: string | null;
  currentBuildingName: string | null;
  currentRoomId: string | null;
  currentRoomNumber: string | null;
  currentRent: number | null;
  leaseStartDate: string | null;
  leaseEndDate: string | null;
  leaseStatus: string | null;
}

export default function TenantProfilePage() {
  const [profile, setProfile] = useState<TenantProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const token = localStorage.getItem('firebase-token');
      const response = await fetch('/api/tenant/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 border-green-200',
    notice_period: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ended: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Your account and lease information</p>
        </div>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{profile?.name || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile?.email || 'Not set'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{profile?.phone || 'Not set'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Home className="h-5 w-5" />
              Current Stay
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile?.currentBuildingName ? (
              <>
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Building</p>
                    <p className="font-medium">{profile.currentBuildingName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Room</p>
                    <p className="font-medium">{profile.currentRoomNumber || 'Not assigned'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Rent</p>
                    <p className="font-medium">₹{profile.currentRent?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">No active lease</p>
            )}
          </CardContent>
        </Card>

        {profile?.leaseStartDate && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Lease Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {profile.leaseStartDate 
                      ? new Date(profile.leaseStartDate).toLocaleDateString() 
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">
                    {profile.leaseEndDate 
                      ? new Date(profile.leaseEndDate).toLocaleDateString() 
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {profile.leaseStatus && (
                    <Badge className={statusColors[profile.leaseStatus]}>
                      {profile.leaseStatus.replace('_', ' ')}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
