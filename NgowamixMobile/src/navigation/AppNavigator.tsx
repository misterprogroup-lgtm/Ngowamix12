import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Compass, Radio, MessageCircle, User, LayoutDashboard, Disc3, Ticket, Wallet, Settings } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import LivestreamScreen from '../screens/LivestreamScreen';
import AlbumDetailScreen from '../screens/AlbumDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ArtistDashboardScreen from '../screens/ArtistDashboardScreen';
import ArtistAlbumsScreen from '../screens/ArtistAlbumsScreen';
import RevenueScreen from '../screens/RevenueScreen';
import ManageConcertsScreen from '../screens/ManageConcertsScreen';
import ArtistSettingsScreen from '../screens/ArtistSettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ListenerTabs() {
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

function ArtistTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0f0f0f', borderTopColor: '#2a2a2a', paddingBottom: 8, height: 60 },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500' },
      }}
    >
      <Tab.Screen
        name="ArtistDashboard"
        component={ArtistDashboardScreen}
        options={{ tabBarLabel: 'Dashboard', tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }}
      />
      <Tab.Screen
        name="ArtistAlbums"
        component={ArtistAlbumsScreen}
        options={{ tabBarLabel: 'Albums', tabBarIcon: ({ color, size }) => <Disc3 color={color} size={size} /> }}
      />
      <Tab.Screen
        name="ArtistConcerts"
        component={ManageConcertsScreen}
        options={{ tabBarLabel: 'Concerts', tabBarIcon: ({ color, size }) => <Ticket color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Revenue"
        component={RevenueScreen}
        options={{ tabBarLabel: 'Revenus', tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} /> }}
      />
      <Tab.Screen
        name="ArtistSettings"
        component={ArtistSettingsScreen}
        options={{ tabBarLabel: 'Profil', tabBarIcon: ({ color, size }) => <Settings color={color} size={size} /> }}
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
            <Stack.Screen
              name="Main"
              component={user.role === 'ARTIST' ? ArtistTabs : ListenerTabs}
            />
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
