import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { ArrowLeft, Search, X, Store, Phone, MessageSquare, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import { fetchPaginatedMarketplaceAds } from "@/service/apiClient";
import { API_BASE_URL } from "@/constant/api";

const diseaseFilters = [
  { label: "All Diseases", value: "All" },
  { label: "Bacterial Leaf Blight", value: "bacterial_leaf_blight" },
  { label: "Brown Spot", value: "brown_spot" },
  { label: "Leaf Scald", value: "leaf_scald" },
  { label: "Narrow Brown Spot", value: "narrow_brown_spot" },
  { label: "Healthy / General", value: "healthy" },
];

const categoryFilters = [
  { label: "All Categories", value: "All" },
  { label: "Fungicides & Remedies", value: "Fungicides & Remedies" },
  { label: "Fertilizers", value: "Fertilizers" },
  { label: "Seeds", value: "Seeds" },
  { label: "Sprayers", value: "Sprayers" },
  { label: "Tools", value: "Tools" },
];

const DiseaseRemediesMarketScreen = () => {
  const { language, t } = useLanguage();
  const [selectedDisease, setSelectedDisease] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  
  const [ads, setAds] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(6);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadRemedies = useCallback(
    async (targetPage = 1) => {
      setLoading(true);
      try {
        const res = await fetchPaginatedMarketplaceAds({
          diseaseTag: selectedDisease === "All" ? undefined : selectedDisease,
          category: selectedCategory === "All" ? undefined : selectedCategory,
          search: search.trim() || undefined,
          page: targetPage,
          limit,
        });

        if (Array.isArray(res)) {
          setAds(res);
          setTotalPages(1);
          setTotalCount(res.length);
        } else if (res && res.data) {
          setAds(res.data || []);
          setTotalPages(res.total_pages || 1);
          setTotalCount(res.total || 0);
          setPage(res.page || targetPage);
        } else {
          setAds([]);
          setTotalPages(1);
          setTotalCount(0);
        }
      } catch (err) {
        console.error("Error loading disease remedies:", err);
        setAds([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedDisease, selectedCategory, search, limit]
  );

  useEffect(() => {
    setPage(1);
    loadRemedies(1);
  }, [selectedDisease, selectedCategory, search, loadRemedies]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRemedies(page);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      loadRemedies(newPage);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url)
      return "https://images.unsplash.com/photo-1594381256940-7bcf6eb0f6b0?auto=format&fit=crop&w=500&q=60";
    if (url.startsWith("/uploads")) {
      const serverDomain = API_BASE_URL.replace("/api/v1", "");
      return `${serverDomain}${url}`;
    }
    return url;
  };

  const handleCallShop = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/\s+/g, "")}`);
  };

  const handleWhatsAppShop = (phone: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, "");
    Linking.openURL(`https://wa.me/${cleanPhone}`);
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

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header Banner */}
      <View className="pt-14 pb-6 px-5 bg-emerald-900 rounded-b-3xl border-b border-emerald-950/20 shadow-md">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 rounded-2xl bg-emerald-800 border border-emerald-700 items-center justify-center shadow-sm active:opacity-80"
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View className="flex-1 ml-3">
            <View className="flex-row items-center space-x-2 mb-0.5">
              <ShieldCheck size={14} color="#6EE7B7" />
              <Text className="text-emerald-300 text-xs font-bold uppercase tracking-wider">
                {t("adminVerified")}
              </Text>
            </View>
            <Text className="text-lg font-black text-white" numberOfLines={1}>
              {t("medForDiseasesTitle")}
            </Text>
          </View>
        </View>
        <Text className="text-emerald-200/90 text-xs mt-2 leading-relaxed">
          {t("remediesHeaderSub")}
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-5 mt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#059669"]} />
        }
      >
        {/* Search Bar */}
        <View className="flex-row items-center bg-white border border-gray-200/80 rounded-2xl px-4 py-3 shadow-sm mb-4">
          <Search size={18} color="#059669" />
          <TextInput
            className="ml-2.5 flex-1 text-sm font-medium text-gray-900"
            placeholder={t("searchRemedyPlaceholder")}
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <X size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Paddy Disease Filter Pills */}
        <View className="mb-3">
          <Text className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">
            {t("filterByDisease")}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
            {diseaseFilters.map((d) => {
              const isSelected = selectedDisease === d.value;
              return (
                <TouchableOpacity
                  key={d.value}
                  onPress={() => setSelectedDisease(d.value)}
                  className={`mr-2 px-3.5 py-2 rounded-xl border shadow-xs active:opacity-80 ${
                    isSelected
                      ? "bg-emerald-800 border-emerald-800"
                      : "bg-white border-gray-200/80"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      isSelected ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Category Filter Pills */}
        <View className="mb-5">
          <Text className="text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">
            {t("filterByCategory")}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
            {categoryFilters.map((c) => {
              const isSelected = selectedCategory === c.value;
              return (
                <TouchableOpacity
                  key={c.value}
                  onPress={() => setSelectedCategory(c.value)}
                  className={`mr-2 px-3.5 py-2 rounded-xl border shadow-xs active:opacity-80 ${
                    isSelected
                      ? "bg-emerald-700 border-emerald-700"
                      : "bg-white border-gray-200/80"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      isSelected ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Products List / Grid */}
        {loading ? (
          <View className="py-16 items-center justify-center">
            <ActivityIndicator size="large" color="#059669" />
          </View>
        ) : ads.length > 0 ? (
          <View className="space-y-4 mb-6">
            {ads.map((ad) => {
              const tags = parseTags(ad.disease_tags);
              return (
                <View
                  key={ad.id}
                  className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden mb-4"
                >
                  <View className="flex-row">
                    <Image
                      source={{ uri: getImageUrl(ad.image_url) }}
                      className="w-32 h-36"
                      resizeMode="cover"
                    />
                    <View className="flex-1 p-3.5 justify-between">
                      <View>
                        <View className="flex-row items-center justify-between mb-1">
                          <View className="flex-row items-center space-x-1">
                            <Store size={12} color="#059669" />
                            <Text className="text-[11px] font-bold text-emerald-800" numberOfLines={1}>
                              {ad.shop_name}
                            </Text>
                          </View>
                          {ad.category && (
                            <View className="bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                              <Text className="text-[9px] font-bold text-emerald-800">
                                {ad.category}
                              </Text>
                            </View>
                          )}
                        </View>

                        <Text className="text-sm font-bold text-gray-900 mb-0.5" numberOfLines={1}>
                          {ad.title}
                        </Text>
                        <Text className="text-xs text-gray-500 leading-snug mb-1" numberOfLines={2}>
                          {ad.description}
                        </Text>
                        {ad.price_unit ? (
                          <Text className="text-xs font-black text-emerald-800">
                            {ad.price_unit}
                          </Text>
                        ) : null}
                      </View>

                      {/* Disease Tag Chips */}
                      {tags.length > 0 && (
                        <View className="flex-row flex-wrap gap-1 my-1">
                          {tags.map((tg: string, idx: number) => (
                            <View
                              key={idx}
                              className="bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md"
                            >
                              <Text className="text-[9px] text-emerald-800 font-bold">
                                {tg.replace(/_/g, " ")}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {/* Contact Buttons */}
                      <View className="flex-row space-x-2 mt-1">
                        <TouchableOpacity
                          onPress={() => handleCallShop(ad.contact_phone)}
                          className="flex-1 bg-emerald-800 py-1.5 rounded-xl flex-row items-center justify-center active:opacity-90"
                        >
                          <Phone size={12} color="#FFFFFF" />
                          <Text className="text-white text-[11px] font-bold ml-1">
                            {t("callShop")}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => handleWhatsAppShop(ad.contact_phone)}
                          className="flex-1 bg-green-600 py-1.5 rounded-xl flex-row items-center justify-center active:opacity-90 ml-1.5"
                        >
                          <MessageSquare size={12} color="#FFFFFF" />
                          <Text className="text-white text-[11px] font-bold ml-1">
                            {t("whatsappShop")}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View className="w-full items-center py-14 bg-white rounded-2xl border border-gray-200/80 mb-6 px-4">
            <Store size={36} color="#94A3B8" />
            <Text className="text-gray-700 font-bold text-sm mt-3 text-center">
              {t("noProductsFound")}
            </Text>
            <Text className="text-gray-400 text-xs mt-1 text-center">
              Try adjusting your disease or category filter
            </Text>
          </View>
        )}

        {/* Pagination Bar - Always visible when products are loaded */}
        {!loading && (
          <View className="flex-row items-center justify-between bg-white border border-gray-200/80 rounded-2xl p-3 mb-10 shadow-sm">
            <TouchableOpacity
              onPress={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className={`px-3.5 py-2 rounded-xl flex-row items-center ${
                page <= 1 ? "bg-gray-100 opacity-50" : "bg-emerald-50 border border-emerald-200"
              }`}
            >
              <ChevronLeft size={16} color={page <= 1 ? "#94A3B8" : "#059669"} />
              <Text
                className={`text-xs font-bold ml-1 ${
                  page <= 1 ? "text-gray-400" : "text-emerald-800"
                }`}
              >
                {t("prevPage")}
              </Text>
            </TouchableOpacity>

            <View className="items-center">
              <Text className="text-xs font-black text-emerald-900">
                {t("pageIndicator")
                  .replace("{current}", page.toString())
                  .replace("{total}", Math.max(1, totalPages).toString())}
              </Text>
              {totalCount > 0 && (
                <Text className="text-[10px] text-gray-500 font-medium">
                  {totalCount} {totalCount === 1 ? "remedy" : "remedies"} total
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={() => handlePageChange(page + 1)}
              disabled={page >= totalPages}
              className={`px-3.5 py-2 rounded-xl flex-row items-center ${
                page >= totalPages
                  ? "bg-gray-100 opacity-50"
                  : "bg-emerald-50 border border-emerald-200"
              }`}
            >
              <Text
                className={`text-xs font-bold mr-1 ${
                  page >= totalPages ? "text-gray-400" : "text-emerald-800"
                }`}
              >
                {t("nextPage")}
              </Text>
              <ChevronRight size={16} color={page >= totalPages ? "#94A3B8" : "#059669"} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default DiseaseRemediesMarketScreen;
