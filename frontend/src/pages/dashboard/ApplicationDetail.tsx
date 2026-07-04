import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import client, { APP_URL, PREDICTION_URL } from '@/api/client';
import { ArrowLeft, BrainCircuit, FileText, Upload, ShieldAlert, Activity, CreditCard, Lock } from 'lucide-react';

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const res = await client.get(`${APP_URL}/applications/${id}`);
      setApp(res.data);
      if (res.data.status === 'PREDICTED') {
         fetchPrediction();
      }
    } catch (err: any) {
      setError('Failed to fetch application');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrediction = async () => {
    try {
      const res = await client.get(`${PREDICTION_URL}/applications/${id}/prediction`);
      if (res.status === 200) {
        setPrediction(res.data);
      }
    } catch (err) {
      console.log('Prediction not ready yet or error');
    }
  };

  const submitApplication = async () => {
    setActionLoading(true);
    try {
      await client.post(`${APP_URL}/applications/${id}/submit`);
      await fetchApplication();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit application');
    } finally {
      setActionLoading(false);
    }
  };

  const requestPrediction = async () => {
    setActionLoading(true);
    try {
      await client.post(`${PREDICTION_URL}/applications/${id}/predict`);
      // Start polling for prediction if it's 202 Accepted
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        try {
          const res = await client.get(`${PREDICTION_URL}/applications/${id}/prediction`);
          if (res.status === 200) {
            setPrediction(res.data);
            await fetchApplication(); // refresh status
            clearInterval(poll);
          }
        } catch (e) {
          if (attempts > 10) clearInterval(poll); // Give up after 10 attempts
        }
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to request prediction');
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{app.title || 'Loan Application'}</h1>
          <p className="text-muted-foreground">ID: {app.id}</p>
        </div>
      </div>

      {error && <div className="p-3 bg-destructive/15 text-destructive rounded-md">{error}</div>}

      {prediction && (
        <Card className="border-2 border-primary/20 shadow-md mb-8 overflow-hidden">
          <div className="bg-primary/5 p-4 border-b flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <h2 className="font-bold text-xl text-primary">WiseLender AI Analysis Dashboard</h2>
          </div>
          <CardContent className="p-6">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b pb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Alternative Credit Score</p>
                <p className="text-5xl font-black">{prediction.alternative_credit_score?.toFixed(0) || 'N/A'}</p>
              </div>
              <div className="flex flex-col gap-2 min-w-[200px]">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold text-right">Risk Level Assessment</p>
                <Badge 
                  className="w-full justify-center text-lg py-1 uppercase"
                  variant={
                    prediction.risk_level === 'LOW' ? 'default' : 
                    prediction.risk_level === 'MEDIUM' ? 'secondary' : 'destructive'
                  }
                >
                  {prediction.risk_level} RISK
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              <div className="space-y-6">
                <h3 className="font-bold text-lg border-b pb-2">Default Probabilities</h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Overall Probability</span>
                    <span className="font-bold">{(prediction.overall_default_probability * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={prediction.overall_default_probability * 100} 
                    indicatorClassName={prediction.overall_default_probability > 0.5 ? 'bg-red-500' : 'bg-primary'} 
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Financial Risk</span>
                    <span>{(prediction.financial_default_probability * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={prediction.financial_default_probability * 100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Behavioral Risk</span>
                    <span>{(prediction.behavioral_default_probability * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={prediction.behavioral_default_probability * 100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Digital Trust Risk</span>
                    <span>{(prediction.digital_default_probability * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={prediction.digital_default_probability * 100} className="h-2" />
                </div>
              </div>

              
              <div className="space-y-6">
                <h3 className="font-bold text-lg border-b pb-2">Component Indexes (0-100)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-muted/20 border-none shadow-none">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <CreditCard className="h-5 w-5 text-muted-foreground mb-2" />
                      <span className="text-2xl font-bold">{prediction.financial_index?.toFixed(0) || '0'}</span>
                      <span className="text-xs text-muted-foreground uppercase">Financial</span>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-muted/20 border-none shadow-none">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <Activity className="h-5 w-5 text-muted-foreground mb-2" />
                      <span className="text-2xl font-bold">{prediction.behavioral_index?.toFixed(0) || '0'}</span>
                      <span className="text-xs text-muted-foreground uppercase">Behavioral</span>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/20 border-none shadow-none">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <Lock className="h-5 w-5 text-muted-foreground mb-2" />
                      <span className="text-2xl font-bold">{prediction.digital_trust_index?.toFixed(0) || '0'}</span>
                      <span className="text-xs text-muted-foreground uppercase">Digital Trust</span>
                    </CardContent>
                  </Card>

                  <Card className="bg-primary/10 border-none shadow-none">
                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                      <ShieldAlert className="h-5 w-5 text-primary mb-2" />
                      <span className="text-2xl font-bold text-primary">{prediction.meta_index?.toFixed(0) || '0'}</span>
                      <span className="text-xs text-primary uppercase font-semibold">Meta Index</span>
                    </CardContent>
                  </Card>
                </div>
              </div>

            </div>

            {prediction.shap_explanations && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="font-bold text-lg mb-4">SHAP Explainability (Feature Impact)</h3>
                <p className="text-sm text-muted-foreground mb-4">Positive values increase risk, negative values decrease risk.</p>
                <Accordion type="single" collapsible className="w-full border rounded-md px-4">
                  {renderShapCard("Financial", <CreditCard className="w-4 h-4"/>, prediction.shap_explanations.financial)}
                  {renderShapCard("Behavioral", <Activity className="w-4 h-4"/>, prediction.shap_explanations.behavioral)}
                  {renderShapCard("Digital Trust", <Lock className="w-4 h-4"/>, prediction.shap_explanations.digital_trust)}
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
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5"/> Application Data</CardTitle>
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
              <CardTitle>Status & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-muted-foreground">Current Status</span>
                <Badge variant="outline" className="w-fit text-sm py-1 bg-muted/50">{app.status}</Badge>
              </div>
              
              <div className="flex flex-col gap-3 pt-4 border-t">
                {app.status === 'DRAFT' && (
                  <Button className="w-full gap-2" onClick={submitApplication} disabled={actionLoading}>
                    <Upload className="h-4 w-4"/> Submit Application
                  </Button>
                )}
                {(app.status === 'SUBMITTED' || app.status === 'DRAFT') && (
                  <Button variant="secondary" className="w-full gap-2" onClick={requestPrediction} disabled={actionLoading}>
                    <BrainCircuit className="h-4 w-4"/> Request AI Prediction
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
