import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  PanResponder,
  LayoutChangeEvent,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import {
  RefreshCw,
  Image as ImageIcon,
  X,
  Check,
  RotateCcw,
} from "lucide-react-native";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useCapturePhoto } from "@/hooks/useCaptureImage";
import { getImageDimensions, cropImageToDisplayBox } from "@/utils/cropUtils";

interface CameraScreenProps {
  isTabScreen?: boolean;
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

export default function CameraScreen({ isTabScreen = false }: CameraScreenProps) {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingText, setProcessingText] = useState("Capturing Image...");

  // Preview state
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [useWholePhoto, setUseWholePhoto] = useState(false);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const [container, setContainer] = useState({ w: 0, h: 0 });
  const [box, setBox] = useState({ x: 0, y: 0, size: 0 });

  const insets = useSafeAreaInsets();
  const { pickImageFromGallery } = useImagePicker();
  const { cameraRef, capturePhoto } = useCapturePhoto();

  // Where the photo is actually drawn (resizeMode="contain") inside the container
  const display = useMemo(() => {
    if (!imgSize || container.w === 0 || container.h === 0) {
      return { scale: 1, dw: 0, dh: 0, ox: 0, oy: 0 };
    }
    const scale = Math.min(container.w / imgSize.w, container.h / imgSize.h);
    const dw = imgSize.w * scale;
    const dh = imgSize.h * scale;
    return { scale, dw, dh, ox: (container.w - dw) / 2, oy: (container.h - dh) / 2 };
  }, [imgSize, container]);

  // Refs so PanResponders always read current values during gestures
  const boxRef = useRef(box);
  boxRef.current = box;
  const displayRef = useRef(display);
  displayRef.current = display;
  const dragStart = useRef({ x: 0, y: 0, size: 0 });

