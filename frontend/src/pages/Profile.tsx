import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, ShieldCheck, Edit2, Save, X, CheckCircle2 } from 'lucide-react';
import client, { AUTH_URL } from '@/api/client';

export default function Profile() {
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    date_of_birth: '',
    gender: '',
    residential_address: '',
    permanent_address: '',
    nationality: '',
    mobile_number: '',
    contact_email: '',
    national_id_number: '',
    pan_tax_id: ''
  });

  // Seed form data from context
  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name !== 'Pending' ? user.full_name : '',
        date_of_birth: user.date_of_birth !== 'Not Provided' ? user.date_of_birth : '',
        gender: user.gender !== 'Not Provided' ? user.gender : '',
        residential_address: user.residential_address !== 'Not Provided' ? user.residential_address : '',
        permanent_address: user.permanent_address !== 'Not Provided' ? user.permanent_address : '',
        nationality: user.nationality !== 'Not Provided' ? user.nationality : '',
        mobile_number: user.mobile_number || '',
        contact_email: user.contact_email || '',
        national_id_number: user.national_id_number || '',
        pan_tax_id: user.pan_tax_id || ''
      });
    }
  }, [user]);

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Client-side validation for mandatory fields
    const requiredFields = ['full_name', 'date_of_birth', 'gender', 'residential_address', 'permanent_address', 'nationality'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setError(`Please fill out all mandatory fields.`);
        setLoading(false);
        return;
      }
    }

    const payload = { ...formData };
    if (!payload.mobile_number) delete (payload as any).mobile_number;
    if (!payload.contact_email) delete (payload as any).contact_email;
    if (!payload.national_id_number) delete (payload as any).national_id_number;
    if (!payload.pan_tax_id) delete (payload as any).pan_tax_id;

    try {
      await client.put(`${AUTH_URL}/auth/profile`, payload);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      // Wait briefly before reloading so user sees success toast
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      let errorMessage = 'Failed to update profile. Please try again.';
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail[0].msg;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and account settings.</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Edit2 className="h-4 w-4" /> Edit Profile
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setIsEditing(false)} className="gap-2">
            <X className="h-4 w-4" /> Cancel
          </Button>
        )}
      </div>

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-5 w-5" />
          <p>{success}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/15 text-destructive rounded-lg border border-destructive/20">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Account Details (Always Read Only) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground font-medium">Username</span>
                <p className="font-medium">{user.username}</p>
              </div>

              <div className="space-y-1">
                <span className="text-sm text-muted-foreground font-medium">Primary Email</span>
                <p className="font-medium">{user.email || 'N/A'}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground font-medium">Account ID</span>
                <p className="font-mono text-xs bg-muted p-2 rounded-md truncate">{user.id}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground font-medium">Status</span>
                <p>
                  {user.is_active ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">Active</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700">Inactive</span>
                  )}
                </p>
              </div>
              
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground font-medium">System Role</span>
                <p>
                  {user.admin ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-primary/20 text-primary">
                      <ShieldCheck className="w-3 h-3" /> Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-secondary text-secondary-foreground">
                      User
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Personal Information Form/View */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Personal Information</CardTitle>
              {isEditing && <CardDescription>Update your personal details below.</CardDescription>}
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name *</Label>
                      <Input id="full_name" name="full_name" value={formData.full_name} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date_of_birth">Date of Birth *</Label>
                      <Input id="date_of_birth" name="date_of_birth" type="date" value={formData.date_of_birth} onChange={handleChange} required />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender *</Label>
                      <select 
                        id="gender" 
                        name="gender" 
                        value={formData.gender} 
                        onChange={handleChange} 
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nationality *</Label>
                      <Input id="nationality" name="nationality" value={formData.nationality} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-medium">Contact & Address</h3>
                    <div className="space-y-2">
                      <Label htmlFor="residential_address">Residential Address *</Label>
                      <Input id="residential_address" name="residential_address" value={formData.residential_address} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="permanent_address">Permanent Address *</Label>
                      <Input id="permanent_address" name="permanent_address" value={formData.permanent_address} onChange={handleChange} required />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="mobile_number">Mobile Number</Label>
                        <Input id="mobile_number" name="mobile_number" type="tel" value={formData.mobile_number} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact_email">Secondary Email</Label>
                        <Input id="contact_email" name="contact_email" type="email" value={formData.contact_email} onChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-medium">Identity Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="national_id_number">National ID Number</Label>
                        <Input id="national_id_number" name="national_id_number" value={formData.national_id_number} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pan_tax_id">Tax ID / PAN</Label>
                        <Input id="pan_tax_id" name="pan_tax_id" value={formData.pan_tax_id} onChange={handleChange} />
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground font-medium">Full Name</span>
                      <p className="font-medium">{user.full_name !== 'Pending' ? user.full_name : 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground font-medium">Date of Birth</span>
                      <p className="font-medium">{user.date_of_birth !== 'Not Provided' ? user.date_of_birth : 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground font-medium">Gender</span>
                      <p className="font-medium">{user.gender !== 'Not Provided' ? user.gender : 'N/A'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground font-medium">Nationality</span>
                      <p className="font-medium">{user.nationality !== 'Not Provided' ? user.nationality : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-medium text-muted-foreground">Contact & Address</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground font-medium">Mobile Number</span>
                        <p className="font-medium">{user.mobile_number || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground font-medium">Secondary Email</span>
                        <p className="font-medium">{user.contact_email || 'N/A'}</p>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <span className="text-sm text-muted-foreground font-medium">Residential Address</span>
                        <p className="font-medium">{user.residential_address !== 'Not Provided' ? user.residential_address : 'N/A'}</p>
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <span className="text-sm text-muted-foreground font-medium">Permanent Address</span>
                        <p className="font-medium">{user.permanent_address !== 'Not Provided' ? user.permanent_address : 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-medium text-muted-foreground">Identifiers</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground font-medium">National ID</span>
                        <p className="font-medium">{user.national_id_number || 'N/A'}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground font-medium">Tax ID / PAN</span>
                        <p className="font-medium">{user.pan_tax_id || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            
            {isEditing && (
              <div className="px-6 py-4 bg-muted/30 border-t flex justify-end">
                <Button type="submit" form="profile-form" disabled={loading} className="gap-2">
                  <Save className="h-4 w-4" />
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}
