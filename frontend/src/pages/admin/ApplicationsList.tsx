import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import client, { ADMIN_URL } from '@/api/client';

export default function ApplicationsList() {
  const [applications, setApplications] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications(filter);
  }, [filter]);

  const fetchApplications = async (statusFilter: string) => {
    setLoading(true);
    try {
      let endpoint = `${ADMIN_URL}/admin/applications`;
      if (statusFilter === 'pending') endpoint = `${ADMIN_URL}/admin/applications/pending-review`;
      else if (statusFilter === 'approved') endpoint = `${ADMIN_URL}/admin/applications/approved`;
      else if (statusFilter === 'rejected') endpoint = `${ADMIN_URL}/admin/applications/rejected`;
      
      const res = await client.get(endpoint);
      setApplications(res.data);
    } catch (err) {
      console.error('Failed to fetch admin applications', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Application Management</h1>
        <p className="text-muted-foreground">Review and manage loan applications across the system.</p>
      </div>

      <div className="flex gap-2">
        <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>All</Button>
        <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')}>Pending Review</Button>
        <Button variant={filter === 'approved' ? 'default' : 'outline'} onClick={() => setFilter('approved')}>Approved</Button>
        <Button variant={filter === 'rejected' ? 'default' : 'outline'} onClick={() => setFilter('rejected')}>Rejected</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Final Review</th>
                  <th className="px-6 py-3">Created At</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>
                ) : applications.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-center text-muted-foreground">No applications found.</td></tr>
                ) : (
                  applications.map(app => (
                    <tr key={app.id} className="border-b hover:bg-muted/30">
                      <td className="px-6 py-4 font-medium">{app.title || 'Untitled'}</td>
                      <td className="px-6 py-4">{app.status}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          app.final_review === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          app.final_review === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {app.final_review || 'NOT_REVIEWED'}
                        </span>
                      </td>
                      <td className="px-6 py-4">{new Date(app.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <Link to={`/admin/applications/${app.id}`}>
                          <Button variant="outline" size="sm">Review</Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
