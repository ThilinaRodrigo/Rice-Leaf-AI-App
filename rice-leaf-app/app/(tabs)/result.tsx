import {View,Text,Image,ScrollView,TouchableOpacity,} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import {ArrowLeft,Droplet, Thermometer,Calendar,} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Factor from "@/components/Factor";
import Action from "@/components/Action";
import { HelpModal } from "@/components/HelpModal";
import { useState, useEffect } from "react";

const Result = () => {
  const { imageUri } = useLocalSearchParams();
  const [showModal, setShowModal] = useState(false);
  const imageSource =
    typeof imageUri === "string" ? imageUri : imageUri?.[0] ?? "";

  useEffect(() => {
    setShowModal(true);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f3f4f6' }} edges={['top']}>
      <View className="flex-1 bg-gray-100">
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
          <TouchableOpacity 
            onPress={() => router.back()}
            className="p-2 -ml-2"
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#111" />
          </TouchableOpacity>

          <View className="ml-3 flex-1">
            <Text className="text-xl font-bold text-gray-900">
              Diagnosis Result
            </Text>
            <Text className="text-sm text-gray-500">
              Analysis completed
            </Text>
          </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Image */}
          <Image
            source={{ uri: imageSource }}
            className="w-full h-60"
            resizeMode="cover"
          />

          {/* Diagnosis Card */}
          <View className="bg-white mx-4 mt-4 p-5 rounded-2xl shadow-sm">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xl font-bold text-gray-900">
                Bacterial Blight
              </Text>

              <View className="bg-green-100 px-3 py-1 rounded-full">
                <Text className="text-green-700 font-semibold text-sm">
                  92% Match
                </Text>
              </View>
            </View>

            <Text className="text-sm text-gray-500 mb-3">
              Rice leaf disease
            </Text>

            <Text className="text-base text-gray-700 leading-relaxed">
              Bacterial blight is a serious disease affecting rice plants,
              caused by Xanthomonas oryzae. Early detection and treatment
              are essential to prevent crop loss.
            </Text>
          </View>

          {/* Environmental Factors */}
          <View className="bg-white mx-4 mt-4 p-5 rounded-2xl shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Environmental Factors
            </Text>

            <View className="flex-row justify-between">
              <Factor
                icon={<Droplet color="#3B82F6" size={22} />}
                label="Humidity"
                value="78%"
              />
              <Factor
                icon={<Thermometer color="#F97316" size={22} />}
                label="Temp"
                value="28°C"
              />
              <Factor
                icon={<Calendar color="#A855F7" size={22} />}
                label="Season"
                value="Wet"
              />
            </View>
          </View>

          {/* Recommended Actions */}
          <View className="bg-white mx-4 mt-4 mb-28 p-5 rounded-2xl shadow-sm">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
              Recommended Actions
            </Text>

            <Action
              title="Apply copper-based bactericide"
              subtitle="Within 24–48 hours"
            />
            <Action
              title="Remove and destroy infected leaves"
              subtitle="Immediate action"
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default Result;