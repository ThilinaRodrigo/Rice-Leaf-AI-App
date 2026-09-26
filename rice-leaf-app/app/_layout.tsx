import { Buffer } from "buffer";
(globalThis as any).Buffer = (globalThis as any).Buffer || Buffer;

import { useState } from "react";
import { Stack } from "expo-router";
import './global.css';
import { AuthProvider } from "@/context/AuthContext";
import SplashScreen from "@/components/SplashScreen";

export { ErrorBoundary } from 'expo-router';

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="camera" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="shop-ads" />
        <Stack.Screen name="create-post" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack>

      {/* Animated splash renders on top until finished */}
      {!splashDone && (
        <SplashScreen onFinish={() => setSplashDone(true)} />
      )}
    </AuthProvider>
  );
}
