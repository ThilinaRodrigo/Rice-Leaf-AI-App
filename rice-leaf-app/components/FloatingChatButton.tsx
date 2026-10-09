import React, { useRef } from "react";
import { Animated, PanResponder, View } from "react-native";
import { Bot } from "lucide-react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const FloatingChatButton = () => {
  const insets = useSafeAreaInsets();
  const bottomPosition = Math.max(insets.bottom, 12) + 80;

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scale = useRef(new Animated.Value(1)).current;
  const isDragging = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 4 || Math.abs(gestureState.dy) > 4;
      },
      onPanResponderGrant: () => {
        isDragging.current = false;
        pan.extractOffset();
        Animated.spring(scale, {
          toValue: 0.9,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > 6 || Math.abs(gestureState.dy) > 6) {
          isDragging.current = true;
        }
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        Animated.spring(scale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }).start();

        const totalMove = Math.hypot(gestureState.dx, gestureState.dy);
        if (!isDragging.current || totalMove < 6) {
          router.push("/(tabs)/chat" as any);
        }
      },
      onPanResponderTerminate: () => {
        pan.flattenOffset();
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        {
          position: "absolute",
          bottom: bottomPosition,
          right: 16,
          zIndex: 9999,
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: scale },
          ],
        },
      ]}
    >
      <View
        style={{
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: "#065f46",
          borderWidth: 2,
          borderColor: "rgba(52, 211, 153, 0.6)",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#059669",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <View style={{ position: "relative", alignItems: "center", justifyContent: "center" }}>
          <Bot size={28} color="#A7F3D0" />
          <View
            style={{
              position: "absolute",
              top: -2,
              right: -2,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: "#34D399",
              borderWidth: 1.5,
              borderColor: "#065f46",
            }}
          />
        </View>
      </View>
    </Animated.View>
  );
};

