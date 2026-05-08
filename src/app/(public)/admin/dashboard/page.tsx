'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Crown, Music, ShoppingBag, TrendingUp, AlertCircle, Bell, Shield } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatNumber, formatPrice, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/admin/notifications')
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {});
  }, []);

  const markAllAsRead = async () => {
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark-all-read' }),
    });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, status: 'READ' })));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="animate-pulse space-y-8">
          <div className="h-10 w-48 bg-surface-hover rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-28 bg-surface-hover rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <p className="text-error">Erreur lors du chargement</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pb-24">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Tableau de bord administrateur</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="h-5 w-5 text-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-text-secondary hover:text-primary"
            >
              Tout marquer comme lu
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard icon={Users} label="Utilisateurs" value={data.stats.totalUsers} />
        <StatsCard icon={Crown} label="Abonnés Premium" value={data.stats.premiumUsers} />
        <StatsCard icon={Music} label="Albums" value={data.stats.totalAlbums} />
        <StatsCard icon={ShoppingBag} label="Transactions" value={data.stats.totalTransactions} />
      </div>

      {/* Revenue + Pending */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatsCard icon={TrendingUp} label="Revenus totaux" value={formatPrice(Number(data.stats.revenue))} />
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            <span className="text-sm text-text-secondary">Albums en attente</span>
          </div>
          <p className="text-2xl font-bold">{data.stats.pendingAlbums}</p>
          <Link href="/admin/catalog?status=SUBMITTED">
            <Button variant="outline" size="sm" className="mt-3">
              Voir les validations
            </Button>
          </Link>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm text-text-secondary">Vérifications artistes</span>
          </div>
          <p className="text-2xl font-bold">{data.stats.pendingVerifications ?? 0}</p>
          <Link href="/admin/verification">
            <Button variant="outline" size="sm" className="mt-3">
              Gérer
            </Button>
          </Link>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-xl border border-border p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications récentes
          </h2>
          <Link href="/admin/catalog?status=SUBMITTED">
            <Button variant="ghost" size="sm">Voir tout</Button>
          </Link>
        </div>
        {notifications.length === 0 ? (
          <p className="text-text-muted text-sm">Aucune notification</p>
        ) : (
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification: any) => (
              <div
                key={notification.id}
                className={cn(
                  'flex items-start justify-between gap-4 rounded-lg p-3 text-sm',
                  notification.status === 'UNREAD' ? 'bg-primary/5' : 'bg-surface-hover'
                )}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {notification.status === 'UNREAD' && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                    <span className={cn(
                      'font-medium',
                      notification.status === 'UNREAD' ? 'text-text-primary' : 'text-text-secondary'
                    )}>
                      {notification.title}
                    </span>
                  </div>
                  <p className="text-text-secondary">{notification.message}</p>
                </div>
                <span className="text-xs text-text-muted shrink-0">
                  {formatDate(notification.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent activity */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Utilisateurs récents</h2>
          {data.recentUsers.length === 0 ? (
            <p className="text-text-muted text-sm">Aucun utilisateur</p>
          ) : (
            <div className="space-y-3">
              {data.recentUsers.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{user.email}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{user.role}</Badge>
                    {user.isPremium && <Badge variant="premium">Premium</Badge>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div className="rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Transactions récentes</h2>
          {data.recentTransactions.length === 0 ? (
            <p className="text-text-muted text-sm">Aucune transaction</p>
          ) : (
            <div className="space-y-3">
              {data.recentTransactions.map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{tx.user.email}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={tx.status === 'PAID' ? 'success' : 'default'}>{tx.status}</Badge>
                    <span className="font-medium text-accent">{formatPrice(Number(tx.amount))}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
