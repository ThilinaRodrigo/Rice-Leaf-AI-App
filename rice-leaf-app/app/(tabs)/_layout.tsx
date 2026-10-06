import React from "react";
import { Tabs } from "expo-router";
import { Home, ShoppingBag, User, MessageCircle, Scan, Users } from "lucide-react-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLanguage } from "@/context/LanguageContext";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  const bottomMargin = Math.max(insets.bottom, 12) + 8;

  return (
    <Tabs
      backBehavior="history"
      screenOptions={{
        tabBarActiveTintColor: "#059669",
        tabBarInactiveTintColor: "#64748B",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderRadius: 30,
          marginHorizontal: 12,
          bottom: bottomMargin,
          height: 60,
          position: "absolute",
          borderWidth: 1,
          borderColor: "#E2E8F0",
          paddingBottom: 6,
          paddingTop: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
        },
      }}
    >
      {/* 1. Home */}
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: t("home"),
          tabBarIcon: ({ color }) => <Home size={20} color={color} />,
        }}
      />

      {/* 2. Community */}
      <Tabs.Screen
        name="community"
        options={{
          headerShown: false,
          title: t("community"),
          tabBarIcon: ({ color }) => <Users size={20} color={color} />,
        }}
      />

      {/* 3. Scan - Center Hero Action */}
      <Tabs.Screen
        name="scan"
        options={{
          headerShown: false,
          title: t("scan"),
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`w-11 h-11 rounded-full items-center justify-center -mt-3 shadow-md ${
                focused
                  ? "bg-emerald-800 border-2 border-emerald-400 shadow-emerald-900/40"
                  : "bg-emerald-700 border border-emerald-500/60"
              }`}
            >
              <Scan size={22} color="#FFFFFF" />
            </View>
          ),
        }}
      />

      {/* 4. Market */}
      <Tabs.Screen
        name="market"
        options={{
          headerShown: false,
          title: t("market"),
          tabBarIcon: ({ color }) => <ShoppingBag size={20} color={color} />,
        }}
      />

      {/* 5. Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          title: t("profile"),
          tabBarIcon: ({ color }) => <User size={20} color={color} />,
        }}
      />

      {/* Hidden Screens (accessible via router) */}
      <Tabs.Screen
        name="chat"
        options={{
          headerShown: false,
          href: null,
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
