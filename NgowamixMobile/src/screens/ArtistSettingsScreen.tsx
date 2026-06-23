import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Save } from 'lucide-react-native';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function ArtistSettingsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', bio: '', country: '', genres: '', socialLinks: '',
  });

  useEffect(() => {
    setLoading(true);
    api.getArtistDashboard().then((res: any) => {
      const a = res.artist;
      setForm({
        name: a.name || '',
        bio: a.bio || '',
        country: a.country || '',
        genres: a.genres || '',
        socialLinks: a.socialLinks || '',
      });
    }).catch(() => {
      Alert.alert('Erreur', 'Impossible de charger le profil');
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateArtistProfile({
        name: form.name || undefined,
        bio: form.bio || undefined,
        country: form.country || undefined,
        genres: form.genres,
        socialLinks: form.socialLinks,
      });
      Alert.alert('Succès', 'Profil mis à jour');
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Mise à jour échouée');
    } finally {
      setSaving(false);
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Paramètres</Text>
          <Text style={styles.subtitle}>Modifier votre profil artiste</Text>
        </View>

        <Text style={styles.label}>Nom d'artiste</Text>
        <TextInput style={styles.input} placeholder="Nom de scène" placeholderTextColor="#666" value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} />

        <Text style={styles.label}>Biographie</Text>
        <TextInput style={[styles.input, styles.textArea]} placeholder="Parlez de vous..." placeholderTextColor="#666" value={form.bio} onChangeText={(t) => setForm({ ...form, bio: t })} multiline />

        <Text style={styles.label}>Pays</Text>
        <TextInput style={styles.input} placeholder="Ex: CI" placeholderTextColor="#666" value={form.country} onChangeText={(t) => setForm({ ...form, country: t })} />

        <Text style={styles.label}>Genres</Text>
        <TextInput style={styles.input} placeholder="Ex: Afrobeat, Coupé-Décalé" placeholderTextColor="#666" value={form.genres} onChangeText={(t) => setForm({ ...form, genres: t })} />

        <Text style={styles.label}>Liens sociaux</Text>
        <TextInput style={styles.input} placeholder="JSON ou texte" placeholderTextColor="#666" value={form.socialLinks} onChangeText={(t) => setForm({ ...form, socialLinks: t })} multiline />

        <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.5 }]} onPress={handleSave} disabled={saving}>
          <Save size={20} color="#fff" />
          <Text style={styles.saveBtnText}>{saving ? 'Enregistrement...' : 'Enregistrer'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  header: { paddingTop: 60, paddingBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#a1a1aa', marginTop: 4 },
  label: { color: '#a1a1aa', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 4 },
  input: {
    backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, fontSize: 15,
    color: '#fff', marginBottom: 14, borderWidth: 1, borderColor: '#2a2a2a',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#f97316', borderRadius: 12, padding: 16, marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
