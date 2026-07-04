import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, ShieldCheck } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">View your account credentials and system role.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            <CardTitle>Account Details</CardTitle>
          </div>
          <CardDescription>Your credentials present in the user database.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground font-medium">Email Address</span>
              <p className="font-medium text-lg">{user.email}</p>
            </div>
            
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground font-medium">Account ID</span>
              <p className="font-mono text-sm bg-muted p-2 rounded-md">{user.id}</p>
            </div>
            
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground font-medium">Account Status</span>
              <p>
                {user.is_active ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    Inactive
                  </span>
                )}
              </p>
            </div>
            
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground font-medium">System Role</span>
              <p>
                {user.admin ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                    <ShieldCheck className="w-3 h-3" /> Administrator
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                    Standard User
                  </span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
