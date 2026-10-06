import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Linking,
} from "react-native";
import { ArrowLeft, Search, X, Store, Phone, ShieldCheck, ChevronLeft, ChevronRight, Sparkles } from "lucide-react-native";
import { router, useFocusEffect } from "expo-router";
import { useLanguage } from "@/context/LanguageContext";
import { fetchMarketProducts, fetchApprovedMarketplaceAds } from "@/service/apiClient";
import { API_BASE_URL } from "@/constant/api";
import { FloatingChatButton } from "@/components/FloatingChatButton";

const categories = [
  { key: "diseaseTagAll" as const, value: "All" },
  { key: "catSeeds" as const, value: "Seeds" },
  { key: "catFertilizers" as const, value: "Fertilizers" },
  { key: "catTools" as const, value: "Tools" },
  { key: "catSprayers" as const, value: "Sprayers" },
];

const allProducts = [
  {
    id: 1,
    name: "High-Quality Rice Seeds",
    sinhalaName: "උසස් තත්ත්වයේ වී බීජ",
    price: "Rs.450 / kg",
    category: "Seeds",
    categoryKey: "catSeeds" as const,
    image:
      "https://images.unsplash.com/photo-1607703700242-7a37b2fbb5bc?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: 2,
    name: "Organic Fertilizer",
    sinhalaName: "කාබනික පොහොර",
    price: "Rs.120 / kg",
    category: "Fertilizers",
    categoryKey: "catFertilizers" as const,
    image:
      "https://images.unsplash.com/photo-1587316745629-1a81c7b54e9b?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: 3,
    name: "Sprayer Tool",
    sinhalaName: "ස්ප්‍රේ යන්ත්‍රය",
    price: "Rs.2,200",
    category: "Sprayers",
    categoryKey: "catSprayers" as const,
    image:
      "https://images.unsplash.com/photo-1594381256940-7bcf6eb0f6b0?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: 4,
    name: "Watering Can",
    sinhalaName: "වතුර මල (Watering Can)",
    price: "Rs.750",
    category: "Tools",
    categoryKey: "catTools" as const,
    image:
      "https://images.unsplash.com/photo-1606312611231-1d6e0f51e3f1?auto=format&fit=crop&w=500&q=60",
  },
];

