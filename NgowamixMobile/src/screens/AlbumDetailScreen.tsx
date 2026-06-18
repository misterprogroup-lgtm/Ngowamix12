import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import api from '../services/api';
import { Track } from '../types';
import { usePlayer } from '../contexts/PlayerContext';
import { Play, Pause } from 'lucide-react-native';

export default function AlbumDetailScreen({ route }: any) {
  const { id } = route.params;
  const [album, setAlbum] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying, pauseTrack } = usePlayer();

  useEffect(() => {
    Promise.all([
      api.getAlbum(id),
      api.getTracks(id),
    ]).then(([albumData, tracksData]) => {
      setAlbum(albumData.album);
      setTracks(tracksData.tracks || []);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!album) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Album introuvable</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: album.coverImage || 'https://via.placeholder.com/300' }}
          style={styles.cover}
        />
        <Text style={styles.title}>{album.title}</Text>
        <Text style={styles.artist}>{album.artist?.name}</Text>
        {album.genre && <Text style={styles.genre}>{album.genre}</Text>}
      </View>

      <FlatList
        data={tracks}
        renderItem={({ item, index }) => {
          const isCurrentTrack = currentTrack?.id === item.id;
          return (
            <TouchableOpacity
              style={[styles.track, isCurrentTrack && styles.activeTrack]}
              onPress={() => {
                if (isCurrentTrack && isPlaying) {
                  pauseTrack();
                } else {
                  playTrack(item);
                }
              }}
            >
              <Text style={styles.trackNumber}>{index + 1}</Text>
              <View style={styles.trackInfo}>
                <Text style={[styles.trackTitle, isCurrentTrack && styles.activeText]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.trackDuration}>
                  {Math.floor(item.duration / 60)}:{(item.duration % 60).toString().padStart(2, '0')}
                </Text>
              </View>
              <View style={styles.playButton}>
                {isCurrentTrack && isPlaying ? (
                  <Pause size={18} color="#f97316" />
                ) : (
                  <Play size={18} color={isCurrentTrack ? '#f97316' : '#a1a1aa'} />
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 16 },
  cover: { width: 200, height: 200, borderRadius: 16, marginBottom: 16, backgroundColor: '#1a1a1a' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  artist: { fontSize: 16, color: '#a1a1aa', marginTop: 4 },
  genre: { fontSize: 12, color: '#f97316', marginTop: 8, backgroundColor: 'rgba(249,115,22,0.1)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  errorText: { color: '#a1a1aa', fontSize: 16 },
  track: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#2a2a2a',
  },
  activeTrack: { backgroundColor: 'rgba(249,115,22,0.1)' },
  trackNumber: { color: '#666', fontSize: 14, width: 30 },
  trackInfo: { flex: 1, marginLeft: 8 },
  trackTitle: { color: '#fff', fontSize: 15 },
  activeText: { color: '#f97316' },
  trackDuration: { color: '#666', fontSize: 12, marginTop: 2 },
  playButton: { padding: 8 },
});
