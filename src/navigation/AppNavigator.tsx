import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

import {
  LoginScreen,
  SignUpScreen,
  HomeScreen,
  ServicesScreen,
  BookingScreen,
  BookingsListScreen,
  ProfileScreen,
} from '../screens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="SignUp" component={SignUpScreen} />
  </Stack.Navigator>
);

const HomeTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        paddingBottom: 8,
        paddingTop: 8,
        height: 70,
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: keyof typeof Ionicons.glyphMap;

        switch (route.name) {
          case 'HomeTab':
            iconName = focused ? 'home' : 'home-outline';
            break;
          case 'ServicesTab':
            iconName = focused ? 'cut' : 'cut-outline';
            break;
          case 'BookingsTab':
            iconName = focused ? 'calendar' : 'calendar-outline';
            break;
          case 'ProfileTab':
            iconName = focused ? 'person' : 'person-outline';
            break;
          default:
            iconName = 'help-outline';
        }

        return <Ionicons name={iconName} size={24} color={color} />;
      },
    })}
  >
    <Tab.Screen 
      name="HomeTab" 
      component={HomeScreen}
      options={{ tabBarLabel: 'Home' }}
    />
    <Tab.Screen 
      name="ServicesTab" 
      component={ServicesScreen}
      options={{ tabBarLabel: 'Services' }}
    />
    <Tab.Screen 
      name="BookingsTab" 
      component={BookingsListScreen}
      options={{ tabBarLabel: 'Bookings' }}
    />
    <Tab.Screen 
      name="ProfileTab" 
      component={ProfileScreen}
      options={{ tabBarLabel: 'Profile' }}
    />
  </Tab.Navigator>
);

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HomeTabs" component={HomeTabs} />
    <Stack.Screen name="Services" component={ServicesScreen} />
    <Stack.Screen name="Booking" component={BookingScreen} />
    <Stack.Screen name="BookingsList" component={BookingsListScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

export const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

