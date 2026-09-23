import { Buffer } from "buffer";
(globalThis as any).Buffer = (globalThis as any).Buffer || Buffer;

import { Stack } from "expo-router";
import './global.css';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} >
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
