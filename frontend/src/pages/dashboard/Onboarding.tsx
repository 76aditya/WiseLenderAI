import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import client, { AUTH_URL } from '@/api/client';

export default function Onboarding() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Client-side validation for mandatory fields
    const requiredFields = ['full_name', 'date_of_birth', 'gender', 'residential_address', 'permanent_address', 'nationality', 'national_id_number'];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setError(`Please fill out all mandatory fields.`);
        setLoading(false);
        return;
      }
    }

    const payload = { ...formData };
    // Remove empty optional fields so they don't fail backend validation
    if (!payload.mobile_number) delete (payload as any).mobile_number;
    if (!payload.contact_email) delete (payload as any).contact_email;
    if (!payload.pan_tax_id) delete (payload as any).pan_tax_id;

    try {
      await client.put(`${AUTH_URL}/auth/profile`, payload);
      // Reload the page to force the AuthContext to fetch the updated user with 'Active' status
      window.location.href = '/dashboard';
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
    <div className="max-w-2xl mx-auto space-y-6 mb-20 mt-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Complete Your Profile</h1>
        <p className="text-muted-foreground mt-2">Before you can start applying for loans, we need a few more details to set up your account securely.</p>
      </div>

      <Card>  
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>All fields marked with an asterisk (*) are mandatory.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
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
                  <Label htmlFor="mobile_number">Mobile Number (Optional)</Label>
                  <Input id="mobile_number" name="mobile_number" type="tel" value={formData.mobile_number} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Secondary Email (Optional)</Label>
                  <Input id="contact_email" name="contact_email" type="email" value={formData.contact_email} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium">Identity Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="national_id_number">Aadhaar Card ID *</Label>
                  <Input id="national_id_number" name="national_id_number" value={formData.national_id_number} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan_tax_id">Tax ID / PAN (Optional)</Label>
                  <Input id="pan_tax_id" name="pan_tax_id" value={formData.pan_tax_id} onChange={handleChange} />
                </div>
              </div>
            </div>

            {error && <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md border border-destructive/20">{error}</div>}
            
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading} className="w-full md:w-auto">
                {loading ? 'Saving Profile...' : 'Complete Profile & Continue'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
