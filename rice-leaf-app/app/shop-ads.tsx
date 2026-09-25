import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { ArrowLeft, Plus, Trash2, Clock, CheckCircle, XCircle, Image as ImageIcon, Tag, Phone, Store, AlertTriangle, X } from "lucide-react-native";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "@/context/AuthContext";
import { uploadAdImage, createShopAd, fetchMyShopAds, deleteShopAd } from "@/service/apiClient";
import { API_BASE_URL } from "@/constant/api";

const DISEASE_OPTIONS = [
  { key: "bacterial_leaf_blight", label: "Bacterial Leaf Blight (BLB)" },
  { key: "brown_spot", label: "Brown Spot" },
  { key: "leaf_scald", label: "Leaf Scald" },
  { key: "narrow_brown_spot", label: "Narrow Brown Spot" },
  { key: "healthy", label: "Healthy Leaf" },
];

export default function ShopAdsScreen() {
  const { user, token } = useAuth();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceUnit, setPriceUnit] = useState("");
  const [contactPhone, setContactPhone] = useState(user?.phone || user?.whatsapp_number || "");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadAds = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchMyShopAds(token);
      setAds(data || []);
    } catch (err: any) {
      console.error("Error loading my shop ads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, [token]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setSelectedImageUri(result.assets[0].uri);
    }
  };

  const toggleTag = (tagKey: string) => {
    if (selectedTags.includes(tagKey)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagKey));
    } else {
      setSelectedTags([...selectedTags, tagKey]);
    }
  };

  const handleSubmitAd = async () => {
    if (!title || !description || !selectedImageUri) {
      Alert.alert("Missing Fields", "Please select an image and enter a title & description.");
      return;
    }
    if (!token) {
      Alert.alert("Error", "You must be logged in as a Shop Owner.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload Ad image locally to Go backend
      const uploadedPath = await uploadAdImage(selectedImageUri, token);

      // 2. Submit Ad payload
      await createShopAd(
        {
          shop_name: user?.shop_name || user?.full_name || "Agro Shop Owner",
          contact_phone: contactPhone || "+94 77 123 4567",
          title,
          description,
          price_unit: priceUnit,
          image_url: uploadedPath,
          disease_tags: selectedTags,
        },
        token
      );

      Alert.alert(
        "Ad Submitted!",
        "Your advertisement has been submitted for Admin verification. It will be live in the Marketplace once approved."
      );
      setShowModal(false);
      setTitle("");
      setDescription("");
      setPriceUnit("");
      setSelectedTags([]);
      setSelectedImageUri(null);
      loadAds();
    } catch (err: any) {
      Alert.alert("Submission Failed", err.message || "Could not submit advertisement.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAd = (id: string, adTitle: string) => {
    Alert.alert("Delete Advertisement", `Are you sure you want to delete "${adTitle}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!token) return;
          try {
            await deleteShopAd(id, token);
            setAds(ads.filter((a) => a.id !== id));
            Alert.alert("Deleted", "Advertisement deleted successfully.");
          } catch (err: any) {
            Alert.alert("Delete Failed", err.message || "Failed deleting ad.");
          }
        },
      },
    ]);
  };

  const parseTags = (raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return "https://images.unsplash.com/photo-1594381256940-7bcf6eb0f6b0?auto=format&fit=crop&w=500&q=60";
    if (url.startsWith("/uploads")) {
      const serverDomain = API_BASE_URL.replace("/api/v1", "");
      return `${serverDomain}${url}`;
    }
    return url;
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white px-4 pt-12 pb-4 shadow-sm flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 mr-2">
            <ArrowLeft size={22} color="#111" />
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-bold text-gray-900">My Shop Ads</Text>
            <Text className="text-xs text-gray-500">Manage Marketplace Advertisements</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setShowModal(true)}
          className="bg-emerald-600 px-3 py-2 rounded-xl flex-row items-center space-x-1"
        >
          <Plus size={16} color="#fff" />
          <Text className="text-white text-xs font-bold">New Ad</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-4">
        {loading ? (
          <ActivityIndicator size="large" color="#059669" className="mt-10" />
        ) : ads.length === 0 ? (
          <View className="bg-white p-8 rounded-2xl items-center text-center mt-6 shadow-sm space-y-3">
            <Store size={48} color="#9CA3AF" />
            <Text className="text-lg font-bold text-gray-800">No Ads Submitted Yet</Text>
            <Text className="text-xs text-gray-500 text-center">
              Post product advertisements linked to specific rice diseases to reach thousands of farmers.
            </Text>
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              className="bg-emerald-600 px-5 py-3 rounded-xl mt-2"
            >
              <Text className="text-white font-bold text-sm">Post First Advertisement</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-4 pb-20">
            {ads.map((ad) => {
              const tags = parseTags(ad.disease_tags);
              return (
                <View key={ad.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                  <Image source={{ uri: getImageUrl(ad.image_url) }} className="w-full h-44" resizeMode="cover" />

                  <View className="p-4 space-y-2">
                    {/* Status Badge */}
                    <View className="flex-row items-center justify-between">
                      {ad.status === "pending" && (
                        <View className="bg-amber-100 px-3 py-1 rounded-full flex-row items-center space-x-1">
                          <Clock size={14} color="#D97706" />
                          <Text className="text-amber-700 font-bold text-xs">Pending Verification</Text>
                        </View>
                      )}
                      {ad.status === "approved" && (
                        <View className="bg-emerald-100 px-3 py-1 rounded-full flex-row items-center space-x-1">
                          <CheckCircle size={14} color="#059669" />
                          <Text className="text-emerald-700 font-bold text-xs">Approved & Live</Text>
                        </View>
                      )}
                      {ad.status === "rejected" && (
                        <View className="bg-red-100 px-3 py-1 rounded-full flex-row items-center space-x-1">
                          <XCircle size={14} color="#DC2626" />
                          <Text className="text-red-700 font-bold text-xs">Rejected</Text>
                        </View>
                      )}

                      <TouchableOpacity onPress={() => handleDeleteAd(ad.id, ad.title)} className="p-1">
                        <Trash2 size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    <Text className="text-lg font-bold text-gray-900">{ad.title}</Text>
                    {ad.price_unit ? <Text className="text-emerald-600 font-bold text-sm">{ad.price_unit}</Text> : null}
                    <Text className="text-xs text-gray-600 leading-relaxed">{ad.description}</Text>

                    {/* Disease Tags */}
                    {tags.length > 0 && (
                      <View className="pt-1 flex-row flex-wrap gap-1">
                        {tags.map((tg, i) => (
                          <View key={i} className="bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-md">
                            <Text className="text-[11px] text-purple-700 font-semibold">{tg.replace(/_/g, " ")}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Rejection Reason */}
                    {ad.status === "rejected" && ad.rejection_reason && (
                      <View className="bg-red-50 p-2.5 rounded-xl border border-red-200 flex-row items-start space-x-2 mt-2">
                        <AlertTriangle size={16} color="#DC2626" />
                        <Text className="text-xs text-red-700 flex-1">Reason: {ad.rejection_reason}</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Create Ad Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-3xl p-6 max-h-[85%] space-y-4">
            <View className="flex-row items-center justify-between pb-2 border-b border-gray-100">
              <Text className="text-xl font-bold text-gray-900">New Shop Advertisement</Text>
              <TouchableOpacity onPress={() => setShowModal(false)} className="p-1">
                <X size={22} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
              {/* Image Picker */}
              <TouchableOpacity
                onPress={pickImage}
                className="w-full h-40 bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 items-center justify-center overflow-hidden"
              >
                {selectedImageUri ? (
                  <Image source={{ uri: selectedImageUri }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="items-center space-y-1">
                    <ImageIcon size={32} color="#9CA3AF" />
                    <Text className="text-xs text-gray-500 font-semibold">Tap to select Ad Banner Image</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Title */}
              <View>
                <Text className="text-xs font-bold text-gray-500 uppercase mb-1">Product / Ad Title *</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Copper Fungicide for BLB Control"
                  className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900"
                />
              </View>

              {/* Price */}
              <View>
                <Text className="text-xs font-bold text-gray-500 uppercase mb-1">Price Unit Label</Text>
                <TextInput
                  value={priceUnit}
                  onChangeText={setPriceUnit}
                  placeholder="e.g. Rs.1,450 / 500g"
                  className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900"
                />
              </View>

              {/* Contact Phone */}
              <View>
                <Text className="text-xs font-bold text-gray-500 uppercase mb-1">Contact Phone / WhatsApp</Text>
                <TextInput
                  value={contactPhone}
                  onChangeText={setContactPhone}
                  placeholder="+94 77 123 4567"
                  keyboardType="phone-pad"
                  className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900"
                />
              </View>

              {/* Description */}
              <View>
                <Text className="text-xs font-bold text-gray-500 uppercase mb-1">Ad Description *</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Detailed description of remedy or tool..."
                  multiline
                  numberOfLines={3}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-900"
                />
              </View>

              {/* Disease Tags */}
              <View>
                <Text className="text-xs font-bold text-gray-500 uppercase mb-2">Targeted Rice Disease Tags</Text>
                <View className="flex-row flex-wrap gap-2">
                  {DISEASE_OPTIONS.map((opt) => {
                    const isSelected = selectedTags.includes(opt.key);
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        onPress={() => toggleTag(opt.key)}
                        className={`px-3 py-2 rounded-xl border ${
                          isSelected ? "bg-purple-600 border-purple-600" : "bg-gray-100 border-gray-200"
                        }`}
                      >
                        <Text className={`text-xs font-semibold ${isSelected ? "text-white" : "text-gray-700"}`}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSubmitAd}
                disabled={submitting}
                className="bg-emerald-600 py-4 rounded-xl items-center mt-4 shadow-md"
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold text-base">Submit Ad for Admin Verification</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
