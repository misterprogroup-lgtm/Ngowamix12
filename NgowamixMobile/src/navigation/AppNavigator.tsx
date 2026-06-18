import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Compass, Radio, MessageCircle, User } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import LivestreamScreen from '../screens/LivestreamScreen';
import AlbumDetailScreen from '../screens/AlbumDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0f0f0f', borderTopColor: '#2a2a2a', paddingBottom: 8, height: 60 },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Accueil', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tab.Screen
        name="ExploreTab"
        component={HomeScreen}
        options={{ tabBarLabel: 'Explorer', tabBarIcon: ({ color, size }) => <Compass color={color} size={size} /> }}
      />
      <Tab.Screen
        name="LivestreamTab"
        component={LivestreamScreen}
        options={{ tabBarLabel: 'Live', tabBarIcon: ({ color, size }) => <Radio color={color} size={size} /> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profil', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={HomeTabs} />
            <Stack.Screen name="AlbumDetail" component={AlbumDetailScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
