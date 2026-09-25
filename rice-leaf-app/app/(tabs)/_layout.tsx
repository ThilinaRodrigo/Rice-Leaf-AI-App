import React from "react";
import { Tabs } from "expo-router";
import { Home, ShoppingBag, User, MessageCircle, Scan } from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomMargin = Math.max(insets.bottom, 12) + 8;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#059669",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarStyle: {
          backgroundColor: "#0F172A",
          borderRadius: 30,
          marginHorizontal: 16,
          bottom: bottomMargin,
          height: 60,
          position: "absolute",
          borderWidth: 1,
          borderColor: "#1E293B",
          paddingBottom: 6,
          paddingTop: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
          headerShown: false,
          title: "AI Scan",
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`w-10 h-10 rounded-full items-center justify-center ${
                focused ? "bg-emerald-600 border border-emerald-400" : "bg-slate-800"
              }`}
            >
              <Scan size={20} color={focused ? "#FFFFFF" : color} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="market"
        options={{
          headerShown: false,
          title: "Market",
          tabBarIcon: ({ color }) => <ShoppingBag size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          headerShown: false,
          title: "AI Chat",
          tabBarIcon: ({ color }) => <MessageCircle size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          title: "Profile",
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />

      <Tabs.Screen
        name="result"
        options={{
          headerShown: false,
          href: null,
        }}
      />
    </Tabs>
  );
}
