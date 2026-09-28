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
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarContainer}>
            <UserIcon size={48} color="#059669" />
          </View>
        </View>
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
                      Agro Shop Owner
                    </Text>
                  </>
                ) : user.role === "sys_admin" ? (
                  <>
                    <ShieldCheck size={15} color="#7E22CE" />
                    <Text style={[styles.roleBadgeText, { color: "#581C87" }]}>
                      System Administrator
                    </Text>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={15} color="#059669" />
                    <Text style={[styles.roleBadgeText, { color: "#064E3B" }]}>
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
                style={styles.shopOwnerCard}
                activeOpacity={0.85}
              >
                <View style={styles.rowAlign}>
                  <View style={styles.megaphoneIconBox}>
                    <Megaphone size={22} color="#D97706" />
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={styles.shopCardTitle}>Manage My Shop Ads</Text>
                    <Text style={styles.shopCardSub}>
                      Post & update your agro product listings
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color="#D97706" />
              </TouchableOpacity>
            )}

            {/* Account Information Card */}
            <View style={styles.infoCard}>
              <Text style={styles.cardHeaderTitle}>Account Information</Text>

              {user.nic ? (
                <View style={styles.infoRow}>
                  <View style={styles.infoIconBox}>
                    <UserIcon size={16} color="#64748B" />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>NIC Number</Text>
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
                    <Text style={styles.infoLabel}>Phone Number</Text>
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
                    <Text style={styles.infoLabel}>Location</Text>
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
                      <Text style={styles.infoLabel}>Agro Shop Name</Text>
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
                        <Text style={styles.infoLabel}>WhatsApp Contact</Text>
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
              <Text style={styles.cardHeaderTitle}>Security & Preferences</Text>

              <TouchableOpacity
                onPress={() => setShowPasswordModal(true)}
                style={styles.settingRow}
                activeOpacity={0.8}
              >
                <View style={styles.rowAlign}>
                  <View style={styles.settingIconBox}>
                    <Key size={16} color="#059669" />
                  </View>
                  <Text style={styles.settingText}>Change Password</Text>
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
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* Guest State Prompt */
          <View style={styles.guestCard}>
            <Text style={styles.guestTitle}>Sign In to Your Account</Text>
            <Text style={styles.guestSubText}>
              Connect with local agro stores, post product listings, and save
              your rice leaf scan history.
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/login")}
              style={styles.signInButton}
              activeOpacity={0.9}
            >
              <LogIn size={18} color="#FFFFFF" />
              <Text style={styles.signInButtonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/register")}
              style={styles.createAccountButton}
              activeOpacity={0.9}
            >
              <UserPlus size={18} color="#059669" />
              <Text style={styles.createAccountButtonText}>
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
              <Text style={styles.modalTitle}>Change Password</Text>
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
              <Text style={styles.inputLabel}>Current Password</Text>
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
              <Text style={styles.inputLabel}>New Password (min 6 chars)</Text>
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
              <Text style={styles.inputLabel}>Confirm New Password</Text>
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
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
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
                  <Text style={styles.modalSaveBtnText}>Save Password</Text>
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
