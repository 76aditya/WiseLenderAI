import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User as UserIcon, Mail, Phone, MapPin, Building, Flag, Calendar, Info, Hash } from 'lucide-react';
import client, { ADMIN_URL } from '@/api/client';

export default function AdminUserDetails() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await client.get(`${ADMIN_URL}/admin/users/${id}`);
        setUser(res.data);
      } catch (err: any) {
        console.error('Failed to fetch user', err);
        setError('Failed to load user details.');
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading user details...</div>;
  }

  if (error || !user) {
    return <div className="p-8 text-center text-destructive">{error || 'User not found.'}</div>;
  }

  const InfoItem = ({ icon: Icon, label, value, className = '' }: any) => (
    <div className={`flex flex-col gap-1 p-4 rounded-lg bg-muted/30 border border-muted/50 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <div className="font-medium text-foreground">{value || 'N/A'}</div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto mb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/admin/users">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.full_name !== 'Pending' ? user.full_name : 'Unnamed User'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${user.admin ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                {user.admin ? 'Admin' : 'User'}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${user.user_status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {user.user_status}
              </span>
              <span className="text-xs text-muted-foreground ml-2 font-mono">{user.id}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Main Column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg flex items-center gap-2"><UserIcon className="h-5 w-5 text-primary" /> Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem icon={UserIcon} label="Username" value={user.username} />
              <InfoItem icon={UserIcon} label="Full Name" value={user.full_name} />
              <InfoItem icon={Calendar} label="Date of Birth" value={user.date_of_birth} />
              <InfoItem icon={Info} label="Gender" value={user.gender} />
              <InfoItem icon={Flag} label="Nationality" value={user.nationality} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Contact & Address</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem icon={Mail} label="Primary Email" value={user.email || 'N/A'} />
              <InfoItem icon={Mail} label="Secondary Email" value={user.contact_email} />
              <InfoItem icon={Phone} label="Mobile Number" value={user.mobile_number} />
              <div className="hidden sm:block"></div>
              <InfoItem icon={MapPin} label="Residential Address" value={user.residential_address} className="sm:col-span-2" />
              <InfoItem icon={Building} label="Permanent Address" value={user.permanent_address} className="sm:col-span-2" />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg flex items-center gap-2"><Hash className="h-5 w-5 text-primary" /> Identifiers</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <InfoItem icon={Hash} label="National ID" value={user.national_id_number} />
              <InfoItem icon={Hash} label="Tax ID / PAN" value={user.pan_tax_id} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-lg flex items-center gap-2"><Info className="h-5 w-5 text-primary" /> Account Meta</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <InfoItem icon={Calendar} label="Registered On" value={new Date(user.created_at).toLocaleString()} />
              <InfoItem icon={Calendar} label="Last Updated" value={new Date(user.updated_at).toLocaleString()} />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
