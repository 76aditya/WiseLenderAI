import { Navigate, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ShieldCheck, LogOut, LayoutDashboard, FilePlus, User as UserIcon } from 'lucide-react';

export default function ProtectedLayout({ adminOnly = false }: { adminOnly?: boolean }) {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user.admin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="w-full md:w-64 border-r bg-muted/40 p-4 flex flex-col gap-8">
        <div className="flex items-center gap-2 px-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">WiseLender</span>
        </div>
        
        <nav className="flex flex-col gap-2 flex-1">
          {user.admin ? (
            <>
              <Link to="/admin/dashboard">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <LayoutDashboard className="h-4 w-4" /> Admin Console
                </Button>
              </Link>
              <Link to="/admin/users">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Users className="h-4 w-4" /> Users
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <LayoutDashboard className="h-4 w-4" /> My Applications
                </Button>
              </Link>
              <Link to="/applications/new">
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <FilePlus className="h-4 w-4" /> New Application
                </Button>
              </Link>
            </>
          )}
        </nav>
        
        <div className="flex flex-col gap-2 border-t pt-4">
          <div className="px-4 py-2 text-sm text-muted-foreground truncate">
            {user.email}
          </div>
          <Link to="/profile">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <UserIcon className="h-4 w-4" /> Profile
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </aside>
      
      <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
}

// Just an import helper to fix 'Users' missing above since I forgot to import it
import { Users } from 'lucide-react';
