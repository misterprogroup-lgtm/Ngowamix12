import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName?: string; lastName?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const stored = await AsyncStorage.getItem('ngowamix_user');
      const token = await AsyncStorage.getItem('ngowamix_session');
      if (stored && token) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        api.setToken(token);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.login(email, password);
    api.setToken(data.token);
    await AsyncStorage.setItem('ngowamix_session', data.token);
    await AsyncStorage.setItem('ngowamix_user', JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const register = useCallback(async (data: { email: string; password: string; firstName?: string; lastName?: string }) => {
    const result = await api.register(data);
    api.setToken(result.token);
    await AsyncStorage.setItem('ngowamix_session', result.token);
    await AsyncStorage.setItem('ngowamix_user', JSON.stringify(result.user));
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    api.setToken(null);
    await AsyncStorage.multiRemove(['ngowamix_session', 'ngowamix_user']);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
