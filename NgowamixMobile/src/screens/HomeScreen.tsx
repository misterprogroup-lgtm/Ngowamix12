import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import api from '../services/api';
import { Album } from '../types';
import { usePlayer } from '../contexts/PlayerContext';

export default function HomeScreen({ navigation }: any) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAlbums().then((data) => {
      setAlbums(data.albums || []);
    }).finally(() => setLoading(false));
  }, []);

  const renderAlbum = ({ item }: { item: Album }) => (
    <TouchableOpacity
      style={styles.albumCard}
      onPress={() => navigation.navigate('AlbumDetail', { id: item.id })}
    >
      <Image
        source={{ uri: item.coverImage || 'https://via.placeholder.com/150' }}
        style={styles.albumCover}
      />
      <Text style={styles.albumTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.albumArtist} numberOfLines={1}>{item.artist.name}</Text>
    </TouchableOpacity>
  );

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
        <Text style={styles.greeting}>Ngowamix</Text>
        <Text style={styles.subtitle}>Découvre la musique africaine</Text>
      </View>
      <FlatList
        data={albums}
        renderItem={renderAlbum}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', paddingHorizontal: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
  header: { paddingTop: 60, paddingBottom: 20 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#a1a1aa', marginTop: 4 },
  row: { justifyContent: 'space-between' },
  albumCard: { width: '48%', marginBottom: 16 },
  albumCover: { width: '100%', aspectRatio: 1, borderRadius: 12, backgroundColor: '#1a1a1a' },
  albumTitle: { color: '#fff', fontSize: 14, fontWeight: '600', marginTop: 8 },
  albumArtist: { color: '#a1a1aa', fontSize: 12, marginTop: 2 },
});
