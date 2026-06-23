import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Wallet, ShoppingBag, TrendingUp, DollarSign } from 'lucide-react-native';
import api from '../services/api';
import { DashboardData } from '../types';

export default function RevenueScreen({ navigation }: any) {
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
        <Text style={styles.title}>Revenus</Text>
        <Text style={styles.subtitle}>Vos gains sur Ngowamix</Text>
      </View>

      <View style={styles.balanceCard}>
        <Wallet size={32} color="#f97316" />
        <Text style={styles.balanceLabel}>Solde disponible</Text>
        <Text style={styles.balanceValue}>{data.artist.balance.toLocaleString()} F CFA</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <ShoppingBag size={20} color="#22c55e" />
          <Text style={styles.statValue}>{data.stats.totalPurchases}</Text>
          <Text style={styles.statLabel}>Ventes totales</Text>
        </View>
        <View style={styles.statCard}>
          <TrendingUp size={20} color="#3b82f6" />
          <Text style={styles.statValue}>{data.stats.totalPlays.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Écoutes totales</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Détail des albums</Text>
        {data.recentAlbums.length === 0 ? (
          <Text style={styles.emptyText}>Aucun album</Text>
        ) : (
          data.recentAlbums.map((album) => (
            <View key={album.id} style={styles.albumRow}>
              <View style={styles.albumInfo}>
                <Text style={styles.albumTitle}>{album.title}</Text>
                <Text style={styles.albumStat}>
                  {album.purchaseCount} vente{album.purchaseCount !== 1 ? 's' : ''}
                </Text>
              </View>
              <Text style={styles.albumRevenue}>
                {(album.purchaseCount * Number(album.price)).toLocaleString()} F
              </Text>
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
  header: { paddingTop: 60, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#a1a1aa', marginTop: 4 },
  balanceCard: {
    backgroundColor: 'rgba(249,115,22,0.1)', borderRadius: 16,
    padding: 24, alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)',
  },
  balanceLabel: { color: '#a1a1aa', fontSize: 14, marginTop: 8 },
  balanceValue: { color: '#f97316', fontSize: 32, fontWeight: 'bold', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: '#1a1a1a', borderRadius: 12,
    padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#2a2a2a',
  },
  statValue: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 8 },
  statLabel: { color: '#a1a1aa', fontSize: 12, marginTop: 2 },
  section: { marginBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  emptyText: { color: '#a1a1aa', fontSize: 14, textAlign: 'center', paddingVertical: 20 },
  albumRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1a1a1a', borderRadius: 10, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  albumInfo: { flex: 1 },
  albumTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  albumStat: { color: '#a1a1aa', fontSize: 12, marginTop: 4 },
  albumRevenue: { color: '#22c55e', fontSize: 16, fontWeight: 'bold' },
});
