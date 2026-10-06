import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import {
  Scan,
  ShoppingBag,
  MessageCircle,
  User,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
} from "lucide-react-native";
import { router } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useImagePicker as useGalleryPicker } from "@/hooks/useImagePicker";
import { FloatingChatButton } from "@/components/FloatingChatButton";

const COMMON_DISEASES = [
  {
    id: "blight",
    name: "Bacterial Leaf Blight",
    sinhalaName: "බැක්ටීරියා පත්‍ර අංගමාරය",
    severityKey: "highRisk" as const,
    description: "Yellow-orange lesions along leaf margins. Caused by Xanthomonas oryzae.",
    sinhalaDesc: "පත්‍ර කහ පැහැ වී වියළී යයි. යල සහ මහ කන්නයේදී තද වැසි සමඟ පැතිරේ.",
    bg: "bg-amber-50",
    border: "border-amber-200",
    tagColor: "text-amber-800",
  },
  {
    id: "brown_spot",
    name: "Brown Spot",
    sinhalaName: "දුඹුරු ලප රෝගය",
    severityKey: "moderate" as const,
    description: "Oval brown spots with gray centres on leaves. Linked to nutrient deficiency.",
    sinhalaDesc: "පසෙහි පොටෑසියම් වැනි පෝෂක ඌණතාවයන් පවතින විට හටගන්නා දිලීර රෝගයකි.",
    bg: "bg-amber-500/10",
    border: "border-amber-300/40",
    tagColor: "text-amber-900",
  },
  {
    id: "smut",
    name: "Leaf Smut",
    sinhalaName: "සිහින් දුඹුරු ලප රෝගය",
    severityKey: "lowRisk" as const,
    description: "Small black linear spots on both leaf surfaces. Remove infected leaves early.",
    sinhalaDesc: "ගොයම් කරල් පීදෙන අවධියේදී පත්‍ර මත කෙටි සිහින් දුඹුරු රේඛා ලෙස මතු වේ.",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    tagColor: "text-emerald-800",
  },
];

