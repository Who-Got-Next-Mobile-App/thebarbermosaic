import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { colors, spacing } from '../theme';
import {
  AuthStackParamList,
  ProOnboardingParamList,
  ClientOnboardingParamList,
  ProMainTabParamList,
  ClientMainTabParamList,
  ProStackParamList,
  ClientStackParamList,
} from '../types';

// ─── Screen imports (filled in by their feature PRs) ─────────────────────────
// Auth
import { WelcomeScreen } from '../screens/auth/WelcomeScreen';
import { ProCreateAccountScreen } from '../screens/auth/ProCreateAccountScreen';
import { ClientCreateAccountScreen } from '../screens/auth/ClientCreateAccountScreen';

// Pro Onboarding
import { ChooseProfessionScreen } from '../screens/pro/onboarding/ChooseProfessionScreen';
import { BuildProfileScreen } from '../screens/pro/onboarding/BuildProfileScreen';
import { PickBadgesScreen } from '../screens/pro/onboarding/PickBadgesScreen';
import { AddServicesScreen } from '../screens/pro/onboarding/AddServicesScreen';
import { SetAvailabilityScreen } from '../screens/pro/onboarding/SetAvailabilityScreen';
import { ConnectBankScreen } from '../screens/pro/onboarding/ConnectBankScreen';
import { PainQuestionScreen } from '../screens/pro/onboarding/PainQuestionScreen';
import { TheRealNumberScreen } from '../screens/pro/onboarding/TheRealNumberScreen';
import { FreeTrialOfferScreen } from '../screens/pro/onboarding/FreeTrialOfferScreen';
import { YouAreLiveScreen } from '../screens/pro/onboarding/YouAreLiveScreen';

// Client Onboarding
import { WhatAreYouLookingForScreen } from '../screens/client/onboarding/WhatAreYouLookingForScreen';
import { EnableLocationScreen } from '../screens/client/onboarding/EnableLocationScreen';
import { TurnOnNotificationsScreen } from '../screens/client/onboarding/TurnOnNotificationsScreen';

// Pro Main
import { ProDashboardScreen } from '../screens/pro/dashboard/ProDashboardScreen';
import { ProCalendarScreen } from '../screens/pro/dashboard/ProCalendarScreen';
import { ProClientsScreen } from '../screens/pro/dashboard/ProClientsScreen';
import { ProIncomeScreen } from '../screens/pro/dashboard/ProIncomeScreen';
import { ProProfileScreen } from '../screens/pro/dashboard/ProProfileScreen';
import { AppointmentDetailScreen } from '../screens/pro/dashboard/AppointmentDetailScreen';
import { ServiceManagerScreen } from '../screens/pro/dashboard/ServiceManagerScreen';
import { AddEditServiceScreen } from '../screens/pro/dashboard/AddEditServiceScreen';
import { AvailabilityManagerScreen } from '../screens/pro/dashboard/AvailabilityManagerScreen';
import { BadgeManagerScreen } from '../screens/pro/dashboard/BadgeManagerScreen';
import { PortfolioScreen } from '../screens/pro/dashboard/PortfolioScreen';
import { PromoCodeManagerScreen } from '../screens/pro/dashboard/PromoCodeManagerScreen';
import { TaxFlowDashboardScreen } from '../screens/pro/dashboard/TaxFlowDashboardScreen';
import { StudioDashboardScreen } from '../screens/pro/dashboard/StudioDashboardScreen';
import { ClientDetailScreen } from '../screens/pro/dashboard/ClientDetailScreen';
import { ProSettingsScreen } from '../screens/pro/dashboard/ProSettingsScreen';

// Client Main
import { DiscoveryScreen } from '../screens/client/DiscoveryScreen';
import { ClientBookingsScreen } from '../screens/client/ClientBookingsScreen';
import { MessagesListScreen } from '../screens/client/MessagesListScreen';
import { ClientProfileScreen } from '../screens/client/ClientProfileScreen';
import { ProfessionalProfileScreen } from '../screens/client/ProfessionalProfileScreen';
import { BookingFlowScreen } from '../screens/client/BookingFlowScreen';
import { BookingConfirmationScreen } from '../screens/client/BookingConfirmationScreen';
import { AppointmentHistoryDetailScreen } from '../screens/client/AppointmentHistoryDetailScreen';
import { TipScreen } from '../screens/client/TipScreen';
import { ReviewScreen } from '../screens/client/ReviewScreen';
import { MessageThreadScreen } from '../screens/client/MessageThreadScreen';
import { ClientSettingsScreen } from '../screens/client/ClientSettingsScreen';
import { FavoritesScreen } from '../screens/client/FavoritesScreen';

