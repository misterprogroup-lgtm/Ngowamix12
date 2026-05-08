'use client';

import { useEffect, useState } from 'react';
import { Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  const fetchUsers = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: '20' });
    if (role !== 'ALL') params.set('role', role);

    try {
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Fetch users error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [role, page]);

  const handleAction = async (userId: string, action: string) => {
    try {
      await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action }),
      });
      fetchUsers();
    } catch (error) {
      console.error('Action error:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Utilisateurs
        </h1>
      </div>

      <div className="flex gap-4 mb-6">
        {['ALL', 'LISTENER', 'ARTIST', 'LABEL', 'ADMIN'].map((r) => (
          <Button
            key={r}
            variant={role === r ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => { setRole(r); setPage(1); }}
          >
            {r === 'ALL' ? 'Tous' : r}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-surface-hover rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface">
                <tr className="text-left text-sm text-text-secondary">
                  <th className="p-3 font-medium">Email</th>
                  <th className="p-3 font-medium">Nom</th>
                  <th className="p-3 font-medium">Rôle</th>
                  <th className="p-3 font-medium">Premium</th>
                  <th className="p-3 font-medium">Inscrit le</th>
                  <th className="p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-border text-sm">
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">{user.displayName || '-'}</td>
                    <td className="p-3">
                      <Badge variant="secondary">{user.role}</Badge>
                    </td>
                    <td className="p-3">
                      {user.isPremium ? (
                        <Badge variant="premium">Premium</Badge>
                      ) : (
                        <span className="text-text-muted">Non</span>
                      )}
                    </td>
                    <td className="p-3 text-text-muted">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {user.isPremium ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleAction(user.id, 'revoke_premium')}
                          >
                            Révoquer
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7 text-success"
                            onClick={() => handleAction(user.id, 'activate_premium')}
                          >
                            Activer
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Précédent
              </Button>
              <span className="text-sm text-text-secondary">Page {page}/{pagination.pages}</span>
              <Button variant="secondary" size="sm" disabled={page === pagination.pages} onClick={() => setPage(page + 1)}>
                Suivant
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
