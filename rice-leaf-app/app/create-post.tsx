import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Camera, Image as ImageIcon, X, PlusCircle } from "lucide-react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/context/AuthContext";
import { uploadPostImage, createCommunityPost } from "@/service/apiClient";

const DISEASE_OPTIONS = [
  { label: "Bacterial Leaf Blight", value: "bacterial_leaf_blight" },
  { label: "Brown Spot", value: "brown_spot" },
  { label: "Healthy Leaf", value: "healthy" },
  { label: "Leaf Scald", value: "leaf_scald" },
  { label: "Narrow Brown Spot", value: "narrow_brown_spot" },
  { label: "General Farmer Query", value: "general" },
];

export default function CreatePost() {
  const { user, token } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [diseaseTag, setDiseaseTag] = useState("bacterial_leaf_blight");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ─── Image Picker helpers (no NativeWind / css-interop involved) ──────────
  const handleSelectCamera = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission Required", "Camera permission is needed to take a photo.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert("Camera Error", e.message || "Could not open camera.");
    }
  };

  const handleSelectGallery = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission Required", "Gallery permission is needed to pick a photo.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (e: any) {
      Alert.alert("Gallery Error", e.message || "Could not open gallery.");
    }
  };
  // ─────────────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert("Authentication Required", "Please sign in to publish a community post.");
      router.push("/login");
      return;
    }

    if (!title.trim() || !content.trim()) {
      Alert.alert("Missing Fields", "Please provide a title and solution description.");
      return;
    }

    setLoading(true);
    try {
      let finalImageUrl = "";
      if (selectedImage) {
        const uploadRes = await uploadPostImage(selectedImage, token);
        finalImageUrl = uploadRes.url;
      }

      await createCommunityPost(
        {
          title: title.trim(),
          content: content.trim(),
          disease_tag: diseaseTag,
          image_url: finalImageUrl,
        },
        token
      );

      Alert.alert("Success", "Your community post has been published successfully!");
      router.back();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to publish post.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
      <View style={styles.container}>
        {/* ── Header Banner ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <View style={styles.badgeRow}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeLabel}>Farmer Knowledge Base</Text>
            </View>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Create Community Post
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* ── Post Title ── */}
          <Text style={styles.fieldLabel}>Post Title / Disease Summary *</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Effective remedy for Bacterial Blight kresek"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
          />

          {/* ── Disease Tag Selector ── */}
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Select Disease Tag *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagScroll}>
            {DISEASE_OPTIONS.map((opt) => {
              const isSelected = diseaseTag === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setDiseaseTag(opt.value)}
                  style={[styles.tagPill, isSelected ? styles.tagPillActive : styles.tagPillInactive]}
                >
                  <Text style={[styles.tagPillText, isSelected ? styles.tagPillTextActive : styles.tagPillTextInactive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── Photo Upload ── */}
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Upload Paddy Leaf Photo (Optional)</Text>

          {selectedImage ? (
            <View style={styles.imagePreviewWrapper}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} resizeMode="cover" />
              <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.imageClearBtn}>
                <X size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.imagePickerRow}>
              {/* Take Photo Button — uses plain StyleSheet, no NativeWind */}
              <TouchableOpacity onPress={handleSelectCamera} style={styles.imagePickerBtn} activeOpacity={0.75}>
                <Camera size={18} color="#059669" />
                <Text style={styles.imagePickerBtnText}>Take Photo</Text>
              </TouchableOpacity>

              {/* Choose Gallery Button */}
              <TouchableOpacity onPress={handleSelectGallery} style={styles.imagePickerBtn} activeOpacity={0.75}>
                <ImageIcon size={18} color="#059669" />
                <Text style={styles.imagePickerBtnText}>Choose Gallery</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Solution Description ── */}
          <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Description &amp; Remedy Details *</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Share step-by-step field observations, dosage, fertilizers, or organic treatments that worked for your crop..."
            placeholderTextColor="#94A3B8"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          {/* ── Submit Button ── */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            style={styles.submitBtn}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <PlusCircle size={20} color="#FFFFFF" />
                <Text style={styles.submitBtnText}>Publish Community Post</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── All styles use StyleSheet — zero NativeWind / css-interop on this screen ──
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#065f46",
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  // Header
  header: {
    backgroundColor: "#065f46",
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#047857",
    borderWidth: 1,
    borderColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6EE7B7",
    marginRight: 6,
  },
  badgeLabel: {
    color: "#A7F3D0",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 60,
  },
  // Field label
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  // Text inputs
  textInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
    fontWeight: "400",
  },
  // Disease tag pills
  tagScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  tagPill: {
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  tagPillActive: {
    backgroundColor: "#065f46",
    borderColor: "#065f46",
  },
  tagPillInactive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  tagPillTextActive: {
    color: "#FFFFFF",
  },
  tagPillTextInactive: {
    color: "#374151",
  },
  // Image picker
  imagePickerRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  imagePickerBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  imagePickerBtnText: {
    color: "#065f46",
    fontWeight: "700",
    fontSize: 12,
  },
  imagePreviewWrapper: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 192,
  },
  imageClearBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  // Submit button
  submitBtn: {
    marginTop: 24,
    backgroundColor: "#065f46",
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 14,
  },
});