// ─── Navigators ───────────────────────────────────────────────────────────────

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const ProOnboardingStack = createNativeStackNavigator<ProOnboardingParamList>();
const ClientOnboardingStack = createNativeStackNavigator<ClientOnboardingParamList>();
const ProMainTab = createBottomTabNavigator<ProMainTabParamList>();
const ClientMainTab = createBottomTabNavigator<ClientMainTabParamList>();
const ProStack = createNativeStackNavigator<ProStackParamList>();
const ClientStack = createNativeStackNavigator<ClientStackParamList>();

// ─── Auth Stack ───────────────────────────────────────────────────────────────

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    <AuthStack.Screen name="ProCreateAccount" component={ProCreateAccountScreen} />
    <AuthStack.Screen name="ClientCreateAccount" component={ClientCreateAccountScreen} />
  </AuthStack.Navigator>
);

// ─── Pro Onboarding Stack ─────────────────────────────────────────────────────

const ProOnboardingNavigator = () => (
  <ProOnboardingStack.Navigator screenOptions={{ headerShown: false }}>
    <ProOnboardingStack.Screen name="ChooseProfession" component={ChooseProfessionScreen} />
    <ProOnboardingStack.Screen name="BuildProfile" component={BuildProfileScreen} />
    <ProOnboardingStack.Screen name="PickBadges" component={PickBadgesScreen} />
    <ProOnboardingStack.Screen name="AddServices" component={AddServicesScreen} />
    <ProOnboardingStack.Screen name="SetAvailability" component={SetAvailabilityScreen} />
    <ProOnboardingStack.Screen name="ConnectBank" component={ConnectBankScreen} />
    <ProOnboardingStack.Screen name="PainQuestion" component={PainQuestionScreen} />
    <ProOnboardingStack.Screen name="TheRealNumber" component={TheRealNumberScreen} />
    <ProOnboardingStack.Screen name="FreeTrialOffer" component={FreeTrialOfferScreen} />
    <ProOnboardingStack.Screen name="YouAreLive" component={YouAreLiveScreen} />
  </ProOnboardingStack.Navigator>
);

// ─── Client Onboarding Stack ──────────────────────────────────────────────────

const ClientOnboardingNavigator = () => (
  <ClientOnboardingStack.Navigator screenOptions={{ headerShown: false }}>
    <ClientOnboardingStack.Screen name="WhatAreYouLookingFor" component={WhatAreYouLookingForScreen} />
    <ClientOnboardingStack.Screen name="EnableLocation" component={EnableLocationScreen} />
    <ClientOnboardingStack.Screen name="TurnOnNotifications" component={TurnOnNotificationsScreen} />
  </ClientOnboardingStack.Navigator>
);

// ─── Pro Main Tabs ────────────────────────────────────────────────────────────

type ProTabIconName = keyof typeof Ionicons.glyphMap;

const proTabIcons: Record<keyof ProMainTabParamList, [ProTabIconName, ProTabIconName]> = {
  DashboardTab: ['grid', 'grid-outline'],
  CalendarTab: ['calendar', 'calendar-outline'],
  ClientsTab: ['people', 'people-outline'],
  IncomeTab: ['bar-chart', 'bar-chart-outline'],
  ProProfileTab: ['person', 'person-outline'],
};

const proTabLabels: Record<keyof ProMainTabParamList, string> = {
  DashboardTab: 'Dashboard',
  CalendarTab: 'Calendar',
  ClientsTab: 'Clients',
  IncomeTab: 'Income',
  ProProfileTab: 'Profile',
};

const ProTabs = () => (
  <ProMainTab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: colors.tabActive,
      tabBarInactiveTintColor: colors.tabInactive,
      tabBarLabelStyle: styles.tabLabel,
      tabBarIcon: ({ focused, color, size }) => {
        const [activeIcon, inactiveIcon] = proTabIcons[route.name as keyof ProMainTabParamList];
        return <Ionicons name={focused ? activeIcon : inactiveIcon} size={22} color={color} />;
      },
      tabBarLabel: proTabLabels[route.name as keyof ProMainTabParamList],
    })}
  >
    <ProMainTab.Screen name="DashboardTab" component={ProDashboardScreen} />
    <ProMainTab.Screen name="CalendarTab" component={ProCalendarScreen} />
    <ProMainTab.Screen name="ClientsTab" component={ProClientsScreen} />
    <ProMainTab.Screen name="IncomeTab" component={ProIncomeScreen} />
    <ProMainTab.Screen name="ProProfileTab" component={ProProfileScreen} />
  </ProMainTab.Navigator>
);

// ─── Pro Main Stack ───────────────────────────────────────────────────────────

