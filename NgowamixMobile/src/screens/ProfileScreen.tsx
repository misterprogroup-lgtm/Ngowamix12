import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Crown, Music, Heart } from 'lucide-react-native';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.displayName?.[0] || user?.email[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.displayName || 'Utilisateur'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.isPremium && (
          <View style={styles.premiumBadge}>
            <Crown size={14} color="#f97316" />
            <Text style={styles.premiumText}>Premium</Text>
          </View>
        )}
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Music size={20} color="#a1a1aa" />
          <Text style={styles.menuText}>Ma bibliothèque</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Heart size={20} color="#a1a1aa" />
          <Text style={styles.menuText}>Mes favoris</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <LogOut size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  header: { alignItems: 'center', paddingTop: 60, paddingBottom: 30 },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(249,115,22,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#f97316' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  email: { fontSize: 14, color: '#a1a1aa', marginTop: 4 },
  premiumBadge: {
    flexDirection: 'row', alignItems: 'center', marginTop: 12,
    backgroundColor: 'rgba(249,115,22,0.1)', paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 20,
  },
  premiumText: { color: '#f97316', fontSize: 13, fontWeight: '600', marginLeft: 6 },
  menu: { paddingHorizontal: 16, marginTop: 20 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 16,
    borderBottomWidth: 0.5, borderBottomColor: '#2a2a2a',
  },
  menuText: { color: '#fff', fontSize: 16, marginLeft: 12 },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 40, paddingVertical: 16, marginHorizontal: 16,
    borderRadius: 12, borderWidth: 1, borderColor: '#ef4444',
  },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '600', marginLeft: 8 },
});