  // Move Box PanResponder (dragging inside box moves box position)
  const movePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStart.current = { x: boxRef.current.x, y: boxRef.current.y, size: boxRef.current.size };
      },
      onPanResponderMove: (_, g) => {
        const d = displayRef.current;
        const size = boxRef.current.size;
        setBox((prev) => ({
          ...prev,
          x: clamp(dragStart.current.x + g.dx, d.ox, d.ox + d.dw - size),
          y: clamp(dragStart.current.y + g.dy, d.oy, d.oy + d.dh - size),
        }));
      },
    })
  ).current;

  // Bottom-Right Corner Resize PanResponder
  const bottomRightPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStart.current = { x: boxRef.current.x, y: boxRef.current.y, size: boxRef.current.size };
      },
      onPanResponderMove: (_, g) => {
        const d = displayRef.current;
        const start = dragStart.current;
        const maxS = Math.min(d.ox + d.dw - start.x, d.oy + d.dh - start.y);
        const minS = Math.min(d.dw, d.dh) * 0.15;
        const delta = (g.dx + g.dy) / 2;
        const newSize = clamp(start.size + delta, minS, maxS);
        setBox((prev) => ({ ...prev, size: newSize }));
      },
    })
  ).current;

  // Bottom-Left Corner Resize PanResponder
  const bottomLeftPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStart.current = { x: boxRef.current.x, y: boxRef.current.y, size: boxRef.current.size };
      },
      onPanResponderMove: (_, g) => {
        const d = displayRef.current;
        const start = dragStart.current;
        const minS = Math.min(d.dw, d.dh) * 0.15;
        const delta = (-g.dx + g.dy) / 2;
        let newSize = start.size + delta;
        let newX = start.x - (newSize - start.size);

        if (newX < d.ox) {
          newX = d.ox;
          newSize = start.x + start.size - d.ox;
        }
        if (start.y + newSize > d.oy + d.dh) {
          newSize = d.oy + d.dh - start.y;
          newX = start.x + start.size - newSize;
        }
        newSize = clamp(newSize, minS, Math.min(d.dw, d.dh));
        newX = start.x + start.size - newSize;

        setBox((prev) => ({ ...prev, x: newX, size: newSize }));
      },
    })
  ).current;

  // Top-Right Corner Resize PanResponder
  const topRightPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStart.current = { x: boxRef.current.x, y: boxRef.current.y, size: boxRef.current.size };
      },
      onPanResponderMove: (_, g) => {
        const d = displayRef.current;
        const start = dragStart.current;
        const minS = Math.min(d.dw, d.dh) * 0.15;
        const delta = (g.dx - g.dy) / 2;
        let newSize = start.size + delta;
        let newY = start.y - (newSize - start.size);

        if (newY < d.oy) {
          newY = d.oy;
          newSize = start.y + start.size - d.oy;
        }
        if (start.x + newSize > d.ox + d.dw) {
          newSize = d.ox + d.dw - start.x;
          newY = start.y + start.size - newSize;
        }
        newSize = clamp(newSize, minS, Math.min(d.dw, d.dh));
        newY = start.y + start.size - newSize;

        setBox((prev) => ({ ...prev, y: newY, size: newSize }));
      },
    })
  ).current;

  // Top-Left Corner Resize PanResponder
  const topLeftPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStart.current = { x: boxRef.current.x, y: boxRef.current.y, size: boxRef.current.size };
      },
      onPanResponderMove: (_, g) => {
        const d = displayRef.current;
        const start = dragStart.current;
        const minS = Math.min(d.dw, d.dh) * 0.15;
        const delta = (-g.dx - g.dy) / 2;
        let newSize = start.size + delta;
        let newX = start.x - (newSize - start.size);
        let newY = start.y - (newSize - start.size);

        if (newX < d.ox) {
          newX = d.ox;
          newSize = start.x + start.size - d.ox;
          newY = start.y + start.size - newSize;
        }
        if (newY < d.oy) {
          newY = d.oy;
          newSize = start.y + start.size - d.oy;
          newX = start.x + start.size - newSize;
        }
        newSize = clamp(newSize, minS, Math.min(d.dw, d.dh));
        newX = start.x + start.size - newSize;
        newY = start.y + start.size - newSize;

        setBox((prev) => ({ ...prev, x: newX, y: newY, size: newSize }));
      },
    })
  ).current;

  // Place default box in middle of photo
  useEffect(() => {
    if (display.dw > 0 && display.dh > 0) {
      const size = Math.min(display.dw, display.dh) * 0.7;
      setBox({
        size,
        x: display.ox + (display.dw - size) / 2,
        y: display.oy + (display.dh - size) / 2,
      });
    }
  }, [display.dw, display.dh, display.ox, display.oy]);

  const resetPreview = () => {
    setCapturedUri(null);
    setUseWholePhoto(false);
    setImgSize(null);
    setBox({ x: 0, y: 0, size: 0 });
  };

  useFocusEffect(
    useCallback(() => {
      setIsProcessing(false);
      resetPreview();
    }, [])
  );

  const bottomOffset = isTabScreen
    ? Math.max(insets.bottom, 12) + 88
    : Math.max(insets.bottom, 20) + 20;

  const showPreview = async (uri: string) => {
    try {
      const { width, height } = await getImageDimensions(uri);
      setImgSize({ w: width, h: height });
    } catch (err) {
      console.warn("Image size error:", err);
    }
    setUseWholePhoto(false);
    setCapturedUri(uri);
  };

  const handleOpenGallery = async () => {
    try {
      setProcessingText("Opening gallery...");
      setIsProcessing(true);
      const uri = await pickImageFromGallery();
      if (uri) await showPreview(uri);
    } catch (err) {
      console.warn("Gallery pick error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCapturePhoto = async () => {
    try {
      setProcessingText("Taking photo...");
      setIsProcessing(true);
      const uri = await capturePhoto();
      if (uri) await showPreview(uri);
    } catch (err) {
      console.warn("Capture photo error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmImage = async () => {
    if (!capturedUri) return;
    try {
      setIsProcessing(true);
      let finalUri = capturedUri;
      if (!useWholePhoto && imgSize) {
        setProcessingText("Preparing photo...");
        finalUri = await cropImageToDisplayBox(
          capturedUri,
          { x: box.x - display.ox, y: box.y - display.oy, size: box.size },
          display.scale
        );
      }
      router.push({ pathname: "/result", params: { imageUri: finalUri } });
    } catch (err) {
      console.warn("Confirm image error:", err);
      router.push({ pathname: "/result", params: { imageUri: capturedUri } });
    } finally {
      setIsProcessing(false);
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

  // ---------------------------------------------------------------------------
  // Preview Screen: Drag box to move • Drag corners to resize
  // ---------------------------------------------------------------------------
  if (capturedUri) {
    const boxReady = !useWholePhoto && box.size > 0;

    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {/* Photo Container */}
        <View
          style={StyleSheet.absoluteFill}
          onLayout={(e: LayoutChangeEvent) =>
            setContainer({
              w: e.nativeEvent.layout.width,
              h: e.nativeEvent.layout.height,
            })
          }
        >
          <Image
            source={{ uri: capturedUri }}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
          />

          {boxReady && (
            <>
              {/* Dim regions outside box */}
              <View pointerEvents="none" style={[styles.dim, { top: 0, left: 0, right: 0, height: box.y }]} />
              <View pointerEvents="none" style={[styles.dim, { top: box.y + box.size, left: 0, right: 0, bottom: 0 }]} />
              <View pointerEvents="none" style={[styles.dim, { top: box.y, left: 0, width: box.x, height: box.size }]} />
              <View pointerEvents="none" style={[styles.dim, { top: box.y, left: box.x + box.size, right: 0, height: box.size }]} />

              {/* Movable Box Body */}
              <View
                {...movePanResponder.panHandlers}
                style={[styles.box, { top: box.y, left: box.x, width: box.size, height: box.size }]}
              />

              {/* Corner Resize Handles */}
              <View
                {...topLeftPanResponder.panHandlers}
                style={[styles.cornerTouchTarget, { top: box.y - 20, left: box.x - 20 }]}
              >
                <View style={[styles.cornerBracket, styles.topLeftBracket]} />
              </View>

              <View
                {...topRightPanResponder.panHandlers}
                style={[styles.cornerTouchTarget, { top: box.y - 20, left: box.x + box.size - 24 }]}
              >
                <View style={[styles.cornerBracket, styles.topRightBracket]} />
              </View>

              <View
                {...bottomLeftPanResponder.panHandlers}
                style={[styles.cornerTouchTarget, { top: box.y + box.size - 24, left: box.x - 20 }]}
              >
                <View style={[styles.cornerBracket, styles.bottomLeftBracket]} />
              </View>

              <View
                {...bottomRightPanResponder.panHandlers}
                style={[styles.cornerTouchTarget, { top: box.y + box.size - 24, left: box.x + box.size - 24 }]}
              >
                <View style={[styles.cornerBracket, styles.bottomRightBracket]} />
              </View>
            </>
          )}
        </View>

        {/* Top Header: Instruction & Close */}
        <View style={[styles.topBar, { top: Math.max(insets.top, 20) + 12 }]} pointerEvents="box-none">
          <View style={styles.instructionPill}>
            <Text style={styles.instructionText}>
              {useWholePhoto
                ? "Whole photo will be checked"
                : "Drag box to move • Drag corners to resize"}
            </Text>
          </View>
          <TouchableOpacity onPress={resetPreview} style={styles.closeButtonSmall} activeOpacity={0.8}>
            <X size={22} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Processing overlay */}
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <View style={styles.processingCard}>
              <ActivityIndicator size="large" color="#10B981" />
              <Text style={styles.processingTitle}>{processingText}</Text>
            </View>
          </View>
        )}

        {/* Bottom Panel */}
        {!isProcessing && (
          <View style={[styles.previewPanel, { bottom: bottomOffset }]}>
            {/* Whole photo toggle link */}
            <TouchableOpacity
              onPress={() => setUseWholePhoto((v) => !v)}
              style={styles.wholePhotoLink}
              activeOpacity={0.8}
            >
              <Text style={styles.wholePhotoText}>
                {useWholePhoto ? "Select a part instead" : "Use the whole photo"}
              </Text>
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={resetPreview} style={styles.retakeButton} activeOpacity={0.8}>
                <RotateCcw size={22} color="#ffffff" />
                <Text style={styles.retakeText}>Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleConfirmImage} style={styles.confirmButton} activeOpacity={0.8}>
                <Check size={26} color="#ffffff" />
                <Text style={styles.confirmText}>Check Leaf</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // Live Camera View
  // ---------------------------------------------------------------------------
  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView style={{ flex: 1 }} facing={facing} ref={cameraRef} />

      <View pointerEvents="none" style={styles.liveHintWrap}>
        <Text style={styles.cropHint}>Point the camera at the sick leaf</Text>
      </View>

      {/* Processing Loader Overlay */}
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color="#10B981" />
            <Text style={styles.processingTitle}>{processingText}</Text>
          </View>
        </View>
      )}

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
      {!isProcessing && (
        <View style={[styles.bottomControls, { bottom: bottomOffset }]}>
          <TouchableOpacity onPress={handleOpenGallery} style={styles.controlButton} activeOpacity={0.8}>
            <ImageIcon size={28} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleCapturePhoto} style={styles.shutterButton} activeOpacity={0.8}>
            <View style={styles.innerShutter} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFacing((prev) => (prev === "back" ? "front" : "back"))}
            style={styles.controlButton}
            activeOpacity={0.8}
          >
            <RefreshCw size={26} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}
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
  closeButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
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
  processingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    paddingHorizontal: 24,
  },
  processingCard: {
    backgroundColor: "rgba(30, 41, 59, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  processingTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 16,
  },
  liveHintWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  cropHint: {
    color: "#FFFFFF",
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: "600",
    overflow: "hidden",
  },

  // ---- Preview (crop) screen ----
  dim: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  box: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "rgba(16, 185, 129, 0.7)",
    backgroundColor: "rgba(16, 185, 129, 0.05)",
  },
  cornerTouchTarget: {
    position: "absolute",
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 30,
  },
  cornerBracket: {
    width: 22,
    height: 22,
    borderColor: "#10B981",
  },
  topLeftBracket: {
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRightBracket: {
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeftBracket: {
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRightBracket: {
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  topBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  instructionPill: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
  },
  instructionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  previewPanel: {
    position: "absolute",
    left: 16,
    right: 16,
    gap: 12,
  },
  wholePhotoLink: {
    alignSelf: "center",
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    borderRadius: 16,
  },
  wholePhotoText: {
    color: "#A7F3D0",
    fontSize: 14,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "stretch",
  },
  retakeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 28,
    gap: 8,
  },
  retakeText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 28,
    gap: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  confirmText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 18,
  },
});
