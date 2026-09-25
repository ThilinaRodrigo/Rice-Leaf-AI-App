import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  Scan,
  ShoppingBag,
  MessageCircle,
  User,
  Sparkles,
  CloudSun,
  ChevronRight,
  ShieldAlert,
  Store,
  ArrowUpRight,
} from "lucide-react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { fetchApprovedMarketplaceAds } from "@/service/apiClient";
import { useImagePicker as useGalleryPicker } from "@/hooks/useImagePicker";

const COMMON_DISEASES = [
  {
    id: "blight",
    name: "Bacterial Leaf Blight",
    sinhala: "කොළ පාළු රෝගය",
    severity: "High Risk",
    description: "Yellow-orange lesions along leaf margins. Caused by Xanthomonas oryzae.",
    bg: "bg-amber-50",
    border: "border-amber-200",
    tagColor: "text-amber-800",
  },
  {
    id: "brown_spot",
    name: "Brown Spot",
    sinhala: "තලදැමුණු ලප රෝගය",
    severity: "Moderate",
    description: "Oval brown spots with gray centres on leaves. Linked to nutrient deficiency.",
    bg: "bg-amber-500/10",
    border: "border-amber-300/40",
    tagColor: "text-amber-900",
  },
  {
    id: "smut",
    name: "Leaf Smut",
    sinhala: "කොළ අඟුරු රෝගය",
    severity: "Low Risk",
    description: "Small black linear spots on both leaf surfaces. Remove infected leaves early.",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    tagColor: "text-emerald-800",
  },
];

