import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Factor from "@/components/Factor";
import Action from "@/components/Action";
import { HelpModal } from "@/components/HelpModal";
import { useState, useEffect } from "react";
import { predictImage } from "@/service/mlService";
import { DISEASE_DATA } from "@/constant/data";

type ResultType = {
  class_id: number;
  label: string;
  confidence?: number;
};

const Result = () => {
  const { imageUri } = useLocalSearchParams();

  const [showModal, setShowModal] = useState(true);
  const [result, setResult] = useState<ResultType | null>(null);
  const [disease, setDisease] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const imageSource =
    typeof imageUri === "string" ? imageUri : imageUri?.[0];

  useEffect(() => {
    if (!imageSource) return;

    setIsLoading(true);

    predictImage(imageSource)
      .then((res) => {
        setResult(res);
        setDisease(DISEASE_DATA[res.class_id] ?? null);
      })
      .catch((err) => {
        console.error("Prediction error:", err);
        setDisease(null);
      })
      .finally(() => setIsLoading(false));
  }, [imageSource]);

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
                {disease.factors?.map((factor: any, index: number) => {
                  const Icon = factor.icon;
                  return (
                    <Factor
                      key={index}
                      icon={<Icon size={22} color={factor.color} />}
                      label={factor.label}
                      value={factor.value}
                    />
                  );
                })}
              </View>
            </View>

            {/* Actions */}
            <View className="bg-white mx-4 mt-4 mb-28 p-5 rounded-2xl shadow-sm">
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
