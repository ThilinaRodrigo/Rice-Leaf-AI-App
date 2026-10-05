import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { RefreshCw, Image as ImageIcon, X } from "lucide-react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useCapturePhoto } from "@/hooks/useCaptureImage";

interface CameraScreenProps {
  isTabScreen?: boolean;
}

export default function CameraScreen({ isTabScreen = false }: CameraScreenProps) {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const insets = useSafeAreaInsets();
  const { pickImageFromGallery } = useImagePicker();
  const { cameraRef, capturePhoto } = useCapturePhoto({ navigateTo: "/result" });

  const bottomOffset = isTabScreen
    ? Math.max(insets.bottom, 12) + 88
    : Math.max(insets.bottom, 20) + 20;

  const handleOpenGallery = async () => {
    const uri = await pickImageFromGallery();
    if (uri) {
      router.push({ pathname: "/result", params: { imageUri: uri } });
    }
  };

  if (!permission) return <View style={styles.center} />;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.permissionText}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView style={{ flex: 1 }} facing={facing} ref={cameraRef} />

      {/* Close Button if navigated from Stack */}
      {router.canGoBack() && !isTabScreen && (
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.closeButton, { top: Math.max(insets.top, 20) + 16 }]}
          activeOpacity={0.8}
        >
          <X size={24} color="#ffffff" />
        </TouchableOpacity>
      )}

      {/* Bottom Controls */}
      <View style={[styles.bottomControls, { bottom: bottomOffset }]}>
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
          onPress={() => setFacing((prev) => (prev === "back" ? "front" : "back"))}
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0F172A",
    padding: 20,
  },
  permissionText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  permissionButton: {
    backgroundColor: "#059669",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
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
