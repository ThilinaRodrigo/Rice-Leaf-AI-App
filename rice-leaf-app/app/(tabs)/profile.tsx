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
  StyleSheet,
  Image,
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
  Camera,
  Edit2,
} from "lucide-react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { changePassword, uploadUserAvatar, updateUserProfile } from "@/service/apiClient";
import { API_BASE_URL } from "@/constant/api";
import { FloatingChatButton } from "@/components/FloatingChatButton";

const Profile = () => {
  const { user, token, updateUser, logout } = useAuth();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const getAvatarUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith("/uploads")) {
      const domain = API_BASE_URL.replace("/api/v1", "");
      return `${domain}${url}`;
    }
    return url;
  };

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Edit Profile Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editShopName, setEditShopName] = useState("");
  const [editWhatsAppNumber, setEditWhatsAppNumber] = useState("");
  const [editAvatarUri, setEditAvatarUri] = useState<string | null>(null);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [editError, setEditError] = useState("");

  const handleOpenEditModal = () => {
    if (!user) return;
    setEditFullName(user.full_name || "");
    setEditPhone(user.phone || "");
    setEditDistrict(user.district || "");
    setEditCity(user.city || "");
    setEditShopName(user.shop_name || "");
    setEditWhatsAppNumber(user.whatsapp_number || "");
    setEditAvatarUri(user.avatar_url ? getAvatarUrl(user.avatar_url) : null);
    setEditError("");
    setShowEditModal(true);
  };

  const handlePickEditAvatar = async () => {
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
        setEditAvatarUri(`data:image/jpeg;base64,${asset.base64}`);
      } else {
        setEditAvatarUri(asset.uri);
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!editFullName.trim()) {
      setEditError("Full Name is required.");
      return;
    }
    if (!token) return;

    setEditError("");
    setSubmittingProfile(true);
    try {
      let finalAvatarUrl = user?.avatar_url || "";
      if (
        editAvatarUri &&
        (editAvatarUri.startsWith("data:") ||
          editAvatarUri.startsWith("file://") ||
          editAvatarUri.startsWith("content://"))
      ) {
        finalAvatarUrl = await uploadUserAvatar(editAvatarUri);
      } else if (editAvatarUri && editAvatarUri.includes("/uploads/avatars/")) {
        const idx = editAvatarUri.indexOf("/uploads/avatars/");
        finalAvatarUrl = editAvatarUri.substring(idx);
      }

      const updated = await updateUserProfile(
        {
          full_name: editFullName.trim(),
          phone: editPhone.trim(),
          district: editDistrict.trim(),
          city: editCity.trim(),
          shop_name: editShopName.trim(),
          whatsapp_number: editWhatsAppNumber.trim(),
          avatar_url: finalAvatarUrl,
        },
        token
      );

      updateUser(updated);
      setShowEditModal(false);
      Alert.alert("Success", t("profileUpdatedSuccess"));
    } catch (err: any) {
      setEditError(err.message || t("updateProfileError"));
    } finally {
      setSubmittingProfile(false);
    }
  };

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

  const handleLogoutConfirm = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out of your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC", position: "relative" }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Banner & Header */}
      <View
        style={[
          styles.topBanner,
          { paddingTop: Math.max(insets.top, 16) + 12 },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <ArrowLeft size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* User Avatar Badge */}
        <TouchableOpacity
          onPress={user ? handleOpenEditModal : undefined}
          activeOpacity={0.8}
          style={styles.avatarWrapper}
        >
          <View style={styles.avatarContainer}>
            {user?.avatar_url ? (
              <Image
                source={{ uri: getAvatarUrl(user.avatar_url)! }}
                style={{ width: "100%", height: "100%", borderRadius: 50 }}
                resizeMode="cover"
              />
            ) : (
              <UserIcon size={48} color="#059669" />
            )}
            {user && (
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: "#059669",
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: "#FFFFFF",
                }}
              >
                <Camera size={14} color="#FFFFFF" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View style={styles.contentArea}>
        {user ? (
          <>
            {/* Identity Header */}
            <View style={styles.identityHeader}>
              <Text style={styles.userName}>{user.full_name}</Text>
              <Text style={styles.userSubText}>
                {user.email || user.nic || ""}
              </Text>

              {/* Role Badge */}
              <View
                style={[
                  styles.roleBadge,
                  user.role === "shop_owner"
                    ? styles.roleShopOwner
                    : user.role === "sys_admin"
                    ? styles.roleSysAdmin
                    : styles.roleFarmer,
                ]}
              >
                {user.role === "shop_owner" ? (
                  <>
                    <Store size={15} color="#D97706" />
                    <Text style={[styles.roleBadgeText, { color: "#78350F" }]}>
                      {t("roleShopOwner")}
                    </Text>
                  </>
                ) : user.role === "sys_admin" ? (
                  <>
                    <ShieldCheck size={15} color="#7E22CE" />
                    <Text style={[styles.roleBadgeText, { color: "#581C87" }]}>
                      {t("sysAdminRole")}
                    </Text>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={15} color="#059669" />
                    <Text style={[styles.roleBadgeText, { color: "#064E3B" }]}>
                      {t("roleFarmer")}
                    </Text>
                  </>
                )}
              </View>
            </View>

            {/* Shop Owner Actions Highlight */}
            {user.role === "shop_owner" && (
              <TouchableOpacity
                onPress={() => router.push("/shop-ads")}
                style={styles.shopOwnerCard}
                activeOpacity={0.85}
              >
                <View style={styles.rowAlign}>
                  <View style={styles.megaphoneIconBox}>
                    <Megaphone size={22} color="#D97706" />
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.shopCardTitle}>{t("postAd")}</Text>
                    <Text style={styles.shopCardSub}>
                      {t("marketBannerSub")}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color="#D97706" />
              </TouchableOpacity>
            )}

            {/* Account Information Card */}
            <View style={styles.infoCard}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text style={styles.cardHeaderTitle}>{t("accountInfo")}</Text>
                <TouchableOpacity
                  onPress={handleOpenEditModal}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#ECFDF5",
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#A7F3D0",
                  }}
                  activeOpacity={0.8}
                >
                  <Edit2 size={14} color="#059669" />
                  <Text
                    style={{
                      marginLeft: 6,
                      fontSize: 12,
                      fontWeight: "700",
                      color: "#047857",
                    }}
                  >
                    {t("editProfile")}
                  </Text>
                </TouchableOpacity>
              </View>

              {user.nic ? (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconBox}>
                    <UserIcon size={16} color="#64748B" />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>{t("nicNumber")}</Text>
                    <Text style={styles.infoValue}>{user.nic}</Text>
                  </View>
                </View>
              ) : null}

              {user.phone ? (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconBox}>
                    <Phone size={16} color="#64748B" />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>{t("phoneNumber")}</Text>
                    <Text style={styles.infoValue}>{user.phone}</Text>
                  </View>
                </View>
              ) : null}

              {user.district ? (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconBox}>
                    <MapPin size={16} color="#64748B" />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>{t("location")}</Text>
                    <Text style={styles.infoValue}>
                      {user.district} {user.city ? `, ${user.city}` : ""}
                    </Text>
                  </View>
                </View>
              ) : null}

              {user.role === "shop_owner" && (
                <>
                  <View style={styles.infoRow}>
                    <View
                      style={[
                        styles.infoIconBox,
                        { backgroundColor: "#FEF3C7" },
                      ]}
                    >
                      <Store size={16} color="#D97706" />
                    </View>
                    <View>
                      <Text style={styles.infoLabel}>{t("agroShopName")}</Text>
                      <Text
                        style={[
                          styles.infoValue,
                          { color: "#92400E", fontWeight: "700" },
                        ]}
                      >
                        {user.shop_name || "N/A"}
                      </Text>
                    </View>
                  </View>

                  {user.whatsapp_number ? (
                    <View style={styles.infoRow}>
                      <View
                        style={[
                          styles.infoIconBox,
                          { backgroundColor: "#D1FAE5" },
                        ]}
                      >
                        <MessageSquare size={16} color="#059669" />
                      </View>
                      <View>
                        <Text style={styles.infoLabel}>{t("whatsAppContact")}</Text>
                        <Text
                          style={[
                            styles.infoValue,
                            { color: "#065F46", fontWeight: "600" },
                          ]}
                        >
                          {user.whatsapp_number}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </>
              )}
            </View>

            {/* Account Settings & Security Options */}
            <View style={styles.infoCard}>
              <Text style={styles.cardHeaderTitle}>{t("securityPreferences")}</Text>

              <TouchableOpacity
                onPress={() => setShowPasswordModal(true)}
                style={styles.settingRow}
                activeOpacity={0.8}
              >
                <View style={styles.rowAlign}>
                  <View style={styles.settingIconBox}>
                    <Key size={16} color="#059669" />
                  </View>
                  <Text style={styles.settingText}>{t("changePassword")}</Text>
                </View>
                <ChevronRight size={16} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Sign Out Action */}
            <TouchableOpacity
              onPress={handleLogoutConfirm}
              style={styles.signOutButton}
              activeOpacity={0.8}
            >
              <LogOut size={18} color="#EF4444" />
              <Text style={styles.signOutText}>{t("signOut")}</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* Guest State Prompt */
          <View style={styles.guestCard}>
            <Text style={styles.guestTitle}>{t("signIn")}</Text>
            <Text style={styles.guestSubText}>
              {t("guestMessage")}
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/login")}
              style={styles.signInButton}
              activeOpacity={0.9}
            >
              <LogIn size={18} color="#FFFFFF" />
              <Text style={styles.signInButtonText}>{t("signIn")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/register")}
              style={styles.createAccountButton}
              activeOpacity={0.9}
            >
              <UserPlus size={18} color="#059669" />
              <Text style={styles.createAccountButtonText}>
                {t("createAccount")}
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setShowPasswordModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={20} color="#64748B" />
            </TouchableOpacity>

            <View style={styles.modalHeaderRow}>
              <Key size={20} color="#059669" />
              <Text style={styles.modalTitle}>{t("changePassword")}</Text>
            </View>
            <Text style={styles.modalSubTitle}>
              Enter your current password and a new secure password.
            </Text>

            {errorMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Current Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("currentPassword")}</Text>
              <View style={styles.inputWrapper}>
                <Lock size={16} color="#94A3B8" />
                <TextInput
                  secureTextEntry={!showCurrent}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  style={styles.textInput}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrent(!showCurrent)}
                  style={{ padding: 4 }}
                >
                  {showCurrent ? (
                    <EyeOff size={16} color="#64748B" />
                  ) : (
                    <Eye size={16} color="#64748B" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* New Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t("newPassword")}</Text>
              <View style={styles.inputWrapper}>
                <Lock size={16} color="#94A3B8" />
                <TextInput
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  style={styles.textInput}
                />
                <TouchableOpacity
                  onPress={() => setShowNew(!showNew)}
                  style={{ padding: 4 }}
                >
                  {showNew ? (
                    <EyeOff size={16} color="#64748B" />
                  ) : (
                    <Eye size={16} color="#64748B" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm New Password Input */}
            <View style={[styles.inputGroup, { marginBottom: 24 }]}>
              <Text style={styles.inputLabel}>{t("confirmPasswordLabel")}</Text>
              <View style={styles.inputWrapper}>
                <Lock size={16} color="#94A3B8" />
                <TextInput
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  style={styles.textInput}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm(!showConfirm)}
                  style={{ padding: 4 }}
                >
                  {showConfirm ? (
                    <EyeOff size={16} color="#64748B" />
                  ) : (
                    <Eye size={16} color="#64748B" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                onPress={() => setShowPasswordModal(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelBtnText}>{t("cancel")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleChangePassword}
                disabled={loading}
                style={styles.modalSaveBtn}
                activeOpacity={0.9}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSaveBtnText}>{t("savePassword")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "90%" }]}>
            <TouchableOpacity
              onPress={() => setShowEditModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={20} color="#64748B" />
            </TouchableOpacity>

            <View style={styles.modalHeaderRow}>
              <Edit2 size={20} color="#059669" />
              <Text style={styles.modalTitle}>{t("editProfile")}</Text>
            </View>

            {editError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{editError}</Text>
              </View>
            ) : null}

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 10 }}>
              {/* Profile Photo Picker */}
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <TouchableOpacity
                  onPress={handlePickEditAvatar}
                  activeOpacity={0.8}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    backgroundColor: "#ECFDF5",
                    borderWidth: 2,
                    borderColor: "#059669",
                    borderStyle: "dashed",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {editAvatarUri ? (
                    <Image
                      source={{ uri: editAvatarUri }}
                      style={{ width: "100%", height: "100%", borderRadius: 48 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <UserIcon size={40} color="#059669" />
                  )}
                  <View
                    style={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      backgroundColor: "#059669",
                      width: 30,
                      height: 30,
                      borderRadius: 15,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: "#FFFFFF",
                    }}
                  >
                    <Camera size={14} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#475569", marginTop: 8 }}>
                  {t("changePhoto")}
                </Text>
              </View>

              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("fullNameLabel")}</Text>
                <View style={styles.inputWrapper}>
                  <UserIcon size={16} color="#94A3B8" />
                  <TextInput
                    value={editFullName}
                    onChangeText={setEditFullName}
                    placeholder="Full Name"
                    placeholderTextColor="#94A3B8"
                    style={styles.textInput}
                  />
                </View>
              </View>

              {/* Phone Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("phoneNumber")}</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={16} color="#94A3B8" />
                  <TextInput
                    value={editPhone}
                    onChangeText={setEditPhone}
                    placeholder="077 123 4567"
                    keyboardType="phone-pad"
                    placeholderTextColor="#94A3B8"
                    style={styles.textInput}
                  />
                </View>
              </View>

              {/* District */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("location")}</Text>
                <View style={styles.inputWrapper}>
                  <MapPin size={16} color="#94A3B8" />
                  <TextInput
                    value={editDistrict}
                    onChangeText={setEditDistrict}
                    placeholder="District (e.g. Anuradhapura)"
                    placeholderTextColor="#94A3B8"
                    style={styles.textInput}
                  />
                </View>
              </View>

              {/* Shop Owner Specific Fields */}
              {user?.role === "shop_owner" && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t("agroShopName")}</Text>
                    <View style={styles.inputWrapper}>
                      <Store size={16} color="#94A3B8" />
                      <TextInput
                        value={editShopName}
                        onChangeText={setEditShopName}
                        placeholder="Agro Shop Name"
                        placeholderTextColor="#94A3B8"
                        style={styles.textInput}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>{t("whatsAppContact")}</Text>
                    <View style={styles.inputWrapper}>
                      <MessageSquare size={16} color="#94A3B8" />
                      <TextInput
                        value={editWhatsAppNumber}
                        onChangeText={setEditWhatsAppNumber}
                        placeholder="077 987 6543"
                        keyboardType="phone-pad"
                        placeholderTextColor="#94A3B8"
                        style={styles.textInput}
                      />
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            {/* Actions */}
            <View style={styles.modalActionRow}>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelBtnText}>{t("cancel")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveProfile}
                disabled={submittingProfile}
                style={styles.modalSaveBtn}
                activeOpacity={0.9}
              >
                {submittingProfile ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalSaveBtnText}>{t("saveChanges")}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </ScrollView>
      <FloatingChatButton />
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  topBanner: {
    backgroundColor: "#065F46",
    paddingBottom: 64,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(6, 78, 59, 0.2)",
    position: "relative",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: "rgba(4, 120, 87, 0.8)",
    borderWidth: 1,
    borderColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarWrapper: {
    position: "absolute",
    bottom: -48,
    alignSelf: "center",
    alignItems: "center",
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    borderWidth: 4,
    borderColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    overflow: "hidden",
  },
  contentArea: {
    marginTop: 64,
    paddingHorizontal: 20,
    marginBottom: 128,
  },
  identityHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
  },
  userSubText: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  roleShopOwner: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FCD34D",
  },
  roleSysAdmin: {
    backgroundColor: "#F3E8FF",
    borderColor: "#D8B4FE",
  },
  roleFarmer: {
    backgroundColor: "#D1FAE5",
    borderColor: "#6EE7B7",
  },
  roleBadgeText: {
    marginLeft: 8,
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  shopOwnerCard: {
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  rowAlign: {
    flexDirection: "row",
    alignItems: "center",
  },
  megaphoneIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  shopCardTitle: {
    color: "#78350F",
    fontWeight: "900",
    fontSize: 14,
  },
  shopCardSub: {
    color: "rgba(180, 83, 9, 0.8)",
    fontSize: 11,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardHeaderTitle: {
    fontWeight: "700",
    color: "#64748B",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "500",
  },
  infoValue: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "600",
  },
  settingRow: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  settingIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  settingText: {
    marginLeft: 12,
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 12,
  },
  signOutButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  signOutText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 8,
  },
  guestCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: "center",
  },
  guestSubText: {
    color: "#64748B",
    fontSize: 12,
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 18,
  },
  signInButton: {
    backgroundColor: "#065F46",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 12,
  },
  signInButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 8,
  },
  createAccountButton: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  createAccountButtonText: {
    color: "#065F46",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    width: "100%",
    maxWidth: 400,
    padding: 24,
    borderRadius: 24,
    position: "relative",
  },
  modalCloseButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 4,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginLeft: 8,
  },
  modalSubTitle: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textInput: {
    flex: 1,
    marginLeft: 8,
    color: "#0F172A",
    fontSize: 14,
  },
  modalActionRow: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalCancelBtnText: {
    fontWeight: "700",
    color: "#334155",
    fontSize: 12,
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: "#059669",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  modalSaveBtnText: {
    fontWeight: "700",
    color: "#FFFFFF",
    fontSize: 12,
  },
});
