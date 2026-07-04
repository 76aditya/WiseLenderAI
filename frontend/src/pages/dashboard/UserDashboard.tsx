import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePlus, FileText, Edit } from 'lucide-react';
import client, { APP_URL } from '@/api/client';

export default function UserDashboard() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      const res = await client.get(`${APP_URL}/applications/`);
      setApplications(res.data);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/applications/edit/${id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Applications</h1>
          <p className="text-muted-foreground">Manage and track your loan applications.</p>
        </div>
        <Link to="/applications/new">
          <Button className="gap-2">
            <FilePlus className="h-4 w-4" /> New Application
          </Button>
        </Link>
      </div>

      {loading ? (
        <div>Loading applications...</div>
      ) : applications.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <CardTitle>No applications found</CardTitle>
          <CardDescription className="mt-2 mb-6">
            You haven't submitted any loan applications yet.
          </CardDescription>
          <Link to="/applications/new">
            <Button>Create your first application</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <div key={app.id} className="relative group h-full">
              <Card className="hover:border-primary/50 transition-colors h-full flex flex-col">
                <Link to={`/applications/${app.id}`} className="block flex-1">
                  <CardHeader>
                    <CardTitle className="text-xl pr-16">{app.title || 'Loan Application'}</CardTitle>
                    <CardDescription>Created: {new Date(app.created_at).toLocaleDateString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        app.status === 'DRAFT' ? 'bg-secondary text-secondary-foreground' :
                        app.status === 'SUBMITTED' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </CardContent>
                </Link>
                  {app.status === 'DRAFT' && (
                  <CardFooter className="pt-0 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={(e) => handleEdit(app.id, e)} className="h-8">
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
