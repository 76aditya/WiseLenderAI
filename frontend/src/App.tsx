import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedLayout from './components/layout/ProtectedLayout';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';

import UserDashboard from './pages/dashboard/UserDashboard';
import NewApplication from './pages/dashboard/NewApplication';
import ApplicationDetail from './pages/dashboard/ApplicationDetail';

import AdminDashboard from './pages/admin/AdminDashboard';
import UsersList from './pages/admin/UsersList';
import ApplicationsList from './pages/admin/ApplicationsList';
import AdminApplicationDetail from './pages/admin/AdminApplicationDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background font-sans text-foreground">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* User Routes */}
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/applications/new" element={<NewApplication />} />
              <Route path="/applications/edit/:id" element={<NewApplication />} />
              <Route path="/applications/:id" element={<ApplicationDetail />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedLayout adminOnly={true} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UsersList />} />
              <Route path="/admin/applications" element={<ApplicationsList />} />
              <Route path="/admin/applications/:id" element={<AdminApplicationDetail />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
