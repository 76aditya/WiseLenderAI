import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import client, { APP_URL } from '@/api/client';

export default function NewApplication() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<any>({
    title: 'My Loan Application',
    loan_amnt: 10000,
    annual_inc: 50000,
    installment: 320,
    dti: 0,
    tot_cur_bal: 18000,
    avg_cur_bal: 4500,
    open_acc: 8,
    total_acc: 20,
    emp_length: 5,
    revol_util: 35,
    bc_util: 40,
    home_ownership: 'RENT',
    purpose: 'debt_consolidation',
    verification_status: 'Verified',
    
    FLAG_MOBIL: 1,
    FLAG_PHONE: 1,
    FLAG_WORK_PHONE: 1,
    FLAG_CONT_MOBILE: 1,
    FLAG_EMAIL: 1,
    DAYS_EMPLOYED: 2400, // UX friendly absolute value
    FLAG_OWN_REALTY: 'Y',
    NAME_HOUSING_TYPE: 'House / apartment',
    CNT_CHILDREN: 1,
    CNT_FAM_MEMBERS: 3,
    NAME_FAMILY_STATUS: 'Married',
    DAYS_REGISTRATION: 4500,
    DAYS_ID_PUBLISH: 2200,
    DAYS_LAST_PHONE_CHANGE: 350,
    REG_REGION_NOT_WORK_REGION: 0,
    REG_CITY_NOT_WORK_CITY: 0,
    LIVE_CITY_NOT_WORK_CITY: 0,
    NAME_EDUCATION_TYPE: 'Higher education',
    NAME_INCOME_TYPE: 'Working',
    OCCUPATION_TYPE: 'Laborers',
    ORGANIZATION_TYPE: 'Business Entity Type 3',
    REGION_RATING_CLIENT: 2
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchApp = async () => {
        try {
          const res = await client.get(`${APP_URL}/applications/${id}`);
          const fetchedApp = res.data;
          
          if (fetchedApp.status !== 'DRAFT') {
            navigate('/dashboard'); // Cannot edit non-drafts
            return;
          }

          const q = fetchedApp.questionnaire || {};
          // Convert negative days back to positive for the UI form
          setFormData({
            title: fetchedApp.title || '',
            ...q,
            DAYS_EMPLOYED: Math.abs(q.DAYS_EMPLOYED || 0),
            DAYS_REGISTRATION: Math.abs(q.DAYS_REGISTRATION || 0),
            DAYS_ID_PUBLISH: Math.abs(q.DAYS_ID_PUBLISH || 0),
            DAYS_LAST_PHONE_CHANGE: Math.abs(q.DAYS_LAST_PHONE_CHANGE || 0),
          });
        } catch (err) {
          setError('Failed to load application data');
        } finally {
          setFetching(false);
        }
      };
      fetchApp();
    }
  }, [id, isEditMode, navigate]);

  // Auto-calculate DTI
  useEffect(() => {
    if (formData.annual_inc > 0 && formData.installment > 0) {
      const monthlyIncome = formData.annual_inc / 12;
      const dti = (formData.installment / monthlyIncome) * 100;
      setFormData((prev: any) => ({ ...prev, dti: Number(dti.toFixed(2)) }));
    } else {
      setFormData((prev: any) => ({ ...prev, dti: 0 }));
    }
  }, [formData.annual_inc, formData.installment]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let parsedValue: string | number = value;
    if (type === 'number') {
      parsedValue = value === '' ? '' : Number(value);
    }
    setFormData((prev: any) => ({ ...prev, [name]: parsedValue }));
  };

  const handleCheckedChange = (name: string, checked: boolean) => {
    if (name === 'FLAG_OWN_REALTY') {
       setFormData((prev: any) => ({ ...prev, [name]: checked ? 'Y' : 'N' }));
    } else {
       setFormData((prev: any) => ({ ...prev, [name]: checked ? 1 : 0 }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Convert absolute days back to negative for Home Credit logic
    const { title, ...questionnaire } = formData;
    const payload = {
      title,
      ...questionnaire,
      DAYS_EMPLOYED: -Math.abs(formData.DAYS_EMPLOYED),
      DAYS_REGISTRATION: -Math.abs(formData.DAYS_REGISTRATION),
      DAYS_ID_PUBLISH: -Math.abs(formData.DAYS_ID_PUBLISH),
      DAYS_LAST_PHONE_CHANGE: -Math.abs(formData.DAYS_LAST_PHONE_CHANGE),
    };
    
    try {
      if (isEditMode) {
        await client.put(`${APP_URL}/applications/${id}`, payload);
        navigate(`/applications/${id}`);
      } else {
        const response = await client.post(`${APP_URL}/applications/`, payload);
        navigate(`/applications/${response.data.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || `Failed to ${isEditMode ? 'update' : 'create'} application`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="flex justify-center p-12">Loading application data...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 mb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{isEditMode ? 'Edit Loan Application' : 'New Loan Application'}</h1>
        <p className="text-muted-foreground">{isEditMode ? 'Update your draft application.' : 'Complete the following sections to submit your profile.'}</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-w-sm">
                <Label>Application Title</Label>
                <Input name="title" value={formData.title} onChange={handleChange} required />
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="financial" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="personal">Personal & Demographic</TabsTrigger>
              <TabsTrigger value="digital">Digital Trust & Contact</TabsTrigger>
            </TabsList>
            
            <TabsContent value="financial" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Profile</CardTitle>
                  <CardDescription>Income, requested loan details, and credit history.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Loan Amount ($)</Label>
                    <Input type="number" name="loan_amnt" value={formData.loan_amnt} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Annual Income ($)</Label>
                    <Input type="number" name="annual_inc" value={formData.annual_inc} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Installment</Label>
                    <Input type="number" name="installment" value={formData.installment} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex justify-between">
                      Debt-to-Income Ratio (DTI) 
                      <span className="text-xs text-muted-foreground">(Auto-calculated)</span>
                    </Label>
                    <Input type="number" step="0.1" name="dti" value={formData.dti} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Current Balance</Label>
                    <Input type="number" name="tot_cur_bal" value={formData.tot_cur_bal} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Average Current Balance</Label>
                    <Input type="number" name="avg_cur_bal" value={formData.avg_cur_bal} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Open Accounts</Label>
                    <Input type="number" name="open_acc" value={formData.open_acc} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Accounts</Label>
                    <Input type="number" name="total_acc" value={formData.total_acc} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Revolving Utilization (%)</Label>
                    <Input type="number" step="0.1" name="revol_util" value={formData.revol_util} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Bankcard Utilization (%)</Label>
                    <Input type="number" step="0.1" name="bc_util" value={formData.bc_util} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Loan Purpose</Label>
                    <select name="purpose" value={formData.purpose} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="debt_consolidation">Debt Consolidation</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="home_improvement">Home Improvement</option>
                      <option value="house">House</option>
                      <option value="car">Car</option>
                      <option value="small_business">Small Business</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Income Verification Status</Label>
                    <select name="verification_status" value={formData.verification_status} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="Verified">Verified</option>
                      <option value="Source Verified">Source Verified</option>
                      <option value="Not Verified">Not Verified</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="personal" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal & Demographic Profile</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Employment Duration (Days)</Label>
                    <Input type="number" name="DAYS_EMPLOYED" value={formData.DAYS_EMPLOYED} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Employment Length (Years)</Label>
                    <Input type="number" name="emp_length" value={formData.emp_length} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Housing Ownership</Label>
                    <select name="home_ownership" value={formData.home_ownership} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="RENT">Rent</option>
                      <option value="OWN">Own</option>
                      <option value="MORTGAGE">Mortgage</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Housing Type</Label>
                    <select name="NAME_HOUSING_TYPE" value={formData.NAME_HOUSING_TYPE} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="House / apartment">House / apartment</option>
                      <option value="With parents">With parents</option>
                      <option value="Municipal apartment">Municipal apartment</option>
                      <option value="Rented apartment">Rented apartment</option>
                      <option value="Office apartment">Office apartment</option>
                      <option value="Co-op apartment">Co-op apartment</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Children</Label>
                    <Input type="number" name="CNT_CHILDREN" value={formData.CNT_CHILDREN} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Family Members</Label>
                    <Input type="number" name="CNT_FAM_MEMBERS" value={formData.CNT_FAM_MEMBERS} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Marital Status</Label>
                    <select name="NAME_FAMILY_STATUS" value={formData.NAME_FAMILY_STATUS} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="Married">Married</option>
                      <option value="Single / not married">Single / not married</option>
                      <option value="Civil marriage">Civil marriage</option>
                      <option value="Separated">Separated</option>
                      <option value="Widow">Widow</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Education</Label>
                    <select name="NAME_EDUCATION_TYPE" value={formData.NAME_EDUCATION_TYPE} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="Higher education">Higher education</option>
                      <option value="Secondary / secondary special">Secondary / secondary special</option>
                      <option value="Incomplete higher">Incomplete higher</option>
                      <option value="Lower secondary">Lower secondary</option>
                      <option value="Academic degree">Academic degree</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Income Type</Label>
                    <select name="NAME_INCOME_TYPE" value={formData.NAME_INCOME_TYPE} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="Working">Working</option>
                      <option value="Commercial associate">Commercial associate</option>
                      <option value="Pensioner">Pensioner</option>
                      <option value="State servant">State servant</option>
                      <option value="Student">Student</option>
                      <option value="Unemployed">Unemployed</option>
                      <option value="Businessman">Businessman</option>
                      <option value="Maternity leave">Maternity leave</option>  
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Occupation</Label>
                    <select name="OCCUPATION_TYPE" value={formData.OCCUPATION_TYPE} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="Laborers">Laborers</option>
                      <option value="Core staff">Core staff</option>
                      <option value="Managers">Managers</option>
                      <option value="Sales staff">Sales staff</option>
                      <option value="Drivers">Drivers</option>
                      <option value="High skill tech staff">High skill tech staff</option>
                      <option value="Accountants">Accountants</option>
                      <option value="Medicine staff">Medicine staff</option>
                      <option value="Security staff">Security staff</option>
                      <option value="Cooking staff">Cooking staff</option>
                      <option value="Cleaning staff">Cleaning staff</option>
                      <option value="Secretaries">Secretaries</option>
                      <option value="Private service staff">Private service staff</option>
                      <option value="HR staff">HR staff</option>
                      <option value="IT staff">IT staff</option>
                      <option value="Realty agents">Realty agents</option>
                      <option value="Low-skill Laborers">Low-skill Laborers</option>
                      <option value="Waiters/barmen staff">Waiters/barmen staff</option>
                      <option value="High skill managers">High skill managers</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Organization Type</Label>
                    <select name="ORGANIZATION_TYPE" value={formData.ORGANIZATION_TYPE} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="Business Entity Type 1">Business Entity Type 1</option>
                      <option value="Business Entity Type 2">Business Entity Type 2</option>
                      <option value="Business Entity Type 3">Business Entity Type 3</option>
                      <option value="Self-employed">Self-employed</option>
                      <option value="Government">Government</option>
                      <option value="School">School</option>
                      <option value="University">University</option>
                      <option value="Bank">Bank</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Medicine">Medicine</option>
                      <option value="Trade">Trade</option>
                      <option value="Industry">Industry</option>
                      <option value="Construction">Construction</option>
                      <option value="Transport">Transport</option>
                      <option value="Agriculture">Agriculture</option>
                      <option value="Hotel">Hotel</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Electricity">Electricity</option>
                      <option value="Telecom">Telecom</option>
                      <option value="Police">Police</option>
                      <option value="Military">Military</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Postal">Postal</option>
                      <option value="Security">Security</option>
                      <option value="Advertising">Advertising</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Culture">Culture</option>
                      <option value="Religion">Religion</option>
                      <option value="Housing">Housing</option>
                      <option value="Mobile">Mobile</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Region Rating (1-3)</Label>
                    <Input type="number" name="REGION_RATING_CLIENT" value={formData.REGION_RATING_CLIENT} onChange={handleChange} required />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="digital" className="mt-6 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Digital Trust & Connectivity</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 border p-4 rounded-lg bg-muted/20">
                    <h3 className="font-semibold text-sm">Contact Availability (Yes/No)</h3>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox id="FLAG_MOBIL" checked={formData.FLAG_MOBIL === 1} onCheckedChange={(c) => handleCheckedChange('FLAG_MOBIL', c as boolean)} />
                      <Label htmlFor="FLAG_MOBIL">Has Mobile Phone</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="FLAG_PHONE" checked={formData.FLAG_PHONE === 1} onCheckedChange={(c) => handleCheckedChange('FLAG_PHONE', c as boolean)} />
                      <Label htmlFor="FLAG_PHONE">Has Home Phone</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="FLAG_WORK_PHONE" checked={formData.FLAG_WORK_PHONE === 1} onCheckedChange={(c) => handleCheckedChange('FLAG_WORK_PHONE', c as boolean)} />
                      <Label htmlFor="FLAG_WORK_PHONE">Has Work Phone</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="FLAG_CONT_MOBILE" checked={formData.FLAG_CONT_MOBILE === 1} onCheckedChange={(c) => handleCheckedChange('FLAG_CONT_MOBILE', c as boolean)} />
                      <Label htmlFor="FLAG_CONT_MOBILE">Is Mobile Reachable</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="FLAG_EMAIL" checked={formData.FLAG_EMAIL === 1} onCheckedChange={(c) => handleCheckedChange('FLAG_EMAIL', c as boolean)} />
                      <Label htmlFor="FLAG_EMAIL">Has Email Address</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="FLAG_OWN_REALTY" checked={formData.FLAG_OWN_REALTY === 'Y'} onCheckedChange={(c) => handleCheckedChange('FLAG_OWN_REALTY', c as boolean)} />
                      <Label htmlFor="FLAG_OWN_REALTY">Owns Real Estate?</Label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Days Since Registration</Label>
                      <Input type="number" name="DAYS_REGISTRATION" value={formData.DAYS_REGISTRATION} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Days Since ID Published</Label>
                      <Input type="number" name="DAYS_ID_PUBLISH" value={formData.DAYS_ID_PUBLISH} onChange={handleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Days Since Last Phone Change</Label>
                      <Input type="number" name="DAYS_LAST_PHONE_CHANGE" value={formData.DAYS_LAST_PHONE_CHANGE} onChange={handleChange} required />
                    </div>
                    
                    <div className="space-y-4 border p-4 rounded-lg bg-muted/20 mt-4">
                       <h3 className="font-semibold text-sm">Location Mismatches</h3>
                       <div className="flex items-center space-x-2">
                        <Checkbox id="REG_REGION_NOT_WORK_REGION" checked={formData.REG_REGION_NOT_WORK_REGION === 1} onCheckedChange={(c) => handleCheckedChange('REG_REGION_NOT_WORK_REGION', c as boolean)} />
                        <Label htmlFor="REG_REGION_NOT_WORK_REGION">Registration Region differs from Work Region</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="REG_CITY_NOT_WORK_CITY" checked={formData.REG_CITY_NOT_WORK_CITY === 1} onCheckedChange={(c) => handleCheckedChange('REG_CITY_NOT_WORK_CITY', c as boolean)} />
                        <Label htmlFor="REG_CITY_NOT_WORK_CITY">Registration City differs from Work City</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="LIVE_CITY_NOT_WORK_CITY" checked={formData.LIVE_CITY_NOT_WORK_CITY === 1} onCheckedChange={(c) => handleCheckedChange('LIVE_CITY_NOT_WORK_CITY', c as boolean)} />
                        <Label htmlFor="LIVE_CITY_NOT_WORK_CITY">Live City differs from Work City</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {error && <div className="p-3 bg-destructive/15 text-destructive text-sm rounded-md border border-destructive/20">{error}</div>}
          
          <div className="flex justify-end gap-4 sticky bottom-4 bg-background/80 p-4 border rounded-xl shadow-lg backdrop-blur">
            <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>Cancel</Button>
            <Button type="submit" disabled={loading} size="lg">
              {loading ? 'Saving...' : isEditMode ? 'Update Application' : 'Save Application'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
