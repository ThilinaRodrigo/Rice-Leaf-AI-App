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
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  Store,
  MapPin,
  MessageSquare,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Camera,
} from "lucide-react-native";
import { useAuth, UserRole } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { uploadUserAvatar } from "@/service/apiClient";

export default function RegisterScreen() {
  const { register, isLoading } = useAuth();
  const { t } = useLanguage();

  const [role, setRole] = useState<UserRole>("farmer");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [nic, setNic] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");

  // Avatar state
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Shop Owner fields
  const [shopName, setShopName] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [whatsAppNumber, setWhatsAppNumber] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const pickAvatarImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      if (asset.base64) {
        setAvatarUri(`data:image/jpeg;base64,${asset.base64}`);
      } else {
        setAvatarUri(asset.uri);
      }
    }
  };

  const handleRegister = async () => {
    if (!fullName || !password) {
      setErrorMessage("Please enter your Full Name and Password.");
      return;
    }

    if (role === "farmer" && !nic) {
      setErrorMessage("Please enter your NIC Number (required for farmers).");
      return;
    }

    if (role === "shop_owner") {
      if (!email && !nic) {
        setErrorMessage("Please enter your Email Address or NIC Number.");
        return;
      }
      if (!shopName) {
        setErrorMessage("Please enter your Shop Name.");
        return;
      }
    }

    setErrorMessage("");
    setUploadingAvatar(true);
    try {
      let uploadedAvatarUrl: string | undefined = undefined;
      if (avatarUri) {
        uploadedAvatarUrl = await uploadUserAvatar(avatarUri);
      }

      await register({
        full_name: fullName,
        email: email || undefined,
        nic: nic || undefined,
        password,
        role,
        phone,
        shop_name: shopName,
        district,
        city,
        whatsapp_number: whatsAppNumber,
        avatar_url: uploadedAvatarUrl,
      });
      router.replace("/(tabs)");
    } catch (err: any) {
      setErrorMessage(err.message || "Registration failed. Please try again.");
    } finally {
      setUploadingAvatar(false);
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
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 350 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={true}
          className="px-6 py-4"
        >
          {/* Top Bar */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-emerald-800/80 items-center justify-center mb-4"
          >
            <ArrowLeft size={20} color="#fff" />
          </TouchableOpacity>

          <View className="flex-row items-center mb-4 space-x-3">
            <View className="w-14 h-14 rounded-2xl bg-emerald-950/80 items-center justify-center border border-emerald-500/30 overflow-hidden p-1.5">
              <Image
                source={require("@/assets/images/logo.png")}
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>
            <View className="ml-3">
              <Text className="text-2xl font-extrabold text-white">{t("createAccount")}</Text>
              <Text className="text-emerald-200 text-xs">
                {t("welcomeSub")}
              </Text>
            </View>
          </View>

          {/* Form Container Card */}
          <View className="bg-white rounded-3xl p-6 mb-8">
            {/* Profile Avatar Upload (Optional) */}
            <View className="items-center mb-6">
              <TouchableOpacity
                onPress={pickAvatarImage}
                className="w-24 h-24 rounded-full bg-emerald-50 border-2 border-dashed border-emerald-500 items-center justify-center relative shadow-xs active:opacity-80"
              >
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    className="w-full h-full rounded-full"
                    resizeMode="cover"
                  />
                ) : (
                  <UserIcon size={36} color="#059669" />
                )}
                <View className="bg-emerald-700 w-8 h-8 rounded-full items-center justify-center absolute bottom-0 right-0 border-2 border-white shadow-sm">
                  <Camera size={14} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
              <Text className="text-gray-500 text-xs font-bold mt-2">
                {t("uploadPhoto")}
              </Text>
            </View>

            {/* Role Selection Segment */}
            <Text className="text-gray-700 text-xs font-semibold uppercase mb-3">
              {t("selectRole")}
            </Text>
            <View className="flex-row bg-gray-100 p-1.5 rounded-2xl mb-6 border border-gray-200">
              <TouchableOpacity
                onPress={() => setRole("farmer")}
                className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${
                  role === "farmer" ? "bg-emerald-600" : ""
                }`}
              >
                <CheckCircle2
                  size={18}
                  color={role === "farmer" ? "#fff" : "#6b7280"}
                />
                <Text
                  className={`ml-2 font-bold text-sm ${
                    role === "farmer" ? "text-white" : "text-gray-600"
                  }`}
                >
                  🌾 {t("roleFarmer")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setRole("shop_owner")}
                className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${
                  role === "shop_owner" ? "bg-emerald-600" : ""
                }`}
              >
                <Store
                  size={18}
                  color={role === "shop_owner" ? "#fff" : "#6b7280"}
                />
                <Text
                  className={`ml-2 font-bold text-sm ${
                    role === "shop_owner" ? "text-white" : "text-gray-600"
                  }`}
                >
                  🏪 {t("roleShopOwner")}
                </Text>
              </TouchableOpacity>
            </View>

            {errorMessage ? (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <Text className="text-red-600 text-xs font-medium text-center">
                  {errorMessage}
                </Text>
              </View>
            ) : null}

            {/* Common Inputs: Full Name */}
            <Text className="text-gray-700 text-xs font-semibold uppercase mb-2">
              {t("fullNameLabel")} *
            </Text>
            <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 mb-4 border border-gray-200">
              <UserIcon size={20} color="#6b7280" />
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Kamal Perera"
                className="ml-3 flex-1 text-gray-900 text-base"
              />
            </View>

            {/* NIC Number */}
            <Text className="text-gray-700 text-xs font-semibold uppercase mb-2">
              {t("nicLabel")} *
            </Text>
            <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 mb-4 border border-gray-200 focus:border-emerald-600">
              <CreditCard size={20} color="#6b7280" />
              <TextInput
                value={nic}
                onChangeText={setNic}
                placeholder="e.g. 991234567V / 199912345678"
                autoCapitalize="characters"
                className="ml-3 flex-1 text-gray-900 text-base"
              />
            </View>

            {/* Email Address */}
            <Text className="text-gray-700 text-xs font-semibold uppercase mb-2">
              {t("emailLabel")} {role === "shop_owner" ? "*" : "(Optional)"}
            </Text>
            <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 mb-4 border border-gray-200">
              <Mail size={20} color="#6b7280" />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="kamal@gmail.com"
                keyboardType="email-address"
                autoCapitalize="none"
                className="ml-3 flex-1 text-gray-900 text-base"
              />
            </View>

            {/* Password */}
            <Text className="text-gray-700 text-xs font-semibold uppercase mb-2">
              {t("passwordLabel")} * (min 6 chars)
            </Text>
            <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 mb-4 border border-gray-200">
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

            {/* Phone Number */}
            <Text className="text-gray-700 text-xs font-semibold uppercase mb-2">
              {t("phoneLabel")}
            </Text>
            <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 mb-4 border border-gray-200">
              <Phone size={20} color="#6b7280" />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="077 123 4567"
                keyboardType="phone-pad"
                className="ml-3 flex-1 text-gray-900 text-base"
              />
            </View>

            {/* Shop Owner Specific Fields */}
            {role === "shop_owner" && (
              <>
                <Text className="text-emerald-800 text-xs font-bold uppercase mb-3 mt-2">
                  🏪 {t("shopDetails")}
                </Text>

                <Text className="text-gray-700 text-xs font-semibold uppercase mb-2">
                  {t("shopNameLabel")} *
                </Text>
                <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 mb-4 border border-gray-200">
                  <Store size={20} color="#059669" />
                  <TextInput
                    value={shopName}
                    onChangeText={setShopName}
                    placeholder="Rajarata Agro Chemicals"
                    className="ml-3 flex-1 text-gray-900 text-base"
                  />
                </View>

                <Text className="text-gray-700 text-xs font-semibold uppercase mb-2">
                  {t("districtLabel")}
                </Text>
                <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 mb-4 border border-gray-200">
                  <MapPin size={20} color="#059669" />
                  <TextInput
                    value={district}
                    onChangeText={setDistrict}
                    placeholder="Polonnaruwa / Kurunegala"
                    className="ml-3 flex-1 text-gray-900 text-base"
                  />
                </View>

                <Text className="text-gray-700 text-xs font-semibold uppercase mb-2">
                  {t("whatsAppLabel")}
                </Text>
                <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 mb-4 border border-gray-200">
                  <MessageSquare size={20} color="#059669" />
                  <TextInput
                    value={whatsAppNumber}
                    onChangeText={setWhatsAppNumber}
                    placeholder="077 987 6543"
                    keyboardType="phone-pad"
                    className="ml-3 flex-1 text-gray-900 text-base"
                  />
                </View>
              </>
            )}

            {/* Farmer Specific Fields */}
            {role === "farmer" && (
              <>
                <Text className="text-gray-700 text-xs font-semibold uppercase mb-2">
                  {t("paddyDistrictLabel")}
                </Text>
                <View className="flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 mb-4 border border-gray-200">
                  <MapPin size={20} color="#6b7280" />
                  <TextInput
                    value={district}
                    onChangeText={setDistrict}
                    placeholder="Anuradhapura / Ampara"
                    className="ml-3 flex-1 text-gray-900 text-base"
                  />
                </View>
              </>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={isLoading || uploadingAvatar}
              className="bg-emerald-600 py-4 rounded-2xl items-center active:opacity-90 mt-2 mb-4"
            >
              {isLoading || uploadingAvatar ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-bold text-lg">{t("createAccount")}</Text>
              )}
            </TouchableOpacity>

            {/* Switch to Login */}
            <View className="flex-row justify-center items-center">
              <Text className="text-gray-500 text-sm">{t("alreadyHaveAccount")}{" "}</Text>
              <TouchableOpacity onPress={() => router.push("/login" as const)}>
                <Text className="text-emerald-700 font-bold text-sm">{t("signIn")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
