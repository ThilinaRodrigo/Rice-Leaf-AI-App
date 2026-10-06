import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Bot } from "lucide-react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const FloatingChatButton = () => {
  const insets = useSafeAreaInsets();
  // Docked nicely right above the bottom tab bar
  const bottomPosition = Math.max(insets.bottom, 12) + 72;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => router.push("/(tabs)/chat" as any)}
      style={{
        position: "absolute",
        bottom: bottomPosition,
        right: 16,
        zIndex: 99,
        shadowColor: "#059669",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 10,
      }}
      className="flex-row items-center bg-emerald-800 border-2 border-emerald-500/40 rounded-2xl px-3.5 py-2.5 space-x-2"
    >
      <View className="w-8.5 h-8.5 rounded-xl bg-emerald-700/90 border border-emerald-400/30 items-center justify-center relative">
        <Bot size={20} color="#A7F3D0" />
        <View className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-emerald-900" />
      </View>
      <View className="pr-1">
        <Text className="text-white text-xs font-black tracking-wide">
          AI Doctor
        </Text>
        <Text className="text-emerald-200 text-[9px] font-bold">
          Gemini Pro
        </Text>
      </View>
    </TouchableOpacity>
  );
};