export default function Index() {
  const { user } = useAuth();
  const { pickImageFromGallery } = useGalleryPicker();
  const [featuredAds, setFeaturedAds] = useState<any[]>([]);
  const [loadingAds, setLoadingAds] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoadingAds(true);
      const ads = await fetchApprovedMarketplaceAds();
      setFeaturedAds(ads ? ads.slice(0, 4) : []);
    } catch (e) {
      console.log("Failed loading dashboard market ads", e);
    } finally {
      setLoadingAds(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleOpenGallery = async () => {
    const uri = await pickImageFromGallery();
    if (uri) {
      router.push({ pathname: "/result", params: { imageUri: uri } });
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-slate-900"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
      }
    >
      {/* Header Banner */}
      <View className="pt-14 pb-6 px-5 bg-emerald-950/80 rounded-b-3xl border-b border-emerald-900/40">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-3 flex-1">
            <View className="w-12 h-12 rounded-2xl bg-slate-900 border border-emerald-500/30 overflow-hidden p-1">
              <Image
                source={require("@/assets/images/logo.png")}
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center space-x-2 mb-0.5">
                <View className="w-2 h-2 rounded-full bg-emerald-400" />
                <Text className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                  Rice Leaf AI
                </Text>
              </View>
              <Text className="text-xl font-black text-white" numberOfLines={1}>
                Ayubowan, {user ? user.full_name.split(" ")[0] : "Farmer"}! 👋
              </Text>
              <Text className="text-slate-400 text-[11px]">
                AI Disease Detection & Agro Market
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/profile")}
            className="w-11 h-11 rounded-2xl bg-emerald-900/60 border border-emerald-700/50 items-center justify-center shadow-md active:opacity-80 ml-2"
          >
            <User size={22} color="#34D399" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-5 mt-5 space-y-6 mb-28">
        {/* Main Hero Scan Card */}
        <View className="bg-gradient-to-br from-emerald-800 to-teal-950 p-6 rounded-3xl border border-emerald-600/40 shadow-xl relative overflow-hidden">
          <View className="flex-row items-center justify-between mb-3">
            <View className="bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 rounded-full flex-row items-center">
              <Sparkles size={14} color="#34D399" />
              <Text className="text-emerald-300 font-bold text-xs ml-1.5">
                AI Powered Diagnosis
              </Text>
            </View>
          </View>

          <Text className="text-xl font-black text-white mb-2 leading-tight">
            Scan Paddy Leaf to Detect Diseases Instantly
          </Text>
          <Text className="text-emerald-100/80 text-xs leading-relaxed mb-6">
            Take a clear photo of infected leaves or upload from gallery to get diagnosis, recommended remedies, and nearby agro store products.
          </Text>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() => router.push("/scan")}
              className="flex-1 bg-emerald-500 py-3.5 px-4 rounded-2xl flex-row items-center justify-center shadow-lg active:opacity-90"
            >
              <Scan size={20} color="#FFFFFF" />
              <Text className="text-white font-extrabold text-sm ml-2">Open Camera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleOpenGallery}
              className="bg-slate-900/80 border border-emerald-500/40 py-3.5 px-4 rounded-2xl flex-row items-center justify-center active:opacity-90"
            >
              <Text className="text-emerald-300 font-bold text-sm">Upload Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Paddy Field Weather & Advisory Card */}
        <View className="bg-slate-800/80 border border-slate-700/60 p-4 rounded-2xl flex-row items-center space-x-3">
          <View className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 items-center justify-center">
            <CloudSun size={24} color="#F59E0B" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-white font-bold text-sm">Agro Advisory Notice</Text>
              <Text className="text-amber-400 text-xs font-bold">Humid Season</Text>
            </View>
            <Text className="text-slate-300 text-xs mt-0.5 leading-snug">
              High atmospheric humidity increases Bacterial Leaf Blight risk. Inspect tillers daily.
            </Text>
          </View>
        </View>

        {/* Quick Navigation Shortcuts */}
        <View>
          <Text className="text-white font-bold text-base mb-3">Quick Services</Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity
              onPress={() => router.push("/scan")}
              className="w-[48%] bg-slate-800/90 border border-emerald-500/30 p-4 rounded-2xl mb-3 flex-row items-center space-x-3 active:opacity-80"
            >
              <View className="w-10 h-10 rounded-xl bg-emerald-500/20 items-center justify-center">
                <Scan size={20} color="#34D399" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-sm">AI Scan</Text>
                <Text className="text-slate-400 text-[10px]">Leaf diagnosis</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/market")}
              className="w-[48%] bg-slate-800/90 border border-emerald-500/30 p-4 rounded-2xl mb-3 flex-row items-center space-x-3 active:opacity-80"
            >
              <View className="w-10 h-10 rounded-xl bg-amber-500/20 items-center justify-center">
                <ShoppingBag size={20} color="#F59E0B" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-sm">Agro Store</Text>
                <Text className="text-slate-400 text-[10px]">Buy remedies</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/chat")}
              className="w-[48%] bg-slate-800/90 border border-emerald-500/30 p-4 rounded-2xl flex-row items-center space-x-3 active:opacity-80"
            >
              <View className="w-10 h-10 rounded-xl bg-teal-500/20 items-center justify-center">
                <MessageCircle size={20} color="#2DD4BF" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-sm">AI Chat</Text>
                <Text className="text-slate-400 text-[10px]">Agronomist Q&A</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/profile")}
              className="w-[48%] bg-slate-800/90 border border-emerald-500/30 p-4 rounded-2xl flex-row items-center space-x-3 active:opacity-80"
            >
              <View className="w-10 h-10 rounded-xl bg-purple-500/20 items-center justify-center">
                <User size={20} color="#C084FC" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-sm">Profile</Text>
                <Text className="text-slate-400 text-[10px]">Account & Ads</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rice Disease Identification Guide */}
        <View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white font-bold text-base">Common Paddy Diseases</Text>
            <TouchableOpacity onPress={() => router.push("/chat")} className="flex-row items-center">
              <Text className="text-emerald-400 text-xs font-bold mr-1">Ask AI</Text>
              <ChevronRight size={14} color="#34D399" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
            {COMMON_DISEASES.map((item) => (
              <View
                key={item.id}
                className="w-64 bg-slate-800 border border-slate-700/80 rounded-2xl p-4 mr-3"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <ShieldAlert size={16} color="#F59E0B" />
                    <Text className="text-amber-400 font-extrabold text-xs ml-1.5">
                      {item.severity}
                    </Text>
                  </View>
                  <Text className="text-slate-400 text-[10px] font-medium">{item.sinhala}</Text>
                </View>

                <Text className="text-white font-bold text-sm mb-1">{item.name}</Text>
                <Text className="text-slate-300 text-xs leading-relaxed mb-3">
                  {item.description}
                </Text>

                <TouchableOpacity
                  onPress={() => router.push({ pathname: "/market", params: { search: item.name } })}
                  className="bg-emerald-950 border border-emerald-700/50 py-2 px-3 rounded-xl flex-row items-center justify-between active:opacity-80"
                >
                  <Text className="text-emerald-400 text-xs font-bold">Find Remedies</Text>
                  <ArrowUpRight size={14} color="#34D399" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Featured Market Remedies & Supplies */}
        <View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white font-bold text-base">Local Agro Store Products</Text>
            <TouchableOpacity onPress={() => router.push("/market")} className="flex-row items-center">
              <Text className="text-emerald-400 text-xs font-bold mr-1">View All</Text>
              <ChevronRight size={14} color="#34D399" />
            </TouchableOpacity>
          </View>

          {loadingAds ? (
            <ActivityIndicator color="#10B981" size="small" className="py-6" />
          ) : featuredAds.length > 0 ? (
            <View className="flex-row flex-wrap justify-between">
              {featuredAds.map((ad) => (
                <View
                  key={ad.id}
                  className="w-[48%] bg-slate-800 border border-slate-700 rounded-2xl p-3 mb-3"
                >
                  {ad.image_url ? (
                    <Image
                      source={{ uri: ad.image_url }}
                      className="w-full h-24 rounded-xl mb-2 bg-slate-900"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-24 rounded-xl mb-2 bg-slate-900 items-center justify-center">
                      <ShoppingBag size={28} color="#475569" />
                    </View>
                  )}

                  <Text className="text-white font-bold text-xs numberOfLines={1} mb-0.5">
                    {ad.title}
                  </Text>
                  <Text className="text-emerald-400 font-extrabold text-xs mb-1">
                    {ad.price_unit}
                  </Text>

                  <View className="flex-row items-center">
                    <Store size={12} color="#94A3B8" />
                    <Text className="text-slate-400 text-[10px] ml-1 flex-1 numberOfLines={1}">
                      {ad.shop_name}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => router.push("/market")}
              className="bg-slate-800/60 border border-slate-700/60 p-5 rounded-2xl items-center"
            >
              <ShoppingBag size={32} color="#34D399" />
              <Text className="text-white font-bold text-sm mt-2">Explore Agro Marketplace</Text>
              <Text className="text-slate-400 text-xs text-center mt-1">
                Connect with verified local agro shops for fertilizers, fungicides, and rice leaf remedies.
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

