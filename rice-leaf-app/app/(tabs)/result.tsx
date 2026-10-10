import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Image as ExpoImage } from "expo-image";
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
  Sparkles,
  MessageSquare,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Factor from "@/components/Factor";
import Action from "@/components/Action";
import { HelpModal } from "@/components/HelpModal";
import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { predictImage } from "@/service/mlService";
import { DISEASE_DATA } from "@/constant/data";
import { fetchApprovedMarketplaceAds, fetchSuggestedPosts } from "@/service/apiClient";
import { API_BASE_URL } from "@/constant/api";
import { ThumbsUp } from "lucide-react-native";

type ResultType = {
  class_id: number;
  label: string;
  confidence?: number;
  scan?: {
    image_url?: string;
  };
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
  const { language, t } = useLanguage();

  const [showModal, setShowModal] = useState(true);
  const [result, setResult] = useState<ResultType | null>(null);
  const [disease, setDisease] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<{
    isNotRiceLeaf: boolean;
    message: string;
    probability?: number;
  } | null>(null);
  const [targetedAds, setTargetedAds] = useState<any[]>([]);
  const [suggestedPosts, setSuggestedPosts] = useState<any[]>([]);
  const [imageLoadErrorCount, setImageLoadErrorCount] = useState(0);
  const [errorDetail, setErrorDetail] = useState("");
  const [previewDataUri, setPreviewDataUri] = useState<string>("");

  const imageSource =
    typeof imageUri === "string" ? imageUri : imageUri?.[0];

  useEffect(() => {
    if (!imageSource) return;

    setIsLoading(true);
    setResult(null);
    setDisease(null);
    setValidationError(null);
    setErrorDetail("");
    setImageLoadErrorCount(0);
    setPreviewDataUri("");
    setTargetedAds([]);
    setSuggestedPosts([]);

    predictImage(imageSource)
      .then((res) => {
        if (res && (res.error === "NOT_RICE_LEAF" || res.success === false)) {
          setValidationError({
            isNotRiceLeaf: true,
            message: res.message || "Please upload a clear image of a rice leaf.",
            probability: res.validation?.rice_leaf_probability,
          });
          setDisease(null);
          return;
        }

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
      .catch((err: any) => {
        if (err?.isNotRiceLeaf || err?.error === "NOT_RICE_LEAF") {
          console.log("Validation notice:", err.message);
          setValidationError({
            isNotRiceLeaf: true,
            message: err.message || "Please upload a clear image of a rice leaf.",
            probability: err.validation?.rice_leaf_probability,
          });
        } else {
          console.error("Prediction error:", err);
          setErrorDetail(String(err?.message || err));
          setValidationError(null);
        }
        setDisease(null);
      })
      .finally(() => setIsLoading(false));
  }, [imageSource]);

  // Build a base64 preview from the raw file (uses the same native read path as the upload)
  useEffect(() => {
    if (!imageSource || typeof imageSource !== "string") return;
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(imageSource);
        const blob = await resp.blob();
        const dataUri: string = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        if (!cancelled && dataUri) {
          setImageLoadErrorCount(0);
          setPreviewDataUri(dataUri);
        }
      } catch (e) {
        console.log("Preview generation failed:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [imageSource]);

  const getImageUrl = (url?: string) => {
    if (!url || typeof url !== "string") return "";
    let target = url.trim();

    if (target.startsWith("/uploads")) {
      const serverDomain = API_BASE_URL.replace("/api/v1", "");
      target = `${serverDomain}${target}`;
    } else if (target.startsWith("uploads/")) {
      const serverDomain = API_BASE_URL.replace("/api/v1", "");
      target = `${serverDomain}/${target}`;
    }

    if (target.includes("://localhost") || target.includes("://127.0.0.1")) {
      const serverDomain = API_BASE_URL.replace("/api/v1", "");
      target = target.replace(/http:\/\/(localhost|127\.0\.0\.1):\d+/, serverDomain);
    }

    if (target.startsWith("/")) {
      target = `file://${target}`;
    }

    if (target.includes("/ExperienceData/")) {
      target = target.replace(/\/ExperienceData\/@([^/]+)\/([^/]+)\//, "/ExperienceData/%40$1%2F$2/");
    }

    return target;
  };

  const handleCallShop = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/\s+/g, "")}`);
  };

  const activeName = (language === "si" && disease?.translations?.si?.name) || disease?.name;
  const activeCategory = (language === "si" && disease?.translations?.si?.category) || disease?.category;
  const activeDescription = (language === "si" && disease?.translations?.si?.description) || disease?.description;
  const activeFactors = (language === "si" && disease?.translations?.si?.factors) || disease?.factors;
  const activeActions = (language === "si" && disease?.translations?.si?.actions) || disease?.actions;

  const localImageUri = typeof imageSource === "string" ? imageSource : "";
  const serverImageUri = result?.scan?.image_url;

  const primaryServer = getImageUrl(serverImageUri);
  const formattedLocal = getImageUrl(localImageUri);
  const rawLocal = localImageUri;

  const candidateImages = [previewDataUri, primaryServer, formattedLocal, rawLocal].filter(Boolean);
  const displayImage = candidateImages[imageLoadErrorCount] || candidateImages[0] || "";

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
              {t("diagnosisResult")}
            </Text>
            <Text className="text-sm text-gray-500">
              Analysis completed
            </Text>
          </View>
        </View>

        {/* Loader */}
        {isLoading && (
          <View className="items-center justify-center mt-10">
            <ActivityIndicator size="large" color="#16a34a" />
            <Text className="mt-4 text-gray-500">
              {t("analyzing")}
            </Text>
          </View>
        )}

        {/* Result */}
        {!isLoading && disease && result && (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Analyzed Leaf Image */}
            {displayImage ? (
              <View className="mx-4 mt-4 rounded-2xl overflow-hidden shadow-sm bg-gray-200 border border-gray-200">
                <ExpoImage
                  key={displayImage}
                  source={{ uri: displayImage }}
                  style={{ width: "100%", height: 224 }}
                  contentFit="cover"
                  transition={200}
                  onError={(e) => {
                    console.warn("Display image load error:", e, "URI:", displayImage);
                    setImageLoadErrorCount((prev) => prev + 1);
                  }}
                />
              </View>
            ) : null}

            {/* Diagnosis Card */}
            <View className="bg-white mx-4 mt-4 p-5 rounded-2xl shadow-sm">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xl font-bold text-gray-900 flex-1 mr-2">
                  {activeName}
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
                {activeCategory}
              </Text>

              <Text className="text-base text-gray-700 leading-relaxed mb-4">
                {activeDescription}
              </Text>

              {/* Gemini AI Agronomist Consultation Button */}
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/(tabs)/chat" as any,
                    params: { diseaseTag: activeName },
                  })
                }
                className="bg-emerald-800 rounded-xl p-3.5 flex-row items-center justify-between shadow-sm active:opacity-90"
              >
                <View className="flex-row items-center space-x-2.5">
                  <View className="w-8 h-8 rounded-lg bg-emerald-700 items-center justify-center">
                    <Sparkles size={18} color="#A7F3D0" />
                  </View>
                  <View>
                    <Text className="text-white font-bold text-sm">
                      Ask AI
                    </Text>
                    <Text className="text-emerald-200 text-xs font-medium">
                      Get custom treatments for {activeName}
                    </Text>
                  </View>
                </View>
                <MessageSquare size={18} color="#A7F3D0" />
              </TouchableOpacity>
            </View>

            {/* Environmental Factors */}
            <View className="bg-white mx-4 mt-4 p-5 rounded-2xl shadow-sm">
              <Text className="text-lg font-semibold mb-4 text-gray-900">
                {t("riskFactors")}
              </Text>

              <View className="flex-row flex-wrap justify-between">
                {activeFactors?.map((factor: any, index: number) => (
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
              <Text className="text-lg font-semibold mb-4 text-gray-900">
                {t("recommendedActions")}
              </Text>

              {activeActions?.map((action: any, index: number) => (
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
                    {t("communitySolutionsTitle")}
                  </Text>
                  <TouchableOpacity onPress={() => router.push("/community" as any)}>
                    <Text className="text-xs font-bold text-emerald-700">{t("viewAll")}</Text>
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
                      <ExpoImage
                        source={{ uri: getImageUrl(ad.image_url) }}
                        style={{ width: 64, height: 64, borderRadius: 8 }}
                        className="mr-3 bg-gray-200"
                        contentFit="cover"
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

        {/* Validation Rejection State */}
        {!isLoading && validationError && (
          <ScrollView showsVerticalScrollIndicator={false} className="px-4 mt-4">
            {displayImage ? (
              <View className="mb-4 rounded-2xl overflow-hidden shadow-sm bg-gray-200 border border-gray-200">
                <ExpoImage
                  key={displayImage}
                  source={{ uri: displayImage }}
                  style={{ width: "100%", height: 224 }}
                  contentFit="cover"
                  transition={200}
                  onError={(e) => {
                    console.warn("Validation display image load error:", e, "URI:", displayImage);
                    setImageLoadErrorCount((prev) => prev + 1);
                  }}
                />
              </View>
            ) : null}

            <View className="bg-white p-6 rounded-3xl border border-amber-200 shadow-sm items-center">
              <View className="w-16 h-16 rounded-full bg-amber-100 items-center justify-center mb-4">
                <AlertTriangle size={32} color="#D97706" />
              </View>

              <Text className="text-xl font-bold text-gray-900 text-center mb-2">
                {language === "si" ? "ගොයම් පත්‍රයක් ලෙස හඳුනාගත නොහැක" : "Not a Rice Leaf"}
              </Text>

              <Text className="text-base text-amber-800 font-medium text-center mb-6 leading-relaxed">
                {language === "si"
                  ? "කරුණාකර පැහැදිලි ගොයම් පත්‍රයක ඡායාරූපයක් ඇතුළත් කරන්න."
                  : (validationError.message || "Please upload a clear image of a rice leaf.")}
              </Text>

              <View className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6">
                <Text className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {language === "si" ? "නිවැරදි ඡායාරූපයක් සඳහා උපදෙස්:" : "TIPS FOR BEST RESULTS:"}
                </Text>
                <Text className="text-xs text-slate-600 leading-relaxed">
                  • {language === "si" ? "ගොයම් පත්‍රය පමණක් පැහැදිලිව ඡායාරූපගත කරන්න" : "Focus directly on a single rice leaf"}{"\n"}
                  • {language === "si" ? "හොඳ ආලෝකයක් සහිත ස්ථානයක පින්තූරය ගන්න" : "Ensure bright, even lighting with clear focus"}{"\n"}
                  • {language === "si" ? "පසුබිම බොඳ නොවීමට හා ගොයම් නොවන දේ වැළකීමට වගබලා ගන්න" : "Avoid blurry background objects or non-leaf photos"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/scan" as any)}
                className="w-full bg-emerald-700 py-3.5 rounded-2xl flex-row items-center justify-center shadow-sm active:opacity-90"
              >
                <Sparkles size={18} color="#FFFFFF" />
                <Text className="text-white font-bold text-base ml-2">
                  {language === "si" ? "තවත් පින්තූරයක් ගන්න" : "Try Another Image"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}

        {/* General Error State */}
        {!isLoading && !disease && !validationError && (
          <ScrollView showsVerticalScrollIndicator={false} className="px-4 mt-4">
            {displayImage ? (
              <View className="mb-4 rounded-2xl overflow-hidden shadow-sm bg-gray-200 border border-gray-200">
                <ExpoImage
                  key={displayImage}
                  source={{ uri: displayImage }}
                  style={{ width: "100%", height: 224 }}
                  contentFit="cover"
                  transition={200}
                  onError={(e) => {
                    console.warn("General error display image load error:", e, "URI:", displayImage);
                    setImageLoadErrorCount((prev) => prev + 1);
                  }}
                />
              </View>
            ) : null}

            <View className="bg-red-50 p-6 rounded-3xl border border-red-200 items-center w-full">
              <AlertTriangle size={32} color="#EF4444" className="mb-3" />
              <Text className="text-red-700 font-bold text-base mb-1 text-center">
                {language === "si" ? "විශ්ලේෂණය අසාර්ථක විය" : "Analysis Failed"}
              </Text>
              <Text className="text-gray-600 text-xs text-center mb-5">
                {language === "si" ? "ජාල සම්බන්ධතාවය පරීක්ෂා කර නැවත උත්සාහ කරන්න" : "Unable to analyze the image. Please check network connection and try again."}
              </Text>
              {errorDetail ? (
                <Text className="text-gray-400 text-xs text-center mb-4">{errorDetail}</Text>
              ) : null}
              <TouchableOpacity
                onPress={() => router.push("/scan" as any)}
                className="bg-emerald-700 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-bold text-sm">
                  {language === "si" ? "නැවත උත්සාහ කරන්න" : "Try Again"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Result;
