import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator,
  Alert, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ticket, Plus, Trash2, MapPin, Calendar, Clock, Users } from 'lucide-react-native';
import api from '../services/api';
import { ArtistConcert } from '../types';

export default function ManageConcertsScreen({ navigation }: any) {
  const [concerts, setConcerts] = useState<ArtistConcert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '', venue: '', city: '', country: 'CI',
    date: '', time: '', description: '', totalTickets: '',
    price: '', vipPrice: '', vvipPrice: '',
  });

  const fetchConcerts = () => {
    setLoading(true);
    api.getArtistConcerts().then((data) => {
      setConcerts(data.concerts || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchConcerts();
  }, []);

  const handleCreate = async () => {
    if (!form.title || !form.venue || !form.city || !form.date || !form.time || !form.totalTickets || !form.price) {
      Alert.alert('Erreur', 'Tous les champs obligatoires doivent être remplis');
      return;
    }
    setCreating(true);
    try {
      await api.createArtistConcert(form);
      setShowModal(false);
      setForm({ title: '', venue: '', city: '', country: 'CI', date: '', time: '', description: '', totalTickets: '', price: '', vipPrice: '', vvipPrice: '' });
      fetchConcerts();
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Création échouée');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Supprimer', `Supprimer le concert "${title}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await api.deleteArtistConcert(id);
            fetchConcerts();
          } catch {
            Alert.alert('Erreur', 'Impossible de supprimer');
          }
        },
      },
    ]);
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
        <Text style={styles.title}>Mes concerts</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {concerts.length === 0 ? (
        <View style={styles.center}>
          <Ticket size={48} color="#666" />
          <Text style={styles.emptyText}>Aucun concert</Text>
          <TouchableOpacity style={styles.createBtn} onPress={() => setShowModal(true)}>
            <Plus size={18} color="#fff" />
            <Text style={styles.createBtnText}>Créer un concert</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={concerts}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <View style={[styles.statusBadge, item.isActive ? styles.activeBadge : styles.inactiveBadge]}>
                    <Text style={[styles.statusText, item.isActive ? styles.activeText : styles.inactiveText]}>
                      {item.isActive ? 'Actif' : 'Inactif'}
                    </Text>
                  </View>
                </View>
                <View style={styles.detailRow}>
                  <MapPin size={14} color="#a1a1aa" />
                  <Text style={styles.detailText}>{item.venue}, {item.city}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Calendar size={14} color="#a1a1aa" />
                  <Text style={styles.detailText}>{new Date(item.date).toLocaleDateString('fr-FR')}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Clock size={14} color="#a1a1aa" />
                  <Text style={styles.detailText}>{item.time}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Users size={14} color="#a1a1aa" />
                  <Text style={styles.detailText}>{item.availableTickets} / {item.totalTickets} places</Text>
                </View>
                <Text style={styles.price}>{item.price.toLocaleString()} F CFA</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id, item.title)}
              >
                <Trash2 size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Nouveau concert</Text>

              <TextInput style={styles.input} placeholder="Titre" placeholderTextColor="#666" value={form.title} onChangeText={(t) => setForm({ ...form, title: t })} />
              <TextInput style={styles.input} placeholder="Lieu" placeholderTextColor="#666" value={form.venue} onChangeText={(t) => setForm({ ...form, venue: t })} />
              <TextInput style={styles.input} placeholder="Ville" placeholderTextColor="#666" value={form.city} onChangeText={(t) => setForm({ ...form, city: t })} />
              <TextInput style={styles.input} placeholder="Pays (ex: CI)" placeholderTextColor="#666" value={form.country} onChangeText={(t) => setForm({ ...form, country: t })} />

              <View style={styles.row}>
                <TextInput style={[styles.input, styles.halfInput]} placeholder="Date (YYYY-MM-DD)" placeholderTextColor="#666" value={form.date} onChangeText={(t) => setForm({ ...form, date: t })} />
                <TextInput style={[styles.input, styles.halfInput]} placeholder="Heure (HH:MM)" placeholderTextColor="#666" value={form.time} onChangeText={(t) => setForm({ ...form, time: t })} />
              </View>

              <TextInput style={styles.input} placeholder="Description (optionnelle)" placeholderTextColor="#666" value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} multiline />
              <TextInput style={styles.input} placeholder="Places totales" placeholderTextColor="#666" value={form.totalTickets} onChangeText={(t) => setForm({ ...form, totalTickets: t })} keyboardType="numeric" />
              <TextInput style={styles.input} placeholder="Prix standard (XOF)" placeholderTextColor="#666" value={form.price} onChangeText={(t) => setForm({ ...form, price: t })} keyboardType="numeric" />

              <View style={styles.row}>
                <TextInput style={[styles.input, styles.halfInput]} placeholder="Prix VIP (opt.)" placeholderTextColor="#666" value={form.vipPrice} onChangeText={(t) => setForm({ ...form, vipPrice: t })} keyboardType="numeric" />
                <TextInput style={[styles.input, styles.halfInput]} placeholder="Prix VVIP (opt.)" placeholderTextColor="#666" value={form.vvipPrice} onChangeText={(t) => setForm({ ...form, vvipPrice: t })} keyboardType="numeric" />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                  <Text style={styles.cancelBtnText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.submitBtn, creating && { opacity: 0.5 }]} onPress={handleCreate} disabled={creating}>
                  <Text style={styles.submitBtnText}>{creating ? 'Création...' : 'Créer le concert'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f', paddingHorizontal: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: 20,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  addButton: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#f97316',
    justifyContent: 'center', alignItems: 'center',
  },
  emptyText: { color: '#a1a1aa', fontSize: 16, marginTop: 12, marginBottom: 20 },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f97316', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12,
  },
  createBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  card: {
    flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 16,
    padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a',
  },
  cardBody: { flex: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: '600', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  activeBadge: { backgroundColor: 'rgba(34,197,94,0.2)' },
  inactiveBadge: { backgroundColor: 'rgba(113,113,122,0.2)' },
  statusText: { fontSize: 10, fontWeight: '600' },
  activeText: { color: '#22c55e' },
  inactiveText: { color: '#a1a1aa' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  detailText: { color: '#a1a1aa', fontSize: 13 },
  price: { color: '#f97316', fontSize: 15, fontWeight: '600', marginTop: 8 },
  deleteBtn: { justifyContent: 'center', paddingLeft: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#1a1a1a', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, maxHeight: '85%',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  input: {
    backgroundColor: '#0f0f0f', borderRadius: 10, padding: 14, fontSize: 15,
    color: '#fff', marginBottom: 10, borderWidth: 1, borderColor: '#2a2a2a',
  },
  row: { flexDirection: 'row', gap: 10 },
  halfInput: { flex: 1 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 20 },
  cancelBtn: {
    flex: 1, padding: 14, borderRadius: 12, borderWidth: 1,
    borderColor: '#2a2a2a', alignItems: 'center',
  },
  cancelBtnText: { color: '#a1a1aa', fontSize: 15, fontWeight: '600' },
  submitBtn: {
    flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#f97316',
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
