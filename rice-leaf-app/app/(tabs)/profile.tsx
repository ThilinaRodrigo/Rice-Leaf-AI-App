import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, Alert, ActivityIndicator } from "react-native";
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
} from "lucide-react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { changePassword } from "@/service/apiClient";

const Profile = () => {
  const { user, userToken, logout } = useAuth();

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

    if (!userToken) return;

    setErrorMsg("");
    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword, userToken);
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
    <ScrollView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-emerald-900 h-48 rounded-b-3xl p-4 justify-between shadow-md">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 w-10 h-10 rounded-full bg-emerald-800/80 items-center justify-center"
        >
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>

        {/* Avatar */}
        <View className="absolute top-24 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full bg-emerald-800 border-4 border-white items-center justify-center shadow-lg">
          <UserIcon size={52} color="#4ade80" />
        </View>
      </View>

      {/* User Info / State Container */}
      <View className="mt-16 items-center px-4 mb-28">
        {user ? (
          <>
            <Text className="text-2xl font-extrabold text-gray-900 mb-1">
              {user.full_name}
            </Text>
            <Text className="text-gray-500 mb-3">{user.email || user.nic || ""}</Text>

            {/* Role Badge */}
            <View
              className={`px-4 py-1.5 rounded-full flex-row items-center mb-6 shadow-sm ${
                user.role === "shop_owner"
                  ? "bg-amber-100"
                  : user.role === "sys_admin"
                  ? "bg-purple-100"
                  : "bg-emerald-100"
              }`}
            >
              {user.role === "shop_owner" ? (
                <>
                  <Store size={16} color="#d97706" />
                  <Text className="ml-2 font-bold text-amber-800 text-xs uppercase">
                    Agro Shop Owner
                  </Text>
                </>
              ) : user.role === "sys_admin" ? (
                <>
                  <ShieldCheck size={16} color="#7e22ce" />
                  <Text className="ml-2 font-bold text-purple-800 text-xs uppercase">
                    System Administrator
                  </Text>
                </>
              ) : (
                <>
                  <ShieldCheck size={16} color="#059669" />
                  <Text className="ml-2 font-bold text-emerald-800 text-xs uppercase">
                    Registered Farmer
                  </Text>
                </>
              )}
            </View>

            {/* Details Cards */}
            <View className="w-full bg-white rounded-2xl p-5 shadow-sm mb-4 space-y-3">
              <Text className="font-bold text-gray-900 text-base mb-2">
                Account Information
              </Text>

              {user.nic ? (
                <View className="flex-row items-center my-1">
                  <UserIcon size={18} color="#6b7280" />
                  <Text className="ml-3 text-gray-700 font-medium">
                    NIC: {user.nic}
                  </Text>
                </View>
              ) : null}

              {user.phone ? (
                <View className="flex-row items-center my-1">
                  <Phone size={18} color="#6b7280" />
                  <Text className="ml-3 text-gray-700 font-medium">
                    Phone: {user.phone}
                  </Text>
                </View>
              ) : null}

              {user.district ? (
                <View className="flex-row items-center my-1">
                  <MapPin size={18} color="#6b7280" />
                  <Text className="ml-3 text-gray-700 font-medium">
                    Location: {user.district} {user.city ? `, ${user.city}` : ""}
                  </Text>
                </View>
              ) : null}

              {user.role === "shop_owner" && (
                <>
                  <View className="flex-row items-center my-1">
                    <Store size={18} color="#d97706" />
                    <Text className="ml-3 text-amber-900 font-bold">
                      Shop: {user.shop_name || "N/A"}
                    </Text>
                  </View>

                  {user.whatsapp_number ? (
                    <View className="flex-row items-center my-1">
                      <MessageSquare size={18} color="#16a34a" />
                      <Text className="ml-3 text-gray-700 font-medium">
                        WhatsApp: {user.whatsapp_number}
                      </Text>
                    </View>
                  ) : null}
                </>
              )}
            </View>

            {/* Shop Owner Ads Management Button */}
            {user.role === "shop_owner" && (
              <TouchableOpacity
                onPress={() => router.push("/shop-ads")}
                className="bg-amber-50 border border-amber-200 px-5 py-4 rounded-2xl shadow-sm flex-row items-center justify-center w-full mb-3 active:opacity-80"
              >
                <Megaphone size={20} color="#d97706" />
                <Text className="text-amber-800 font-bold text-base ml-2">
                  Manage My Shop Ads
                </Text>
              </TouchableOpacity>
            )}

            {/* Change Password Button */}
            <TouchableOpacity
              onPress={() => setShowPasswordModal(true)}
              className="bg-white border border-emerald-200 px-5 py-4 rounded-2xl shadow-sm flex-row items-center justify-center w-full mb-3 active:opacity-80"
            >
              <Key size={20} color="#059669" />
              <Text className="text-emerald-700 font-bold text-base ml-2">
                Change Password
              </Text>
            </TouchableOpacity>

            {/* Logout Action */}
            <TouchableOpacity
              onPress={logout}
              className="bg-white border border-red-200 px-5 py-4 rounded-2xl shadow-sm flex-row items-center justify-center w-full active:opacity-80"
            >
              <LogOut size={20} color="#ef4444" />
              <Text className="text-red-600 font-bold text-base ml-2">Sign Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* Guest State Prompt */
          <View className="bg-white rounded-3xl p-6 shadow-sm w-full items-center">
            <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">
              Sign In to Your Account
            </Text>
            <Text className="text-gray-500 text-sm mb-6 text-center leading-relaxed">
              Connect with local agro stores, post product listings, and save your rice leaf scan history.
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/login")}
              className="bg-emerald-600 py-4 px-6 rounded-2xl flex-row items-center justify-center w-full shadow-md active:opacity-90 mb-3"
            >
              <LogIn size={20} color="#fff" />
              <Text className="text-white font-bold text-base ml-2">Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/register")}
              className="bg-emerald-50 border border-emerald-200 py-4 px-6 rounded-2xl flex-row items-center justify-center w-full active:opacity-90"
            >
              <UserPlus size={20} color="#059669" />
              <Text className="text-emerald-700 font-bold text-base ml-2">
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
          <View className="bg-white w-full max-w-md p-6 rounded-3xl shadow-xl relative">
            <TouchableOpacity
              onPress={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 p-1 text-gray-400"
            >
              <X size={22} color="#6b7280" />
            </TouchableOpacity>

            <View className="flex-row items-center mb-1">
              <Key size={22} color="#059669" />
              <Text className="text-xl font-bold text-gray-900 ml-2">
                Change Password
              </Text>
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
                <Lock size={18} color="#9ca3af" />
                <TextInput
                  secureTextEntry={!showCurrent}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="••••••••"
                  className="flex-1 ml-2 text-gray-900 text-sm"
                />
                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} className="p-1">
                  {showCurrent ? <EyeOff size={18} color="#6b7280" /> : <Eye size={18} color="#6b7280" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password Input */}
            <View className="mb-4">
              <Text className="text-xs font-bold text-gray-600 uppercase mb-1">
                New Password (min 6 chars)
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
                <Lock size={18} color="#9ca3af" />
                <TextInput
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="••••••••"
                  className="flex-1 ml-2 text-gray-900 text-sm"
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)} className="p-1">
                  {showNew ? <EyeOff size={18} color="#6b7280" /> : <Eye size={18} color="#6b7280" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm New Password Input */}
            <View className="mb-6">
              <Text className="text-xs font-bold text-gray-600 uppercase mb-1">
                Confirm New Password
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-3">
                <Lock size={18} color="#9ca3af" />
                <TextInput
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  className="flex-1 ml-2 text-gray-900 text-sm"
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} className="p-1">
                  {showConfirm ? <EyeOff size={18} color="#6b7280" /> : <Eye size={18} color="#6b7280" />}
                </TouchableOpacity>
              </View>
            </View>

            {/* Actions */}
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={() => setShowPasswordModal(false)}
                className="flex-1 bg-gray-100 py-3 rounded-xl items-center"
              >
                <Text className="font-bold text-gray-700 text-sm">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={loading}
                className="flex-1 bg-emerald-600 py-3 rounded-xl items-center shadow-md active:opacity-90"
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="font-bold text-white text-sm">Save Password</Text>
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
