import { Modal, View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type HelpModalProps = {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
};

export function HelpModal({
  visible,
  onClose,
  onContinue,
}: HelpModalProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="w-11/12 md:w-4/5 bg-white rounded-xl p-5 items-center">
          <View className="bg-green-100 p-3 rounded-full mb-3">
            <Ionicons name="chatbubble-outline" size={22} color="#2f6f3e" />
          </View>

          <Text className="text-lg font-semibold text-green-800 mb-1">
            Need more help?
          </Text>
          <Text className="text-sm text-gray-700 mb-2 text-center">
            Chat with our AI assistant
          </Text>

          <Text className="text-xs text-gray-500 text-center mb-5">
            Get personalized treatment advice, ask questions, and learn more
            about managing this disease.
          </Text>

          <View className="flex-row justify-between w-full">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-gray-200 py-2 rounded-lg mr-2 items-center"
            >
              <Text className="text-green-800 font-semibold">Maybe Later</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onContinue}
              className="flex-1 bg-green-800 py-2 rounded-lg ml-2 items-center"
            >
              <Text className="text-white font-semibold">Continue to Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
