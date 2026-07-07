import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import client, { ADMIN_URL } from '@/api/client';

export default function UsersList() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(u => 
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (u.latest_application_id && u.latest_application_id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await client.get(`${ADMIN_URL}/admin/users`);
        setUsers(res.data);
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Users</h1>
          <p className="text-muted-foreground">List of all registered users in the platform.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by Email or App ID..."
            className="pl-8 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-3">App ID</th>
                  <th className="px-6 py-3">Username</th>
                  <th className="px-6 py-3">Email ID</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No users found matching your search.</td></tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="border-b hover:bg-muted/30">
                      <td className="px-6 py-4 font-mono text-xs">{u.latest_application_id ? (
                        <Link to={`/admin/applications/${u.latest_application_id}`} className="text-primary hover:underline" title={u.latest_application_id}>
                          {u.latest_application_id}
                        </Link>
                      ) : 'N/A'}</td>
                      <td className="px-6 py-4 font-medium">
                        <Link to={`/admin/users/${u.id}`} className="text-primary hover:underline">
                          {u.username || 'Pending'}
                        </Link>
                      </td>
                      <td className="px-6 py-4">{u.email || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${u.role === 'Admin' ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${u.user_status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {u.user_status}
                        </span>
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
