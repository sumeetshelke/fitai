import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';

import WelcomeScreen from './src/screens/WelcomeScreen';
import SignupScreen from './src/screens/SignupScreen';
import LoginScreen from './src/screens/LoginScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import FoodScreen from './src/screens/FoodScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import VitaminsScreen from './src/screens/VitaminsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  HomeTab: 'H',
  FoodTab: 'F',
  WorkoutTab: 'W',
  VitaminsTab: 'V',
};

function MainTabs() {
  const { themeColors: colors } = useApp();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0.5,
          borderTopColor: colors.border,
          paddingBottom: 8,
          paddingTop: 6,
          height: 66,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused }) => (
          <Text style={{
            fontSize: 13,
            fontWeight: '700',
            color: focused ? colors.primary : colors.textMuted,
            backgroundColor: focused ? colors.primaryLight : 'transparent',
            minWidth: 28,
            height: 28,
            borderRadius: 14,
            textAlign: 'center',
            lineHeight: 28,
          }}>{TAB_ICONS[route.name]}</Text>
        ),
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="FoodTab" component={FoodScreen} options={{ tabBarLabel: 'Food' }} />
      <Tab.Screen name="WorkoutTab" component={WorkoutScreen} options={{ tabBarLabel: 'Workout' }} />
      <Tab.Screen name="VitaminsTab" component={VitaminsScreen} options={{ tabBarLabel: 'Vitamins' }} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { authReady, user, themeMode, themeColors: colors } = useApp();

  if (!authReady) {
    return <Text style={{ flex: 1, color: colors.textPrimary, backgroundColor: colors.background, textAlign: 'center', paddingTop: 80 }}>Loading...</Text>;
  }

  return (
    <Stack.Navigator key={`${themeMode}-${user?.id || 'guest'}`} initialRouteName={user ? 'MainTabs' : 'Welcome'} screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ThemedNavigation />
    </AppProvider>
  );
}

function ThemedNavigation() {
  const { themeColors: colors } = useApp();
  const navTheme = {
    dark: colors.background === '#0B1120',
    colors: {
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.textPrimary,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <AppNavigator />
    </NavigationContainer>
  );
}
