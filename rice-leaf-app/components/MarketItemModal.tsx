import React from "react";
import {
  Modal,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  StyleSheet,
} from "react-native";
import {
  X,
  Store,
  Phone,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Sparkles,
  Info,
} from "lucide-react-native";
import { SERVER_BASE_URL } from "@/constant/api";
import { useLanguage } from "@/context/LanguageContext";

interface MarketItemModalProps {
  visible: boolean;
  onClose: () => void;
  item: any | null;
}

const screenHeight = Dimensions.get("window").height;

export const MarketItemModal: React.FC<MarketItemModalProps> = ({
  visible,
  onClose,
  item,
}) => {
  const { language, t } = useLanguage();

  if (!item) return null;

  // Resolve image URL
  const rawImage = item.image_url || item.image;
  const getImageUrl = (url?: string) => {
    if (!url) {
      return "https://images.unsplash.com/photo-1594381256940-7bcf6eb0f6b0?auto=format&fit=crop&w=600&q=70";
    }
    if (url.startsWith("/uploads")) {
      return `${SERVER_BASE_URL}${url}`;
    }
    return url;
  };

  const imageUrl = getImageUrl(rawImage);

  // Phone action
  const handleCall = (phone?: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/\s+/g, "")}`);
  };

  // Parse disease tags
  const parseTags = (raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  const diseaseTags = parseTags(item.disease_tags);

  const displayTitle =
    language === "si" && item.sinhalaName ? item.sinhalaName : item.title || item.name;

  const displayPrice = item.price || item.price_unit;
  const displayCategory = item.categoryKey ? t(item.categoryKey) : item.category;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop tap to close */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />

        {/* Modal Sheet Content */}
        <View style={styles.modalContent} className="bg-white rounded-t-3xl overflow-hidden shadow-2xl">
          {/* Top Hero Image Header */}
          <View style={{ width: "100%", height: 230 }} className="relative bg-slate-900">
            <Image
              source={{ uri: imageUrl }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />

            {/* Gradient / Dark overlay shadow at the top for close button contrast */}
            <View className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/60 to-transparent" />

            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 border border-white/20 items-center justify-center active:opacity-80 shadow-lg"
            >
              <X size={20} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Verified Badge Overlay */}
            <View className="absolute bottom-4 left-4 flex-row items-center space-x-2">
              <View className="flex-row items-center bg-emerald-900/90 border border-emerald-500/50 px-3 py-1.5 rounded-full shadow-md">
                <ShieldCheck size={14} color="#6EE7B7" />
                <Text className="text-emerald-200 text-xs font-black ml-1.5 uppercase tracking-wider">
                  {t("adminVerified")}
                </Text>
              </View>

              {displayCategory ? (
                <View className="bg-white/90 border border-white px-3 py-1.5 rounded-full shadow-md">
                  <Text className="text-gray-900 text-xs font-bold">
                    {displayCategory}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Scrollable Details Body */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
            className="space-y-4"
          >
            {/* Price & Category */}
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-[11px] font-black text-emerald-800 uppercase tracking-widest">
                  {t("priceUnit") || "Price"}
                </Text>
                <Text className="text-2xl font-black text-emerald-800">
                  {displayPrice || "Contact for Price"}
                </Text>
              </View>

              {item.stock !== undefined && (
                <View className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl items-end">
                  <Text className="text-[10px] font-bold text-gray-500 uppercase">
                    Stock
                  </Text>
                  <Text className="text-xs font-extrabold text-emerald-800">
                    {item.stock > 0 ? `${item.stock} Available` : "Out of Stock"}
                  </Text>
                </View>
              )}
            </View>

            {/* Title */}
            <View>
              <Text className="text-xl font-black text-gray-900 leading-tight">
                {displayTitle}
              </Text>
              {language === "si" && item.name && item.name !== displayTitle && (
                <Text className="text-xs text-gray-500 font-semibold mt-0.5">
                  English: {item.name}
                </Text>
              )}
            </View>

            {/* Shop / Vendor Card */}
            {item.shop_name ? (
              <View className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center space-x-2 flex-1 mr-2">
                    <View className="w-8 h-8 rounded-xl bg-emerald-800 items-center justify-center">
                      <Store size={16} color="#FFFFFF" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-gray-500 font-medium">
                        Agro Dealer / Store
                      </Text>
                      <Text
                        className="text-sm font-extrabold text-emerald-950"
                        numberOfLines={1}
                      >
                        {item.shop_name}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center bg-emerald-100/80 px-2 py-0.5 rounded-lg border border-emerald-300/60">
                    <CheckCircle2 size={12} color="#065F46" />
                    <Text className="text-[10px] font-bold text-emerald-900 ml-1">
                      Verified
                    </Text>
                  </View>
                </View>

                {item.contact_phone ? (
                  <View className="flex-row items-center justify-between pt-2 border-t border-emerald-200/50">
                    <View className="flex-row items-center space-x-1.5">
                      <Phone size={14} color="#059669" />
                      <Text className="text-xs font-bold text-gray-800">
                        {item.contact_phone}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleCall(item.contact_phone)}
                      className="bg-emerald-800 px-3.5 py-1.5 rounded-xl flex-row items-center space-x-1 shadow-sm active:opacity-90"
                    >
                      <Phone size={12} color="#FFFFFF" />
                      <Text className="text-white text-xs font-bold ml-1">
                        Call Now
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ) : null}

            {/* Disease Treatment Tags */}
            {diseaseTags.length > 0 && (
              <View className="space-y-1.5">
                <View className="flex-row items-center space-x-1.5 mb-1">
                  <Tag size={13} color="#059669" />
                  <Text className="text-xs font-black text-gray-700 uppercase tracking-wider">
                    Recommended For Crop Diseases
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-2">
                  {diseaseTags.map((tag, idx) => (
                    <View
                      key={idx}
                      className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl flex-row items-center space-x-1"
                    >
                      <Sparkles size={11} color="#059669" />
                      <Text className="text-xs font-bold text-emerald-800 ml-1">
                        {tag.replace(/_/g, " ")}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Description Section */}
            <View className="space-y-1 pt-1">
              <View className="flex-row items-center space-x-1 mb-1">
                <Info size={14} color="#64748B" />
                <Text className="text-xs font-black text-gray-700 uppercase tracking-wider">
                  Product Details & Usage
                </Text>
              </View>
              <Text className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                {item.description ||
                  "No detailed description provided by the agro dealer for this item."}
              </Text>
            </View>

            {/* Bottom Actions */}
            <View className="pt-3 space-y-2.5">
              {item.contact_phone ? (
                <TouchableOpacity
                  onPress={() => handleCall(item.contact_phone)}
                  className="bg-emerald-800 py-3.5 rounded-2xl flex-row items-center justify-center space-x-2 shadow-lg shadow-emerald-800/30 active:opacity-90"
                >
                  <Phone size={18} color="#FFFFFF" />
                  <Text className="text-white text-sm font-black ml-2">
                    {t("contactStore") || "Contact Agro Dealer"} ({item.contact_phone})
                  </Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                onPress={onClose}
                className="bg-gray-100 py-3 rounded-2xl items-center active:opacity-80"
              >
                <Text className="text-gray-700 text-xs font-bold">
                  {t("close") || "Close Details"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.72)",
    justifyContent: "flex-end",
  },
  modalContent: {
    width: "100%",
    maxHeight: screenHeight * 0.85,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
});
