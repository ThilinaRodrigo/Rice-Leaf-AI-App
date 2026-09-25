import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Linking,
} from "react-native";
import { ArrowLeft, Search, X, Store, Phone, Tag } from "lucide-react-native";
import { router } from "expo-router";
import { fetchMarketProducts, fetchApprovedMarketplaceAds } from "@/service/apiClient";
import { API_BASE_URL } from "@/constant/api";

const categories = ["All", "Seeds", "Fertilizers", "Tools", "Sprayers"];
const allProducts = [
  {
    id: 1,
    name: "High-Quality Rice Seeds",
    price: "Rs.450 / kg",
    category: "Seeds",
    image:
      "https://images.unsplash.com/photo-1607703700242-7a37b2fbb5bc?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: 2,
    name: "Organic Fertilizer",
    price: "Rs.120 / kg",
    category: "Fertilizers",
    image:
      "https://images.unsplash.com/photo-1587316745629-1a81c7b54e9b?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: 3,
    name: "Sprayer Tool",
    price: "Rs.2,200",
    category: "Sprayers",
    image:
      "https://images.unsplash.com/photo-1594381256940-7bcf6eb0f6b0?auto=format&fit=crop&w=500&q=60",
  },
  {
    id: 4,
    name: "Watering Can",
    price: "Rs.750",
    category: "Tools",
    image:
      "https://images.unsplash.com/photo-1606312611231-1d6e0f51e3f1?auto=format&fit=crop&w=500&q=60",
  },
];

const Market = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<any[]>(allProducts);
  const [shopAds, setShopAds] = useState<any[]>([]);

  useEffect(() => {
    fetchMarketProducts(selectedCategory, search)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          setProducts(allProducts.filter((p) => {
            const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
            const matchesSrch = p.name.toLowerCase().includes(search.toLowerCase());
            return matchesCat && matchesSrch;
          }));
        }
      })
      .catch((err) => {
        console.log("Using fallback product data:", err);
        setProducts(allProducts.filter((p) => {
          const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
          const matchesSrch = p.name.toLowerCase().includes(search.toLowerCase());
          return matchesCat && matchesSrch;
        }));
      });
  }, [selectedCategory, search]);

  useEffect(() => {
    fetchApprovedMarketplaceAds()
      .then((data) => {
        if (Array.isArray(data)) {
          setShopAds(data);
        }
      })
      .catch((err) => console.log("Error fetching shop ads:", err));
  }, []);

  const getImageUrl = (url: string) => {
    if (!url) return "https://images.unsplash.com/photo-1594381256940-7bcf6eb0f6b0?auto=format&fit=crop&w=500&q=60";
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

  const filteredProducts = products;

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      {/* Header */}
      <View className="flex-row items-center mb-6 mt-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-full bg-gray-200 mr-4"
        >
          <ArrowLeft size={22} color="#111" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">Agri Market</Text>
      </View>

      {/* Featured Verified Shop Owner Ads Carousel */}
      {shopAds.length > 0 && (
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-extrabold text-gray-900">
              Verified Shop Remedies & Offers
            </Text>
            <Text className="text-xs text-emerald-600 font-bold">Admin Verified</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {shopAds.map((ad) => {
              const tags = parseTags(ad.disease_tags);
              return (
                <View
                  key={ad.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 mr-4 w-72 overflow-hidden"
                >
                  <Image
                    source={{ uri: getImageUrl(ad.image_url) }}
                    className="w-full h-36"
                    resizeMode="cover"
                  />
                  <View className="p-3.5 space-y-1.5">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center space-x-1">
                        <Store size={14} color="#059669" />
                        <Text className="text-xs font-bold text-emerald-800">{ad.shop_name}</Text>
                      </View>
                      {ad.price_unit ? (
                        <Text className="text-xs font-black text-gray-900">{ad.price_unit}</Text>
                      ) : null}
                    </View>

                    <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
                      {ad.title}
                    </Text>
                    <Text className="text-xs text-gray-500" numberOfLines={2}>
                      {ad.description}
                    </Text>

                    {tags.length > 0 && (
                      <View className="flex-row flex-wrap gap-1 pt-1">
                        {tags.slice(0, 2).map((tg, idx) => (
                          <View key={idx} className="bg-purple-50 px-2 py-0.5 rounded">
                            <Text className="text-[10px] text-purple-700 font-semibold">
                              {tg.replace(/_/g, " ")}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <TouchableOpacity
                      onPress={() => handleCallShop(ad.contact_phone)}
                      className="bg-emerald-600 py-2 rounded-xl flex-row items-center justify-center space-x-1 mt-2"
                    >
                      <Phone size={14} color="#fff" />
                      <Text className="text-white text-xs font-bold">Contact Store</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Search Bar */}
      <View className="flex-row items-center bg-white rounded-2xl px-4 py-2 mb-4 shadow">
        <Search size={20} color="#999" />
        <TextInput
          className="ml-2 flex-1"
          placeholder="Search products..."
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <X size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            className={`mr-3 p-4 rounded-full border-2 items-center justify-center ${
              selectedCategory === cat
                ? "border-blue-600 bg-blue-100"
                : "border-gray-300 bg-white"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                selectedCategory === cat ? "text-blue-600" : "text-gray-700"
              }`}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products Grid */}
      <View className="flex-row flex-wrap justify-between">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((item) => (
            <View
              key={item.id}
              className="bg-white rounded-2xl shadow-md mb-4 w-[48%] overflow-hidden"
            >
              <Image
                source={{ uri: item.image }}
                className="w-full h-40"
                resizeMode="cover"
              />

              <View className="p-3">
                {/* Category badge */}
                <View className="bg-gray-200 px-2 py-1 rounded-full mb-2 self-start">
                  <Text className="text-xs text-gray-700">{item.category}</Text>
                </View>

                <Text className="text-lg font-semibold text-gray-900 mb-1">
                  {item.name}
                </Text>
                <Text className="text-gray-500 mb-3">{item.price}</Text>
                <TouchableOpacity className="bg-green-500 px-4 py-2 rounded-xl items-center active:opacity-80">
                  <Text className="text-white font-semibold">Buy Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View className="w-full items-center mt-10">
            <Text className="text-gray-500 text-lg">No products found</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default Market;
