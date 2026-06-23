import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Alert } from 'react-native';
import { Music, FileAudio, Disc, Trash2, Eye } from 'lucide-react-native';
import api from '../services/api';
import { ArtistAlbum } from '../types';

const statusLabels: Record<string, string> = {
  DRAFT: 'Brouillon',
  SUBMITTED: 'En attente',
  VALIDATED: 'Validé',
  PUBLISHED: 'Publié',
  REJECTED: 'Rejeté',
  ARCHIVED: 'Archivé',
};

export default function ArtistAlbumsScreen({ navigation }: any) {
  const [albums, setAlbums] = useState<ArtistAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlbums = () => {
    setLoading(true);
    api.getArtistAlbums().then((data) => {
      setAlbums(data.albums || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Supprimer', `Supprimer "${title}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteArtistAlbum(id);
            fetchAlbums();
          } catch {
            Alert.alert('Erreur', 'Impossible de supprimer');
          }
        },
      },
    ]);
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'SINGLE': return <FileAudio size={16} color="#f97316" />;
      case 'EP': return <Disc size={16} color="#f97316" />;
      default: return <Music size={16} color="#f97316" />;
    }
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case 'SINGLE': return 'Single';
      case 'EP': return 'EP';
      default: return 'Album';
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mon catalogue</Text>
      </View>
      {albums.length === 0 ? (
        <View style={styles.center}>
          <Music size={48} color="#666" />
          <Text style={styles.emptyText}>Aucun album ou single</Text>
        </View>
      ) : (
        <FlatList
          data={albums}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                {item.coverImage ? (
                  <Image source={{ uri: item.coverImage }} style={styles.cover} />
                ) : (
                  <View style={styles.coverPlaceholder}>
                    <Music size={24} color="#666" />
                  </View>
                )}
                <View style={styles.cardInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                    {typeIcon(item.type)}
                  </View>
                  <View style={styles.metaRow}>
                    <View style={[styles.statusBadge, badgeVariant(item.status)]}>
                      <Text style={styles.statusText}>{statusLabels[item.status] || item.status}</Text>
                    </View>
                    <Text style={styles.trackCount}>{item._count.tracks} titre{item._count.tracks !== 1 ? 's' : ''}</Text>
                  </View>
                  <Text style={styles.price}>{item.type === 'SINGLE' ? 'Gratuit' : `${Number(item.price).toLocaleString()} F`}</Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionBtn}>
                  <Eye size={16} color="#a1a1aa" />
                  <Text style={styles.actionText}>Voir</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleDelete(item.id, item.title)}
                >
                  <Trash2 size={16} color="#ef4444" />
                  <Text style={[styles.actionText, { color: '#ef4444' }]}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const badgeVariant = (status: string) => {
  switch (status) {
    case 'PUBLISHED': return { backgroundColor: 'rgba(34,197,94,0.2)' };
    case 'SUBMITTED': return { backgroundColor: 'rgba(245,158,11,0.2)' };
    case 'REJECTED': return { backgroundColor: 'rgba(239,68,68,0.2)' };
    default: return { backgroundColor: 'rgba(113,113,122,0.2)' };
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', paddingHorizontal: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
  header: { paddingTop: 60, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  emptyText: { color: '#a1a1aa', fontSize: 16, marginTop: 12 },
  card: {
    backgroundColor: '#1a1a1a', borderRadius: 16, padding: 14, marginBottom: 12,
    borderWidth: 1, borderColor: '#2a2a2a',
  },
  cardRow: { flexDirection: 'row', gap: 12 },
  cover: { width: 72, height: 72, borderRadius: 12, backgroundColor: '#222' },
  coverPlaceholder: {
    width: 72, height: 72, borderRadius: 12, backgroundColor: '#222',
    justifyContent: 'center', alignItems: 'center',
  },
  cardInfo: { flex: 1, justifyContent: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { color: '#fff', fontSize: 10, fontWeight: '600' },
  trackCount: { color: '#a1a1aa', fontSize: 11 },
  price: { color: '#f97316', fontSize: 14, fontWeight: '600', marginTop: 6 },
  cardActions: {
    flexDirection: 'row', gap: 16, marginTop: 12, paddingTop: 12,
    borderTopWidth: 0.5, borderTopColor: '#2a2a2a',
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { color: '#a1a1aa', fontSize: 13 },
});
