import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { PlayerProvider } from './src/contexts/PlayerContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </PlayerProvider>
    </AuthProvider>
  );
}
