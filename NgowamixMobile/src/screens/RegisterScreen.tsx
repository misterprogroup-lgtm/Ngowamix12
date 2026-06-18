import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Email et mot de passe requis');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erreur', 'Mot de passe trop court (min 6)');
      return;
    }
    setLoading(true);
    try {
      await register({ email, password, firstName: firstName || undefined, lastName: lastName || undefined });
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Inscription échouée');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Ngowamix</Text>
        <Text style={styles.subtitle}>Crée ton compte</Text>

        <TextInput
          style={styles.input}
          placeholder="Prénom"
          placeholderTextColor="#666"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Nom"
          placeholderTextColor="#666"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>S'inscrire</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#f97316', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#a1a1aa', textAlign: 'center', marginBottom: 32 },
  input: {
    backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, fontSize: 16,
    color: '#fff', marginBottom: 12, borderWidth: 1, borderColor: '#2a2a2a',
  },
  button: {
    backgroundColor: '#f97316', borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 8,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#f97316', textAlign: 'center', marginTop: 16, fontSize: 14 },
});
