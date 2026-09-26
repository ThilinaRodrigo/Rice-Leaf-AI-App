import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  ArrowLeft,
  User as UserIcon,
  LogOut,
  Store,
  MapPin,
  Phone,
  MessageSquare,
  LogIn,
  UserPlus,
  ShieldCheck,
  Key,
  Lock,
  X,
  Eye,
  EyeOff,
  Megaphone,
  ChevronRight,
  ShieldAlert,
} from "lucide-react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { changePassword } from "@/service/apiClient";

const Profile = () => {
  const { user, token, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters.");
      return;
    }

    if (!token) return;

    setErrorMsg("");
    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword, token);
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Success", "Your password has been changed successfully!");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50" showsVerticalScrollIndicator={false}>
      {/* Top Banner & Header */}
      <View
        style={{ paddingTop: Math.max(insets.top, 16) + 12 }}
        className="bg-emerald-800 pb-16 px-5 rounded-b-3xl border-b border-emerald-900/20 relative shadow-sm"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-emerald-700/80 border border-emerald-600 items-center justify-center"
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* User Avatar Badge */}
        <View className="absolute -bottom-12 left-1/2 -translate-x-1/2 items-center">
          <View className="w-24 h-24 rounded-3xl bg-white border-4 border-emerald-600 items-center justify-center shadow-md relative overflow-hidden">
            <UserIcon size={48} color="#059669" />
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      <View className="mt-16 px-5 mb-32 space-y-6">
        {user ? (
          <>
            {/* Identity Header */}
            <View className="items-center mb-2">
              <Text className="text-2xl font-black text-gray-900 text-center">
                {user.full_name}
              </Text>
              <Text className="text-gray-500 text-xs mt-0.5 mb-3">
                {user.email || user.nic || ""}
              </Text>

              {/* Role Badge */}
              <View
                className={`px-4 py-1.5 rounded-full flex-row items-center shadow-sm border ${
                  user.role === "shop_owner"
                    ? "bg-amber-100 border-amber-300 text-amber-900"
                    : user.role === "sys_admin"
                    ? "bg-purple-100 border-purple-300 text-purple-900"
                    : "bg-emerald-100 border-emerald-300 text-emerald-900"
                }`}
              >
                {user.role === "shop_owner" ? (
                  <>
                    <Store size={15} color="#D97706" />
                    <Text className="ml-2 font-bold text-amber-900 text-xs uppercase tracking-wide">
                      Agro Shop Owner
                    </Text>
                  </>
                ) : user.role === "sys_admin" ? (
                  <>
                    <ShieldCheck size={15} color="#7E22CE" />
                    <Text className="ml-2 font-bold text-purple-900 text-xs uppercase tracking-wide">
                      System Administrator
                    </Text>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={15} color="#059669" />
                    <Text className="ml-2 font-bold text-emerald-900 text-xs uppercase tracking-wide">
                      Registered Farmer
                    </Text>
                  </>
                )}
              </View>
            </View>

            {/* Shop Owner Actions Highlight */}
            {user.role === "shop_owner" && (
              <TouchableOpacity
                onPress={() => router.push("/shop-ads")}
                className="bg-amber-50 border border-amber-200/90 p-4 rounded-2xl shadow-sm flex-row items-center justify-between active:opacity-90"
              >
                <View className="flex-row items-center space-x-3">
                  <View className="w-10 h-10 rounded-xl bg-amber-100 items-center justify-center">
                    <Megaphone size={22} color="#D97706" />
                  </View>
                  <View>
                    <Text className="text-amber-900 font-black text-sm">
                      Manage My Shop Ads
                    </Text>
                    <Text className="text-amber-700/80 text-[11px]">
                      Post & update your agro product listings
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color="#D97706" />
              </TouchableOpacity>
            )}

            {/* Account Information Card */}
            <View className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-sm space-y-3">
              <Text className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-1">
                Account Information
              </Text>

              {user.nic ? (
                <View className="flex-row items-center py-1">
                  <View className="w-8 h-8 rounded-lg bg-gray-100 items-center justify-center mr-3">
                    <UserIcon size={16} color="#64748B" />
                  </View>
                  <View>
                    <Text className="text-[10px] text-gray-400 font-medium">NIC Number</Text>
                    <Text className="text-gray-900 text-xs font-semibold">{user.nic}</Text>
                  </View>
                </View>
              ) : null}

              {user.phone ? (
                <View className="flex-row items-center py-1">
                  <View className="w-8 h-8 rounded-lg bg-gray-100 items-center justify-center mr-3">
                    <Phone size={16} color="#64748B" />
                  </View>
                  <View>
                    <Text className="text-[10px] text-gray-400 font-medium">Phone Number</Text>
                    <Text className="text-gray-900 text-xs font-semibold">{user.phone}</Text>
                  </View>
                </View>
              ) : null}

              {user.district ? (
                <View className="flex-row items-center py-1">
                  <View className="w-8 h-8 rounded-lg bg-gray-100 items-center justify-center mr-3">
                    <MapPin size={16} color="#64748B" />
                  </View>
                  <View>
                    <Text className="text-[10px] text-gray-400 font-medium">Location</Text>
                    <Text className="text-gray-900 text-xs font-semibold">
                      {user.district} {user.city ? `, ${user.city}` : ""}
                    </Text>
                  </View>
                </View>
              ) : null}

              {user.role === "shop_owner" && (
                <>
                  <View className="flex-row items-center py-1">
                    <View className="w-8 h-8 rounded-lg bg-amber-50 items-center justify-center mr-3">
                      <Store size={16} color="#D97706" />
                    </View>
                    <View>
                      <Text className="text-[10px] text-gray-400 font-medium">Agro Shop Name</Text>
                      <Text className="text-amber-800 text-xs font-bold">
                        {user.shop_name || "N/A"}
                      </Text>
                    </View>
                  </View>

                  {user.whatsapp_number ? (
                    <View className="flex-row items-center py-1">
                      <View className="w-8 h-8 rounded-lg bg-emerald-50 items-center justify-center mr-3">
                        <MessageSquare size={16} color="#059669" />
                      </View>
                      <View>
                        <Text className="text-[10px] text-gray-400 font-medium">
                          WhatsApp Contact
                        </Text>
                        <Text className="text-emerald-800 text-xs font-semibold">
                          {user.whatsapp_number}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </>
              )}
            </View>

            {/* Account Settings & Security Options */}
            <View className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm space-y-2">
              <Text className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-2">
                Security & Preferences
              </Text>

              <TouchableOpacity
                onPress={() => setShowPasswordModal(true)}
                className="bg-gray-50 border border-gray-200/80 p-3.5 rounded-xl flex-row items-center justify-between active:opacity-80"
              >
                <View className="flex-row items-center space-x-3">
                  <View className="w-8 h-8 rounded-lg bg-emerald-50 items-center justify-center">
                    <Key size={16} color="#059669" />
                  </View>
                  <Text className="text-gray-900 font-bold text-xs">Change Password</Text>
                </View>
                <ChevronRight size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Sign Out Action */}
            <TouchableOpacity
              onPress={logout}
              className="bg-white border border-red-200 p-4 rounded-2xl flex-row items-center justify-center shadow-sm active:opacity-80"
            >
              <LogOut size={18} color="#EF4444" />
              <Text className="text-red-600 font-bold text-sm ml-2">Sign Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* Guest State Prompt */
          <View className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm items-center">
            <Text className="text-xl font-black text-gray-900 mb-2 text-center">
              Sign In to Your Account
            </Text>
            <Text className="text-gray-500 text-xs mb-6 text-center leading-relaxed">
              Connect with local agro stores, post product listings, and save your rice leaf scan history.
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/login")}
              className="bg-emerald-800 py-3.5 px-6 rounded-2xl flex-row items-center justify-center w-full shadow-md active:opacity-90 mb-3"
            >
              <LogIn size={18} color="#fff" />
              <Text className="text-white font-bold text-sm ml-2">Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/register")}
              className="bg-emerald-50 border border-emerald-200 py-3.5 px-6 rounded-2xl flex-row items-center justify-center w-full active:opacity-90"
            >
              <UserPlus size={18} color="#059669" />
              <Text className="text-emerald-800 font-bold text-sm ml-2">
                Create Account (Farmer / Shop Owner)
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Change Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View className="flex-1 bg-black/60 items-center justify-center p-4">
          <View className="bg-white border border-gray-200 w-full max-w-md p-6 rounded-3xl shadow-xl relative">
            <TouchableOpacity
              onPress={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-400"
            >
              <X size={20} color="#64748B" />
            </TouchableOpacity>

            <View className="flex-row items-center mb-1">
              <Key size={20} color="#059669" />
              <Text className="text-lg font-bold text-gray-900 ml-2">Change Password</Text>
            </View>
            <Text className="text-xs text-gray-500 mb-5">
              Enter your current password and a new secure password.
            </Text>

            {errorMsg ? (
              <View className="bg-red-50 border border-red-200 p-3 rounded-xl mb-4">
                <Text className="text-red-600 text-xs font-semibold text-center">
                  {errorMsg}
                </Text>
              </View>
            ) : null}

            {/* Current Password Input */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-600 uppercase mb-1">
                Current Password
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
                <Lock size={16} color="#94A3B8" />
                <TextInput
                  secureTextEntry={!showCurrent}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  className="flex-1 ml-2 text-gray-900 text-sm"
                />
                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} className="p-1">
                  {showCurrent ? <EyeOff size={16} color="#64748B" /> : <Eye size={16} color="#64748B" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password Input */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-600 uppercase mb-1">
                New Password (min 6 chars)
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
                <Lock size={16} color="#94A3B8" />
                <TextInput
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  className="flex-1 ml-2 text-gray-900 text-sm"
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)} className="p-1">
                  {showNew ? <EyeOff size={16} color="#64748B" /> : <Eye size={16} color="#64748B" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm New Password Input */}
            <View className="mb-6">
              <Text className="text-xs font-bold text-gray-600 uppercase mb-1">
                Confirm New Password
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
                <Lock size={16} color="#94A3B8" />
                <TextInput
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  className="flex-1 ml-2 text-gray-900 text-sm"
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} className="p-1">
                  {showConfirm ? <EyeOff size={16} color="#64748B" /> : <Eye size={16} color="#64748B" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowPasswordModal(false)}
                className="flex-1 bg-gray-100 py-3 rounded-xl items-center"
              >
                <Text className="font-bold text-gray-700 text-xs">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={loading}
                className="flex-1 bg-emerald-600 py-3 rounded-xl items-center shadow-md active:opacity-90"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="font-bold text-white text-xs">Save Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Profile;

