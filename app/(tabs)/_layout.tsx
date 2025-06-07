import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="statistic"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <AntDesign name="barschart" size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="recommend"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <MaterialIcons name="food-bank" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <FontAwesome name="user-circle-o" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
