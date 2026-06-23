import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Music, Play, ShoppingBag, TrendingUp, Wallet, AlertTriangle } from 'lucide-react-native';
import api from '../services/api';
import { DashboardData } from '../types';

const statusLabels: Record<string, string> = {
  DRAFT: 'Brouillon',
  SUBMITTED: 'En attente',
  VALIDATED: 'Validé',
  PUBLISHED: 'Publié',
  REJECTED: 'Rejeté',
  ARCHIVED: 'Archivé',
};

const badgeBg = (status: string) => {
  switch (status) {
    case 'PUBLISHED': return { backgroundColor: 'rgba(34,197,94,0.2)' };
    case 'SUBMITTED': return { backgroundColor: 'rgba(245,158,11,0.2)' };
    case 'REJECTED': return { backgroundColor: 'rgba(239,68,68,0.2)' };
    default: return { backgroundColor: 'rgba(113,113,122,0.2)' };
  }
};

export default function ArtistDashboardScreen({ navigation }: any) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getArtistDashboard().then((res: any) => {
      setData(res);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Erreur de chargement</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{data.artist.name}</Text>
        <Text style={styles.subtitle}>Tableau de bord artiste</Text>
        {data.artist.isVerified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>Vérifié</Text>
          </View>
        )}
      </View>

      {!data.artist.isVerified && (
        <View style={styles.warningBanner}>
          <AlertTriangle size={18} color="#f59e0b" />
          <Text style={styles.warningText}>
            Compte non vérifié — vous devez faire vérifier votre compte avant de publier.
          </Text>
        </View>
      )}

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Music size={22} color="#f97316" />
          <Text style={styles.statValue}>{data.stats.albums}</Text>
          <Text style={styles.statLabel}>Albums</Text>
        </View>
        <View style={styles.statCard}>
          <Play size={22} color="#f97316" />
          <Text style={styles.statValue}>{data.stats.totalPlays.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Écoutes</Text>
        </View>
        <View style={styles.statCard}>
          <ShoppingBag size={22} color="#f97316" />
          <Text style={styles.statValue}>{data.stats.totalPurchases}</Text>
          <Text style={styles.statLabel}>Ventes</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={22} color="#f97316" />
          <Text style={styles.statValue}>{data.stats.tracks}</Text>
          <Text style={styles.statLabel}>Pistes</Text>
        </View>
        <View style={styles.statCard}>
          <Wallet size={22} color="#f97316" />
          <Text style={styles.statValue}>{data.artist.balance.toLocaleString()} F</Text>
          <Text style={styles.statLabel}>Gains</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Albums récents</Text>
        {data.recentAlbums.length === 0 ? (
          <View style={styles.emptySection}>
            <Music size={32} color="#666" />
            <Text style={styles.emptyText}>Aucun album publié</Text>
          </View>
        ) : (
          data.recentAlbums.map((album) => (
            <View key={album.id} style={styles.albumRow}>
              <View style={styles.albumInfo}>
                <Text style={styles.albumTitle}>{album.title}</Text>
                <View style={styles.albumMeta}>
                  <View style={[styles.statusBadge, badgeBg(album.status)]}>
                    <Text style={styles.statusText}>{statusLabels[album.status] || album.status}</Text>
                  </View>
                  <Text style={styles.albumStat}>{album.playCount} écoutes</Text>
                </View>
              </View>
              <Text style={styles.albumPrice}>{Number(album.price).toLocaleString()} F</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', paddingHorizontal: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
  errorText: { color: '#ef4444', fontSize: 16 },
  header: { paddingTop: 60, paddingBottom: 16, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#a1a1aa', marginTop: 4 },
  verifiedBadge: {
    marginTop: 8, backgroundColor: 'rgba(34,197,94,0.15)',
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12,
  },
  verifiedText: { color: '#22c55e', fontSize: 12, fontWeight: '600' },
  warningBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(245,158,11,0.1)', borderRadius: 12,
    padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)',
  },
  warningText: { color: '#f59e0b', fontSize: 12, flex: 1 },
  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24,
  },
  statCard: {
    width: '47%', backgroundColor: '#1a1a1a', borderRadius: 12,
    padding: 16, borderWidth: 1, borderColor: '#2a2a2a', alignItems: 'center',
  },
  statValue: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 8 },
  statLabel: { color: '#a1a1aa', fontSize: 12, marginTop: 2 },
  section: { marginBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  emptySection: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { color: '#a1a1aa', fontSize: 14, marginTop: 8 },
  albumRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1a1a1a', borderRadius: 10, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  albumInfo: { flex: 1, marginRight: 12 },
  albumTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  albumMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },

  statusText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  albumStat: { color: '#a1a1aa', fontSize: 11 },
  albumPrice: { color: '#f97316', fontSize: 14, fontWeight: '600' },
});
