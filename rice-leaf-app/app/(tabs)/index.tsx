import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
        <BlurView intensity={50} tint="dark" style={styles.glassButton}>
          <Ionicons name="chatbubble-outline" size={26} color="white" onPress={handleNavigateChat} />
        </BlurView>

        <View style={styles.topMiddleButtons}>
          <BlurView intensity={50} tint="dark" style={styles.glassButton}>
            <Ionicons name="bag-outline" size={26} color="white" onPress={handleNavigateMarket} />
          </BlurView>
          <BlurView intensity={50} tint="dark" style={styles.glassButton}>
            <Ionicons name="person-outline" size={26} color="white" onPress={handleNavigateProfile} />
          </BlurView>
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {/* Gallery */}
        <TouchableOpacity onPress={handleOpenGallery} style={styles.controlButton}>
          <Ionicons name="images-outline" size={32} color="white" />
        </TouchableOpacity>

        {/* Shutter */}
        <TouchableOpacity onPress={capturePhoto} style={styles.shutterButton}>
          <View style={styles.innerShutter} />
        </TouchableOpacity>

        {/* Flip Camera */}
        <TouchableOpacity
          onPress={() => setFacing(facing === "back" ? "front" : "back")}
          style={styles.controlButton}
        >
          <Ionicons name="camera-reverse-outline" size={32} color="white" />
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