export default function Index() {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { pickImageFromGallery } = useGalleryPicker();

  const handleOpenGallery = async () => {
    const uri = await pickImageFromGallery();
    if (uri) {
      router.push({ pathname: "/result", params: { imageUri: uri } });
    }
  };

  return (
    <View className="flex-1 bg-slate-50 relative">
      <ScrollView
        className="flex-1 bg-slate-50"
      showsVerticalScrollIndicator={false}
    >
      {/* Header Banner */}
      <View className="pt-14 pb-6 px-5 bg-emerald-800 rounded-b-3xl border-b border-emerald-900/20 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-3 flex-1">
            <View className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 overflow-hidden p-1 shadow-sm">
              <Image
                source={require("@/assets/images/logo.png")}
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>
            <View className="flex-1 ml-3">
              <View className="flex-row items-center space-x-2 mb-0.5">
                <View className="w-2 h-2 rounded-full bg-emerald-300" />
                <Text className="text-emerald-200 text-xs font-bold uppercase tracking-wider">
                  {t("appName")}
                </Text>
              </View>
              <Text className="text-xl font-black text-white" numberOfLines={1}>
                {language === "si" ? "ආයුබෝවන්" : "Ayubowan"}, {user ? user.full_name.split(" ")[0] : (language === "si" ? "ගොවි මහතා" : "Farmer")}! 👋
              </Text>
              <Text className="text-emerald-100 text-[11px]">
                {t("welcomeSub")}
              </Text>
            </View>
          </View>

          {/* Language Switcher Pill */}
          <TouchableOpacity
            onPress={() => setLanguage(language === "en" ? "si" : "en")}
            className="bg-emerald-700/90 border border-emerald-500 px-3 py-1.5 rounded-xl flex-row items-center space-x-1 ml-2 active:opacity-80"
          >
            <Text className="text-white font-black text-xs">
              {language === "en" ? "🇱🇰 SI" : "🇬🇧 EN"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="px-5 mt-5 space-y-6 mb-32">
        {/* Main Hero Scan Card */}
        <View className="bg-emerald-800 p-6 rounded-3xl border border-emerald-700 shadow-md relative overflow-hidden mb-5">
          <View className="flex-row items-center justify-between mb-3">
            <View className="bg-emerald-700/90 border border-emerald-600 px-3 py-1 rounded-full flex-row items-center">
              <Sparkles size={14} color="#A7F3D0" />
              <Text className="text-emerald-100 font-bold text-xs ml-1.5">
                {t("aiPoweredDiagnosis")}
              </Text>
            </View>
          </View>

          <Text className="text-xl font-black text-white mb-2 leading-tight">
            {t("heroScanTitle")}
          </Text>
          <Text className="text-emerald-100 text-xs leading-relaxed mb-6 font-medium">
            {t("heroScanSub")}
          </Text>

          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() => router.push("/scan")}
              className="flex-1 bg-white py-3.5 px-4 rounded-2xl flex-row items-center justify-center shadow-md active:opacity-90"
            >
              <Scan size={20} color="#059669" />
              <Text className="text-emerald-800 font-black text-sm ml-2">
                {t("openCamera")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleOpenGallery}
              className="bg-emerald-700 border border-emerald-600 py-3.5 px-4 rounded-2xl flex-row items-center justify-center active:opacity-90"
            >
              <Text className="text-white font-bold text-sm">
                {t("uploadPhoto")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Navigation Shortcuts */}
        <View className="mb-5">
          <Text className="text-gray-900 font-black text-base mb-3">
            {t("quickServices")}
          </Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity
              onPress={() => router.push("/scan")}
              className="w-[48%] bg-white border border-gray-200/80 p-4 rounded-2xl mb-3 flex-row items-center space-x-3 shadow-sm active:opacity-80"
            >
              <View className="w-10 h-10 rounded-xl bg-emerald-50 items-center justify-center">
                <Scan size={20} color="#059669" />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-gray-900 font-bold text-sm">
                  {t("scan")}
                </Text>
                <Text className="text-gray-500 text-[10px]">
                  {t("aiScanSub")}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/market")}
              className="w-[48%] bg-white border border-gray-200/80 p-4 rounded-2xl mb-3 flex-row items-center space-x-3 shadow-sm active:opacity-80"
            >
              <View className="w-10 h-10 rounded-xl bg-amber-50 items-center justify-center">
                <ShoppingBag size={20} color="#D97706" />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-gray-900 font-bold text-sm">
                  {t("agroStore")}
                </Text>
                <Text className="text-gray-500 text-[10px]">
                  {t("agroStoreSub")}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/chat")}
              className="w-[48%] bg-white border border-gray-200/80 p-4 rounded-2xl flex-row items-center space-x-3 shadow-sm active:opacity-80"
            >
              <View className="w-10 h-10 rounded-xl bg-teal-50 items-center justify-center">
                <MessageCircle size={20} color="#0D9488" />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-gray-900 font-bold text-sm">
                  {t("chat")}
                </Text>
                <Text className="text-gray-500 text-[10px]">
                  {t("agronomistQA")}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/profile")}
              className="w-[48%] bg-white border border-gray-200/80 p-4 rounded-2xl flex-row items-center space-x-3 shadow-sm active:opacity-80"
            >
              <View className="w-10 h-10 rounded-xl bg-purple-50 items-center justify-center">
                <User size={20} color="#7E22CE" />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-gray-900 font-bold text-sm">
                  {t("profile")}
                </Text>
                <Text className="text-gray-500 text-[10px]">
                  {t("profileSub")}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rice Disease Identification Guide */}
        <View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-900 font-black text-base">
              {t("commonPaddyDiseases")}
            </Text>
            <TouchableOpacity onPress={() => router.push("/chat")} className="flex-row items-center">
              <Text className="text-emerald-700 text-xs font-bold mr-1">
                {t("askAI")}
              </Text>
              <ChevronRight size={14} color="#059669" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
            {COMMON_DISEASES.map((item) => (
              <View
                key={item.id}
                className="w-64 bg-white border border-gray-200/80 rounded-2xl p-4 mr-3 shadow-sm"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <ShieldAlert size={16} color="#D97706" />
                    <Text className="text-amber-700 font-extrabold text-xs ml-1.5">
                      {t(item.severityKey)}
                    </Text>
                  </View>
                </View>

                <Text className="text-gray-900 font-bold text-sm mb-1">
                  {language === "si" ? item.sinhalaName : item.name}
                </Text>
                <Text className="text-gray-600 text-xs leading-relaxed mb-3">
                  {language === "si" ? item.sinhalaDesc : item.description}
                </Text>

                <TouchableOpacity
                  onPress={() => router.push({ pathname: "/market", params: { search: item.name } })}
                  className="bg-emerald-50 border border-emerald-200 py-2 px-3 rounded-xl flex-row items-center justify-between active:opacity-80"
                >
                  <Text className="text-emerald-800 text-xs font-bold">
                    {t("findRemedies")}
                  </Text>
                  <ArrowUpRight size={14} color="#059669" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </ScrollView>
    <FloatingChatButton />
  </View>
  );
}