const ProNavigator = () => (
  <ProStack.Navigator screenOptions={{ headerShown: false }}>
    <ProStack.Screen name="ProTabs" component={ProTabs} />
    <ProStack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
    <ProStack.Screen name="ServiceManager" component={ServiceManagerScreen} />
    <ProStack.Screen name="AddEditService" component={AddEditServiceScreen} />
    <ProStack.Screen name="AvailabilityManager" component={AvailabilityManagerScreen} />
    <ProStack.Screen name="BadgeManager" component={BadgeManagerScreen} />
    <ProStack.Screen name="Portfolio" component={PortfolioScreen} />
    <ProStack.Screen name="PromoCodeManager" component={PromoCodeManagerScreen} />
    <ProStack.Screen name="TaxFlowDashboard" component={TaxFlowDashboardScreen} />
    <ProStack.Screen name="StudioDashboard" component={StudioDashboardScreen} />
    <ProStack.Screen name="ClientDetail" component={ClientDetailScreen} />
    <ProStack.Screen name="Settings" component={ProSettingsScreen} />
  </ProStack.Navigator>
);

// ─── Client Main Tabs ─────────────────────────────────────────────────────────

type ClientTabIconName = keyof typeof Ionicons.glyphMap;

const clientTabIcons: Record<keyof ClientMainTabParamList, [ClientTabIconName, ClientTabIconName]> = {
  DiscoveryTab: ['search', 'search-outline'],
  BookingsTab: ['calendar', 'calendar-outline'],
  MessagesTab: ['chatbubbles', 'chatbubbles-outline'],
  ClientProfileTab: ['person', 'person-outline'],
};

const clientTabLabels: Record<keyof ClientMainTabParamList, string> = {
  DiscoveryTab: 'Discover',
  BookingsTab: 'Bookings',
  MessagesTab: 'Messages',
  ClientProfileTab: 'Profile',
};

const ClientTabs = () => (
  <ClientMainTab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: colors.tabActive,
      tabBarInactiveTintColor: colors.tabInactive,
      tabBarLabelStyle: styles.tabLabel,
      tabBarIcon: ({ focused, color }) => {
        const [activeIcon, inactiveIcon] = clientTabIcons[route.name as keyof ClientMainTabParamList];
        return <Ionicons name={focused ? activeIcon : inactiveIcon} size={22} color={color} />;
      },
      tabBarLabel: clientTabLabels[route.name as keyof ClientMainTabParamList],
    })}
  >
    <ClientMainTab.Screen name="DiscoveryTab" component={DiscoveryScreen} />
    <ClientMainTab.Screen name="BookingsTab" component={ClientBookingsScreen} />
    <ClientMainTab.Screen name="MessagesTab" component={MessagesListScreen} />
    <ClientMainTab.Screen name="ClientProfileTab" component={ClientProfileScreen} />
  </ClientMainTab.Navigator>
);

// ─── Client Main Stack ────────────────────────────────────────────────────────

const ClientNavigator = () => (
  <ClientStack.Navigator screenOptions={{ headerShown: false }}>
    <ClientStack.Screen name="ClientTabs" component={ClientTabs} />
    <ClientStack.Screen name="ProfessionalProfile" component={ProfessionalProfileScreen} />
    <ClientStack.Screen name="BookingFlow" component={BookingFlowScreen} />
    <ClientStack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} />
    <ClientStack.Screen name="AppointmentHistoryDetail" component={AppointmentHistoryDetailScreen} />
    <ClientStack.Screen name="TipScreen" component={TipScreen} />
    <ClientStack.Screen name="ReviewScreen" component={ReviewScreen} />
    <ClientStack.Screen name="MessageThread" component={MessageThreadScreen} />
    <ClientStack.Screen name="ClientSettings" component={ClientSettingsScreen} />
    <ClientStack.Screen name="Favorites" component={FavoritesScreen} />
  </ClientStack.Navigator>
);

// ─── Loading Screen ───────────────────────────────────────────────────────────

const LoadingScreen = () => (
  <View style={styles.loading}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

// ─── Root Navigator ───────────────────────────────────────────────────────────

export const AppNavigator = () => {
  const { isAuthLoading, firebaseUser, role, onboardingComplete } = useAuth();

  if (isAuthLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {!firebaseUser ? (
        <AuthNavigator />
      ) : role === 'barber' && !onboardingComplete ? (
        <ProOnboardingNavigator />
      ) : role === 'client' && !onboardingComplete ? (
        <ClientOnboardingNavigator />
      ) : role === 'barber' ? (
        <ProNavigator />
      ) : (
        <ClientNavigator />
      )}
    </NavigationContainer>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingBottom: spacing.sm,
    paddingTop: spacing.xs,
    height: 70,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
});
