import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {
  ArrowLeft,
  Droplet,
  Thermometer,
  Calendar,
  ShieldCheck,
  Zap,
  AlertTriangle,
  HelpCircle,
  Store,
  Phone,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Factor from "@/components/Factor";
import Action from "@/components/Action";
import { HelpModal } from "@/components/HelpModal";
import { useState, useEffect } from "react";
import { predictImage } from "@/service/mlService";
import { DISEASE_DATA } from "@/constant/data";
import { fetchApprovedMarketplaceAds, fetchSuggestedPosts } from "@/service/apiClient";
import { API_BASE_URL } from "@/constant/api";
import { ThumbsUp } from "lucide-react-native";

type ResultType = {
  class_id: number;
  label: string;
  confidence?: number;
};

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Droplet,
  Thermometer,
  Calendar,
  ShieldCheck,
  Zap,
  AlertTriangle,
};

const renderFactorIcon = (iconProp: any, color: string) => {
  let IconComponent: React.ComponentType<any> = HelpCircle;

  if (typeof iconProp === "function" || (typeof iconProp === "object" && iconProp !== null)) {
    IconComponent = iconProp;
  } else if (typeof iconProp === "string" && ICON_MAP[iconProp]) {
    IconComponent = ICON_MAP[iconProp];
  }

  return <IconComponent size={22} color={color} />;
};

