import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  MessageCircle,
  ShoppingBag,
  User,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react-native";
import { BlurView } from "expo-blur";
import { useState } from "react";
import { useImagePicker } from "@/hooks/useImagePicker";
import { router } from "expo-router";
import { useCapturePhoto } from "@/hooks/useCaptureImage";

export default function Index() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const { pickImageFromGallery } = useImagePicker();
  const { cameraRef, capturePhoto } = useCapturePhoto({ navigateTo: "/result" });

  const handleOpenGallery = async () => {
    const uri = await pickImageFromGallery();
    if (uri) {
      router.push({ pathname: "/result", params: { imageUri: uri } });
    }
  };

  const handleNavigateChat = () => router.push("/chat");
  const handleNavigateMarket = () => router.push("/market");
  const handleNavigateProfile = () => router.push("/profile");

  if (!permission) return <View style={{ flex: 1 }} />;
  if (!permission.granted)
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 16 }}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={{ color: "blue" }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={{ flex: 1 }}>
      <CameraView style={{ flex: 1 }} facing={facing} ref={cameraRef} />

      {/* Top Floating Buttons */}
      <View style={styles.topButtons}>
        <TouchableOpacity onPress={handleNavigateChat} activeOpacity={0.8}>
          <BlurView intensity={60} tint="dark" style={styles.glassButton}>
            <MessageCircle size={24} color="#ffffff" />
          </BlurView>
        </TouchableOpacity>

        <View style={styles.topMiddleButtons}>
          <TouchableOpacity onPress={handleNavigateMarket} activeOpacity={0.8}>
            <BlurView intensity={60} tint="dark" style={styles.glassButton}>
              <ShoppingBag size={24} color="#ffffff" />
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleNavigateProfile} activeOpacity={0.8}>
            <BlurView intensity={60} tint="dark" style={styles.glassButton}>
              <User size={24} color="#ffffff" />
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Gallery */}
        <TouchableOpacity onPress={handleOpenGallery} style={styles.controlButton} activeOpacity={0.8}>
          <ImageIcon size={28} color="#ffffff" />
        </TouchableOpacity>

        {/* Shutter */}
        <TouchableOpacity onPress={capturePhoto} style={styles.shutterButton} activeOpacity={0.8}>
          <View style={styles.innerShutter} />
        </TouchableOpacity>

        {/* Flip Camera */}
        <TouchableOpacity
          onPress={() => setFacing(facing === "back" ? "front" : "back")}
          style={styles.controlButton}
          activeOpacity={0.8}
        >
          <RefreshCw size={26} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  topButtons: {
    position: "absolute",
    top: 50,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    alignItems: "center",
  },

  topMiddleButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 120,
  },

  glassButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },

  bottomControls: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },

  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "white",
    alignItems: "center",
    justifyContent: "center",
  },

  innerShutter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
  },
});
