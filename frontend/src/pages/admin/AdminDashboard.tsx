import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
        <p className="text-muted-foreground">Manage users, applications, and system settings.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/admin/applications">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-col items-center text-center pb-2">
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Applications</CardTitle>
              <CardDescription>Review and manage all loan applications</CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link to="/admin/users">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardHeader className="flex flex-col items-center text-center pb-2">
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage system users and access</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
