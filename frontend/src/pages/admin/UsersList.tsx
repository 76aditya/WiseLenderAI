import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import client, { ADMIN_URL } from '@/api/client';

export default function UsersList() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Users</h1>
        <p className="text-muted-foreground">List of all registered users in the platform.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-3">ID</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className="border-b hover:bg-muted/30">
                      <td className="px-6 py-4 font-mono text-xs">{u.id}</td>
                      <td className="px-6 py-4 font-medium">{u.email}</td>
                      <td className="px-6 py-4">
                        {u.admin ? (
                          <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-semibold">Admin</span>
                        ) : (
                          <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs">User</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {u.is_active ? 'Active' : 'Inactive'}
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
