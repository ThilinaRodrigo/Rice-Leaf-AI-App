import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { UserCheck, Lock, ArrowLeft, Leaf, ShieldCheck, Eye, EyeOff } from "lucide-react-native";
import { useAuth } from "@/context/AuthContext";

export default function LoginScreen() {
  const { login, isLoading } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    if (!identifier || !password) {
      setErrorMessage("Please enter both Email / NIC and Password.");
      return;
    }

    setErrorMessage("");
    try {
      await login(identifier, password);
      router.replace("/(tabs)");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in. Check your credentials.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-emerald-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 20}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 300 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={true}
          className="px-6 py-4"
        >
          {/* Top Bar */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-emerald-800/80 items-center justify-center mb-6"
          >
            <ArrowLeft size={20} color="#fff" />
          </TouchableOpacity>

          {/* Branding Header */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-3xl bg-emerald-700/80 items-center justify-center mb-4 border border-emerald-500/30">
              <Leaf size={42} color="#4ade80" />
            </View>
            <Text className="text-3xl font-extrabold text-white text-center">
              Rice Leaf AI
            </Text>
            <Text className="text-emerald-200 text-sm mt-1 text-center">
              Smart Diagnostics & Agro Marketplace
            </Text>
          </View>

          {/* Form Card */}
          <View className="bg-white rounded-3xl p-6">
            <Text className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</Text>
            <Text className="text-gray-500 text-sm mb-6">
              Sign in with your Email Address or NIC Number
            </Text>

            {errorMessage ? (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <Text className="text-red-600 text-xs font-medium text-center">
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Email or NIC Field */}
            <Text className="text-gray-700 text-xs font-semibold uppercase mb-2">
              Email Address or NIC Number
            </Text>
            <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 mb-4 border border-gray-200 focus:border-emerald-600">
              <UserCheck size={20} color="#6b7280" />
              <TextInput
                value={identifier}
                onChangeText={setIdentifier}
                placeholder="farmer@example.com or 991234567V"
                keyboardType="email-address"
                autoCapitalize="none"
                className="ml-3 flex-1 text-gray-900 text-base"
              />
            </View>

            {/* Password Field */}
            <Text className="text-gray-700 text-xs font-semibold uppercase mb-2">
              Password
            </Text>
            <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 mb-6 border border-gray-200 focus:border-emerald-600">
              <Lock size={20} color="#6b7280" />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                className="ml-3 flex-1 text-gray-900 text-base"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                {showPassword ? (
                  <EyeOff size={20} color="#6b7280" />
                ) : (
                  <Eye size={20} color="#6b7280" />
                )}
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className="bg-emerald-600 py-4 rounded-2xl items-center active:opacity-90 mb-4"
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-lg">Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Switch to Register */}
            <View className="flex-row justify-center items-center mt-2">
              <Text className="text-gray-500 text-sm">Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/register" as const)}>
                <Text className="text-emerald-700 font-bold text-sm">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer security tag */}
          <View className="flex-row items-center justify-center mt-auto py-6">
            <ShieldCheck size={16} color="#6ee7b7" />
            <Text className="text-emerald-200 text-xs ml-1 font-medium">
              Secure Sri Lankan Agricultural Network
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
