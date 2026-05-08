'use client';

import { useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { formatPrice } from '@/lib/utils';

const statusTabs = [
  { id: 'ALL', label: 'Toutes' },
  { id: 'PAID', label: 'Payées' },
  { id: 'PENDING', label: 'En attente' },
  { id: 'FAILED', label: 'Échouées' },
  { id: 'REFUNDED', label: 'Remboursées' },
];

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ pages: 1, total: 0 });

  const fetchTransactions = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: '20' });
    if (status !== 'ALL') params.set('status', status);

    try {
      const res = await fetch(`/api/admin/transactions?${params}`);
      const data = await res.json();
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Fetch transactions error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [status, page]);

  const statusVariant = (s: string) => {
    const map: Record<string, 'success' | 'warning' | 'error' | 'default' | 'secondary'> = {
      PAID: 'success',
      PENDING: 'warning',
      FAILED: 'error',
      CANCELLED: 'secondary',
      REFUNDED: 'default',
    };
    return map[s] || 'default';
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <CreditCard className="h-6 w-6 text-primary" />
        Transactions
      </h1>

      <Tabs tabs={statusTabs} activeTab={status} onTabChange={(id) => { setStatus(id); setPage(1); }} className="mb-6" />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-surface-hover rounded animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-surface">
                <tr className="text-left text-sm text-text-secondary">
                  <th className="p-3 font-medium">Utilisateur</th>
                  <th className="p-3 font-medium">Type</th>
                  <th className="p-3 font-medium">Montant</th>
                  <th className="p-3 font-medium">Méthode</th>
                  <th className="p-3 font-medium">Statut</th>
                  <th className="p-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-border text-sm">
                    <td className="p-3">{tx.user.email}</td>
                    <td className="p-3">
                      <Badge variant="secondary">{tx.type === 'SUBSCRIPTION' ? 'Abonnement' : 'Album'}</Badge>
                    </td>
                    <td className="p-3 font-medium text-accent">{formatPrice(Number(tx.amount))}</td>
                    <td className="p-3 text-text-muted">{tx.paymentMethod}</td>
                    <td className="p-3">
                      <Badge variant={statusVariant(tx.status)}>{tx.status}</Badge>
                    </td>
                    <td className="p-3 text-text-muted">
                      {new Date(tx.createdAt).toLocaleDateString('fr-FR')}
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
              <span className="text-sm text-text-secondary">{page}/{pagination.pages}</span>
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
