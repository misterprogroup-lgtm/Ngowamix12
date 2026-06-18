import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import api from '../services/api';
import { Livestream } from '../types';
import { Radio, Users } from 'lucide-react-native';

export default function LivestreamScreen({ navigation }: any) {
  const [streams, setStreams] = useState<Livestream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLivestreams().then((data) => {
      setStreams(data.streams || []);
    }).finally(() => setLoading(false));
  }, []);

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
        <Text style={styles.title}>En Direct</Text>
      </View>
      {streams.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Aucun live en ce moment</Text>
        </View>
      ) : (
        <FlatList
          data={streams}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('LivestreamDetail', { id: item.id })}
            >
              <View style={styles.thumbnail}>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>EN DIRECT</Text>
                </View>
                <View style={styles.viewerBadge}>
                  <Users size={12} color="#fff" />
                  <Text style={styles.viewerText}>{item.viewerCount}</Text>
                </View>
              </View>
              <View style={styles.info}>
                <View style={styles.artistRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.artist.name[0]}</Text>
                  </View>
                  <View style={styles.artistInfo}>
                    <Text style={styles.streamTitle} numberOfLines={1}>{item.title}</Text>
                    <Text style={styles.artistName}>{item.artist.name}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', paddingHorizontal: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
  header: { paddingTop: 60, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  emptyText: { color: '#a1a1aa', fontSize: 16 },
  card: {
    backgroundColor: '#1a1a1a', borderRadius: 16, marginBottom: 16,
    overflow: 'hidden', borderWidth: 1, borderColor: '#2a2a2a',
  },
  thumbnail: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#222', justifyContent: 'space-between', flexDirection: 'row', padding: 12 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#dc2626',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start',
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', marginRight: 4 },
  liveText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  viewerBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
  },
  viewerText: { color: '#fff', fontSize: 11, marginLeft: 4 },
  info: { padding: 12 },
  artistRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(249,115,22,0.2)',
    justifyContent: 'center', alignItems: 'center', marginRight: 10,
  },
  avatarText: { color: '#f97316', fontWeight: 'bold', fontSize: 14 },
  artistInfo: { flex: 1 },
  streamTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
  artistName: { color: '#a1a1aa', fontSize: 13, marginTop: 2 },
});
