import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import client, { ADMIN_URL } from '@/api/client';
import { ArrowLeft, CheckCircle, XCircle, BrainCircuit, CreditCard, Activity, Lock, ShieldAlert } from 'lucide-react';

export default function AdminApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const res = await client.get(`${ADMIN_URL}/admin/applications/${id}`);
      setApp(res.data);
    } catch (err: any) {
      setError('Failed to fetch application details');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (decision: 'APPROVED' | 'REJECTED') => {
    setActionLoading(true);
    setError('');
    try {
      await client.patch(`${ADMIN_URL}/admin/applications/${id}/review`, {
        final_review: decision
      });
      await fetchApplication();
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError('Conflict: This application has already been reviewed.');
      } else {
        setError(err.response?.data?.detail || 'Failed to submit review');
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12">Loading...</div>;
  if (!app) return <div className="text-center p-12 text-destructive">Application not found</div>;

  const renderShapCard = (title: string, icon: React.ReactNode, shapData: any) => {
    if (!shapData) return null;
    return (
      <AccordionItem value={title}>
        <AccordionTrigger className="text-sm font-semibold hover:no-underline">
          <div className="flex items-center gap-2">{icon} {title} Insights</div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="grid grid-cols-1 gap-2 bg-muted/30 p-3 rounded-md">
            {Object.entries(shapData).map(([key, value]: any) => (
              <div key={key} className="flex justify-between items-center text-xs border-b border-muted/50 pb-1 last:border-0">
                <span className="text-muted-foreground">{key}</span>
                <span className={`font-mono ${value > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {value > 0 ? '+' : ''}{value.toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/applications')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review: {app.title || 'Loan Application'}</h1>
          <p className="text-muted-foreground">ID: {app.id}</p>
        </div>
      </div>

      {error && <div className="p-3 bg-destructive/15 text-destructive rounded-md border border-destructive/20">{error}</div>}

      {app.prediction && (
        <Card className="border-2 border-primary/20 shadow-md mb-8 overflow-hidden">
          <div className="bg-primary/5 p-4 border-b flex items-center justify-between">
             <div className="flex items-center gap-2">
              <BrainCircuit className="h-6 w-6 text-primary" />
              <h2 className="font-bold text-xl text-primary">WiseLender AI Analysis Dashboard</h2>
            </div>
            <Badge variant="outline" className="text-xs uppercase bg-background">{app.prediction.model_version || 'v1.0'}</Badge>
          </div>
          <CardContent className="p-6">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b pb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Alternative Credit Score</p>
                <p className="text-5xl font-black">{app.prediction.alternative_credit_score?.toFixed(0) || 'N/A'}</p>
              </div>
              <div className="flex flex-col gap-2 min-w-[200px]">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold text-right">Risk Level Assessment</p>
                <Badge 
                  className="w-full justify-center text-lg py-1 uppercase"
                  variant={
                    app.prediction.risk_level === 'LOW' ? 'default' : 
                    app.prediction.risk_level === 'MEDIUM' ? 'secondary' : 'destructive'
                  }
                >
                  {app.prediction.risk_level} RISK
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              <div className="space-y-6">
                <h3 className="font-bold text-lg border-b pb-2">Default Probabilities</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Overall Probability</span>
                    <span className="font-bold">{(app.prediction.overall_default_probability * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={app.prediction.overall_default_probability * 100} 
                    indicatorClassName={app.prediction.overall_default_probability > 0.5 ? 'bg-red-500' : 'bg-primary'} 
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Financial Risk</span>
                    <span>{(app.prediction.financial_default_probability * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={app.prediction.financial_default_probability * 100} className="h-2 bg-muted" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Behavioral Risk</span>
                    <span>{(app.prediction.behavioral_default_probability * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={app.prediction.behavioral_default_probability * 100} className="h-2 bg-muted" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Digital Trust Risk</span>
                    <span>{(app.prediction.digital_default_probability * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={app.prediction.digital_default_probability * 100} className="h-2 bg-muted" />
                </div>
              </div>

              
              <div className="space-y-6">
                <h3 className="font-bold text-lg border-b pb-2">Component Indexes (0-100)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-muted/20 border-none shadow-none">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <CreditCard className="h-5 w-5 text-muted-foreground mb-2" />
                      <span className="text-2xl font-bold">{app.prediction.financial_index?.toFixed(0) || '0'}</span>
                      <span className="text-xs text-muted-foreground uppercase">Financial</span>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/20 border-none shadow-none">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <Activity className="h-5 w-5 text-muted-foreground mb-2" />
                      <span className="text-2xl font-bold">{app.prediction.behavioral_index?.toFixed(0) || '0'}</span>
                      <span className="text-xs text-muted-foreground uppercase">Behavioral</span>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/20 border-none shadow-none">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <Lock className="h-5 w-5 text-muted-foreground mb-2" />
                      <span className="text-2xl font-bold">{app.prediction.digital_trust_index?.toFixed(0) || '0'}</span>
                      <span className="text-xs text-muted-foreground uppercase">Digital Trust</span>
                    </CardContent>
                  </Card>

                  <Card className="bg-primary/10 border-none shadow-none">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <ShieldAlert className="h-5 w-5 text-primary mb-2" />
                      <span className="text-2xl font-bold text-primary">{app.prediction.meta_index?.toFixed(0) || '0'}</span>
                      <span className="text-xs text-primary uppercase font-semibold">Meta Index</span>
                    </CardContent>
                  </Card>
                </div>
              </div>

            </div>

            {app.prediction.shap_explanations && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="font-bold text-lg mb-4">SHAP Explainability (Feature Impact)</h3>
                <p className="text-sm text-muted-foreground mb-4">Detailed breakdown of feature contributions for admin audit.</p>
                <Accordion type="single" collapsible className="w-full border rounded-md px-4">
                  {renderShapCard("Financial", <CreditCard className="w-4 h-4"/>, app.prediction.shap_explanations.financial)}
                  {renderShapCard("Behavioral", <Activity className="w-4 h-4"/>, app.prediction.shap_explanations.behavioral)}
                  {renderShapCard("Digital Trust", <Lock className="w-4 h-4"/>, app.prediction.shap_explanations.digital_trust)}
                </Accordion>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Raw Application Data</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
              {Object.entries(app.questionnaire || {}).map(([key, value]: any) => (
                <div key={key} className="flex flex-col border-b pb-2 border-muted">
                  <span className="text-muted-foreground font-medium uppercase text-xs">{key}</span>
                  <span className="mt-1 font-mono">{value?.toString()}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Applicant Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{app.user?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">User ID</span>
                <span className="font-mono text-xs">{app.user_id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Submitted On</span>
                <span>{new Date(app.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Admin Review Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Current Review Status</span>
                <Badge variant="outline">{app.final_review || 'NOT REVIEWED'}</Badge>
              </div>
              
              {(!app.final_review || app.final_review === 'NOT_REVIEWED') ? (
                <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" 
                    onClick={() => handleReview('REJECTED')} disabled={actionLoading}>
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700" 
                    onClick={() => handleReview('APPROVED')} disabled={actionLoading}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Approve
                  </Button>
                </div>
              ) : (
                <div className="p-3 bg-muted rounded-md text-sm text-center">
                  Reviewed by {app.reviewed_by} at {new Date(app.reviewed_at).toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