const Result = () => {
  const { imageUri } = useLocalSearchParams();

  const [showModal, setShowModal] = useState(true);
  const [result, setResult] = useState<ResultType | null>(null);
  const [disease, setDisease] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [targetedAds, setTargetedAds] = useState<any[]>([]);
  const [suggestedPosts, setSuggestedPosts] = useState<any[]>([]);

  const imageSource =
    typeof imageUri === "string" ? imageUri : imageUri?.[0];

  useEffect(() => {
    if (!imageSource) return;

    setIsLoading(true);

    predictImage(imageSource)
      .then((res) => {
        setResult(res);
        let fetchedDisease = res.disease || DISEASE_DATA[res.class_id];
        if (!fetchedDisease) {
          fetchedDisease = DISEASE_DATA[res.class_id] ?? null;
        }

        if (fetchedDisease) {
          let factors = fetchedDisease.factors;
          if (typeof factors === "string") {
            try {
              factors = JSON.parse(factors);
            } catch (e) {
              console.error("Failed parsing factors JSON:", e);
            }
          }

          let actions = fetchedDisease.actions;
          if (typeof actions === "string") {
            try {
              actions = JSON.parse(actions);
            } catch (e) {
              console.error("Failed parsing actions JSON:", e);
            }
          }

          fetchedDisease = {
            ...fetchedDisease,
            factors,
            actions,
          };

          // Fetch targeted shop ads matching disease key
          if (fetchedDisease.key) {
            fetchApprovedMarketplaceAds(fetchedDisease.key)
              .then((adsData) => {
                if (Array.isArray(adsData)) setTargetedAds(adsData);
              })
              .catch((e) => console.log("Failed fetching targeted ads:", e));

            fetchSuggestedPosts(fetchedDisease.key)
              .then((postsData) => {
                if (Array.isArray(postsData)) setSuggestedPosts(postsData);
              })
              .catch((e) => console.log("Failed fetching suggested posts:", e));
          }
        }

        setDisease(fetchedDisease);
      })
      .catch((err) => {
        console.error("Prediction error:", err);
        setDisease(null);
      })
      .finally(() => setIsLoading(false));
  }, [imageSource]);

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

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="flex-1">
        {/* Help Modal */}
        <HelpModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          onContinue={() => {
            setShowModal(false);
            router.push("/chat");
          }}
        />

        {/* Header */}
        <View className="flex-row items-center px-4 py-4 bg-white shadow-sm">
          <TouchableOpacity onPress={router.back} className="p-2 -ml-2">
            <ArrowLeft size={24} color="#111" />
          </TouchableOpacity>

          <View className="ml-3">
            <Text className="text-xl font-bold text-gray-900">
              Diagnosis Result
            </Text>
            <Text className="text-sm text-gray-500">
              Analysis completed
            </Text>
          </View>
        </View>

        {/* Image */}
        {imageSource && (
          <Image
            source={{ uri: imageSource }}
            className="w-full h-60"
            resizeMode="cover"
          />
        )}

        {/* Loader */}
        {isLoading && (
          <View className="items-center justify-center mt-10">
            <ActivityIndicator size="large" color="#16a34a" />
            <Text className="mt-4 text-gray-500">
              Analyzing leaf image...
            </Text>
          </View>
        )}

        {/* Result */}
        {!isLoading && disease && result && (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Diagnosis Card */}
            <View className="bg-white mx-4 mt-4 p-5 rounded-2xl shadow-sm">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xl font-bold text-gray-900">
                  {disease.name}
                </Text>

                {result.confidence !== undefined && (
                  <View className="bg-green-100 px-3 py-1 rounded-full">
                    <Text className="text-green-700 font-semibold text-sm">
                      {Math.round(result.confidence * 100)}% Match
                    </Text>
                  </View>
                )}
              </View>

              <Text className="text-sm text-gray-500 mb-3">
                {disease.category}
              </Text>

              <Text className="text-base text-gray-700 leading-relaxed">
                {disease.description}
              </Text>
            </View>

            {/* Environmental Factors */}
            <View className="bg-white mx-4 mt-4 p-5 rounded-2xl shadow-sm">
              <Text className="text-lg font-semibold mb-4">
                Environmental Factors
              </Text>

              <View className="flex-row flex-wrap justify-between">
                {disease.factors?.map((factor: any, index: number) => (
                  <Factor
                    key={index}
                    icon={renderFactorIcon(factor.icon, factor.color || "#3B82F6")}
                    label={factor.label}
                    value={factor.value}
                  />
                ))}
              </View>
            </View>

            {/* Actions */}
            <View className="bg-white mx-4 mt-4 p-5 rounded-2xl shadow-sm">
              <Text className="text-lg font-semibold mb-4">
                Recommended Actions
              </Text>

              {disease.actions?.map((action: any, index: number) => (
                <Action
                  key={index}
                  title={action.title}
                  subtitle={action.subtitle}
                />
              ))}
            </View>

            {/* Top Community Solutions & Farmer Advice */}
            {suggestedPosts.length > 0 && (
              <View className="bg-white mx-4 mt-4 p-5 rounded-2xl shadow-sm">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-lg font-bold text-gray-900">
                    Community Advice & Solutions
                  </Text>
                  <TouchableOpacity onPress={() => router.push("/community" as any)}>
                    <Text className="text-xs font-bold text-emerald-700">View All</Text>
                  </TouchableOpacity>
                </View>

                <View className="space-y-3">
                  {suggestedPosts.map((post) => (
                    <View
                      key={post.id}
                      className="bg-slate-50 p-3.5 rounded-xl border border-gray-200/80 space-y-1.5"
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className="text-xs font-bold text-emerald-800">{post.author_name}</Text>
                        <View className="flex-row items-center space-x-1">
                          <ThumbsUp size={13} color="#059669" />
                          <Text className="text-[11px] font-bold text-emerald-800">{post.likes_count}</Text>
                        </View>
                      </View>
                      <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
                        {post.title}
                      </Text>
                      <Text className="text-xs text-gray-600 leading-relaxed" numberOfLines={2}>
                        {post.content}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Targeted Shop Remedies & Offers */}
            {targetedAds.length > 0 && (
              <View className="bg-white mx-4 mt-4 mb-28 p-5 rounded-2xl shadow-sm">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-lg font-bold text-gray-900">
                    Verified Shop Remedies Available
                  </Text>
                  <Text className="text-xs font-bold text-emerald-600">Store Direct</Text>
                </View>

                <View className="space-y-3">
                  {targetedAds.map((ad) => (
                    <View
                      key={ad.id}
                      className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex-row items-center justify-between"
                    >
                      <Image
                        source={{ uri: getImageUrl(ad.image_url) }}
                        className="w-16 h-16 rounded-lg mr-3 bg-gray-200"
                        resizeMode="cover"
                      />
                      <View className="flex-1 pr-2">
                        <Text className="text-xs font-bold text-emerald-800">{ad.shop_name}</Text>
                        <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
                          {ad.title}
                        </Text>
                        {ad.price_unit ? (
                          <Text className="text-xs font-bold text-gray-700">{ad.price_unit}</Text>
                        ) : null}
                      </View>

                      <TouchableOpacity
                        onPress={() => handleCallShop(ad.contact_phone)}
                        className="bg-emerald-600 px-3 py-2 rounded-xl flex-row items-center space-x-1"
                      >
                        <Phone size={14} color="#fff" />
                        <Text className="text-white text-xs font-bold">Call</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {targetedAds.length === 0 && <View className="mb-28" />}
          </ScrollView>
        )}

        {/* Error State */}
        {!isLoading && !disease && (
          <View className="items-center mt-10">
            <Text className="text-red-500">
              Unable to analyze the image.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Result;