const Market = () => {
  const { language, t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<any[]>(allProducts);
  const [shopAds, setShopAds] = useState<any[]>([]);

  // Pagination state (6 products per page)
  const [page, setPage] = useState<number>(1);
  const pageSize = 6;

  useEffect(() => {
    setPage(1);
    fetchMarketProducts(selectedCategory, search)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(
            allProducts.filter((p) => {
              const matchesCat =
                selectedCategory === "All" || p.category === selectedCategory;
              const matchesSrch =
                p.name.toLowerCase().includes(search.toLowerCase()) ||
                p.sinhalaName.toLowerCase().includes(search.toLowerCase());
              return matchesCat && matchesSrch;
            })
          );
        }
      })
      .catch((err) => {
        console.log("Using fallback product data:", err);
        setProducts(
          allProducts.filter((p) => {
            const matchesCat =
              selectedCategory === "All" || p.category === selectedCategory;
            const matchesSrch =
              p.name.toLowerCase().includes(search.toLowerCase()) ||
              p.sinhalaName.toLowerCase().includes(search.toLowerCase());
            return matchesCat && matchesSrch;
          })
        );
      });
  }, [selectedCategory, search]);

  useFocusEffect(
    useCallback(() => {
      fetchApprovedMarketplaceAds()
        .then((data) => {
          if (Array.isArray(data)) {
            setShopAds(data);
          }
        })
        .catch((err) => console.log("Error fetching shop ads:", err));
    }, [])
  );

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

  const parseTags = (raw: any): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  const totalPages = Math.ceil(products.length / pageSize) || 1;
  const paginatedProducts = products.slice((page - 1) * pageSize, page * pageSize);

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header Banner */}
      <View className="pt-14 pb-6 px-5 bg-emerald-800 rounded-b-3xl border-b border-emerald-900/20 shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-11 h-11 rounded-2xl bg-emerald-700 border border-emerald-600 items-center justify-center shadow-sm active:opacity-80"
          >
            <ArrowLeft size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View className="flex-1 ml-3">
            <View className="flex-row items-center space-x-2 mb-0.5">
              <View className="w-2 h-2 rounded-full bg-emerald-300" />
              <Text className="text-emerald-200 text-xs font-bold uppercase tracking-wider">
                {t("agroMarketplaceTitle")}
              </Text>
            </View>
            <Text className="text-xl font-black text-white" numberOfLines={1}>
              {t("marketBannerSub")}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 mt-5 space-y-6 mb-32"
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View className="flex-row items-center bg-white border border-gray-200/80 rounded-2xl px-4 py-3 shadow-sm mb-4">
          <Search size={18} color="#059669" />
          <TextInput
            className="ml-2.5 flex-1 text-sm font-medium text-gray-900"
            placeholder={t("searchMarketPlaceholder")}
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

        {/* Dedicated Disease Remedies Banner Card */}
        <TouchableOpacity
          onPress={() => router.push("/disease-remedies-market")}
          className="bg-emerald-900 rounded-3xl p-5 border border-emerald-950/30 shadow-md mb-5 overflow-hidden active:opacity-95"
        >
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center space-x-1.5 bg-emerald-800/80 px-3 py-1 rounded-full border border-emerald-700/60">
              <ShieldCheck size={14} color="#6EE7B7" />
              <Text className="text-emerald-200 text-[11px] font-black uppercase tracking-wider ml-1">
                {t("adminVerified")}
              </Text>
            </View>
            <View className="bg-emerald-800 p-1.5 rounded-full">
              <ChevronRight size={16} color="#6EE7B7" />
            </View>
          </View>

          <Text className="text-white font-black text-lg mb-1 leading-snug">
            {t("medForDiseasesTitle")}
          </Text>
          <Text className="text-emerald-200/90 text-xs mb-3.5 leading-relaxed">
            {t("remediesHeaderSub")}
          </Text>

          <View className="bg-emerald-800 py-2.5 px-4 rounded-xl flex-row items-center justify-between border border-emerald-700">
            <Text className="text-white text-xs font-bold">
              {t("exploreRemediesBtn")}
            </Text>
            <Sparkles size={14} color="#FDE047" />
          </View>
        </TouchableOpacity>

        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-5 -mx-5 px-5"
        >
          {categories.map((catItem) => {
            const isSelected = selectedCategory === catItem.value;
            return (
              <TouchableOpacity
                key={catItem.value}
                onPress={() => setSelectedCategory(catItem.value)}
                className={`mr-2.5 px-4 py-2.5 rounded-2xl border flex-row items-center shadow-sm active:opacity-80 ${
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
                  {t(catItem.key)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Featured Verified Shop Owner Ads Carousel */}
        {shopAds.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-900 font-black text-base">
                {t("verifiedShopOffers")}
              </Text>
              <View className="bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <Text className="text-emerald-800 text-[10px] font-bold">
                  {t("adminVerified")}
                </Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-5 px-5"
            >
              {shopAds.map((ad) => {
                const tags = parseTags(ad.disease_tags);
                return (
                  <View
                    key={ad.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-200/80 mr-3.5 w-72 overflow-hidden"
                  >
                    <Image
                      source={{ uri: getImageUrl(ad.image_url) }}
                      className="w-full h-36"
                      resizeMode="cover"
                    />
                    <View className="p-4 space-y-2">
                      <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center space-x-1.5">
                          <Store size={14} color="#059669" />
                          <Text className="text-xs font-bold text-emerald-800">
                            {ad.shop_name}
                          </Text>
                        </View>
                        {ad.price_unit ? (
                          <Text className="text-xs font-black text-gray-900">
                            {ad.price_unit}
                          </Text>
                        ) : null}
                      </View>

                      <Text
                        className="text-sm font-bold text-gray-900"
                        numberOfLines={1}
                      >
                        {ad.title}
                      </Text>
                      <Text
                        className="text-xs text-gray-500 leading-relaxed"
                        numberOfLines={2}
                      >
                        {ad.description}
                      </Text>

                      {tags.length > 0 && (
                        <View className="flex-row flex-wrap gap-1 pt-1">
                          {tags.slice(0, 2).map((tg, idx) => (
                            <View
                              key={idx}
                              className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg"
                            >
                              <Text className="text-[10px] text-emerald-800 font-bold">
                                {tg.replace(/_/g, " ")}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}

                      <TouchableOpacity
                        onPress={() => handleCallShop(ad.contact_phone)}
                        className="bg-emerald-800 py-2.5 rounded-xl flex-row items-center justify-center space-x-1.5 mt-2 active:opacity-90 shadow-sm"
                      >
                        <Phone size={14} color="#FFFFFF" />
                        <Text className="text-white text-xs font-bold ml-1.5">
                          {t("contactStore")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Products Grid */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-900 font-black text-base">
              {t("allProducts")}
            </Text>
            {products.length > 0 && (
              <Text className="text-xs font-bold text-emerald-800">
                {products.length} {products.length === 1 ? "product" : "products"}
              </Text>
            )}
          </View>

          <View className="flex-row flex-wrap justify-between">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((item) => {
                const displayTitle =
                  language === "si" && item.sinhalaName
                    ? item.sinhalaName
                    : item.name;
                const displayCategory = item.categoryKey
                  ? t(item.categoryKey)
                  : item.category;

                return (
                  <View
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-200/80 shadow-sm mb-4 w-[48%] overflow-hidden"
                  >
                    <Image
                      source={{ uri: item.image }}
                      className="w-full h-36"
                      resizeMode="cover"
                    />

                    <View className="p-3.5">
                      {/* Category badge */}
                      <View className="bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg mb-2 self-start">
                        <Text className="text-[10px] font-bold text-emerald-800">
                          {displayCategory}
                        </Text>
                      </View>

                      <Text
                        className="text-sm font-bold text-gray-900 mb-1"
                        numberOfLines={1}
                      >
                        {displayTitle}
                      </Text>
                      <Text className="text-xs font-black text-emerald-800 mb-3">
                        {item.price}
                      </Text>
                      <TouchableOpacity className="bg-emerald-800 py-2.5 rounded-xl items-center active:opacity-90 shadow-sm">
                        <Text className="text-white text-xs font-bold">
                          {t("buyNow")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            ) : (
              <View className="w-full items-center py-10 bg-white rounded-2xl border border-gray-200/80">
                <Text className="text-gray-500 font-bold text-sm">
                  {t("noProductsFound")}
                </Text>
              </View>
            )}
          </View>

          {/* Pagination Controls */}
          {products.length > 0 && (
            <View className="flex-row items-center justify-between bg-white border border-gray-200/80 rounded-2xl p-3 mt-2 shadow-sm">
              <TouchableOpacity
                onPress={() => setPage((p) => Math.max(1, p - 1))}
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

              <Text className="text-xs font-black text-emerald-900">
                {t("pageIndicator")
                  .replace("{current}", page.toString())
                  .replace("{total}", totalPages.toString())}
              </Text>

              <TouchableOpacity
                onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
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
        </View>
      </ScrollView>
      <FloatingChatButton />
    </View>
  );
};

export default Market;
