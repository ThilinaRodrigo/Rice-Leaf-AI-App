import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { ArrowLeft, Search, X } from "lucide-react-native";
import { router } from "expo-router";

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

  const filteredProducts = allProducts.filter((p) => {
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      {/* Header */}
      <View className="flex-row items-center mb-10 mt-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 rounded-full bg-gray-200 mr-4"
        >
          <ArrowLeft size={22} color="#111" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-900">Agri Market</Text>
      </View>

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
