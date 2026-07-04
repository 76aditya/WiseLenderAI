import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldCheck, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl tracking-tight">WiseLender AI</span>
          </div>
          <nav className="flex items-center gap-4">
            {user ? (
              <Link to={user.admin ? "/admin/dashboard" : "/dashboard"}>
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-1">
        <section className="container py-24 md:py-32 flex flex-col items-center text-center gap-8">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter max-w-[800px]">
            The Future of <span className="text-primary">Alternative Credit Scoring</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-[600px]">
            Evaluate loan applications using advanced machine learning models analyzing financial, behavioral, and digital trust intelligence.
          </p>
          {!user && (
            <div className="flex gap-4 mt-4">
              <Link to="/register">
                <Button size="lg" className="h-12 px-8 text-lg">Create an Account</Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg">Sign In</Button>
              </Link>
            </div>
          )}
        </section>

        <section className="bg-muted py-24">
          <div className="container grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl shadow-sm border flex flex-col items-center text-center gap-4">
              <TrendingUp className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Financial Intelligence</h3>
              <p className="text-muted-foreground">Evaluates applicant's financial capability, income, and liabilities.</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm border flex flex-col items-center text-center gap-4">
              <Users className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Behavioral Analysis</h3>
              <p className="text-muted-foreground">Evaluates historical borrowing behaviour and repayment habits.</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm border flex flex-col items-center text-center gap-4">
              <ShieldCheck className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Digital Trust</h3>
              <p className="text-muted-foreground">Leverages alternative trust indicators derived from digital profiles.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container flex items-center justify-between text-sm text-muted-foreground">
          <p>© 2026 WiseLender AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
