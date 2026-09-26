import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";

const { width, height } = Dimensions.get("window");

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  // Animation values
  const bgScale = useRef(new Animated.Value(1.15)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(40)).current;
  const ringScale1 = useRef(new Animated.Value(0)).current;
  const ringOpacity1 = useRef(new Animated.Value(0.7)).current;
  const ringScale2 = useRef(new Animated.Value(0)).current;
  const ringOpacity2 = useRef(new Animated.Value(0.5)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const dotsOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    StatusBar.setBarStyle("light-content");

    // Pulse dot animation loop
    const pulseDots = () => {
      Animated.sequence([
        Animated.timing(dot1, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dot1, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 0.3, duration: 300, useNativeDriver: true }),
      ]).start(() => pulseDots());
    };

    Animated.sequence([
      // 1. BG zoom in
      Animated.timing(bgScale, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),

      // 2. Logo pop in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),

      // 3. Ring pulse around logo
      Animated.parallel([
        Animated.timing(ringScale1, {
          toValue: 1.8,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity1, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(ringScale2, {
          toValue: 2.4,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity2, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),

      // 4. Title slide up
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),

      // 5. Tagline + dots
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(dotsOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      pulseDots();

      // Wait then fade out
      setTimeout(() => {
        Animated.timing(screenOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          StatusBar.setBarStyle("dark-content");
          onFinish();
        });
      }, 1200);
    });
  }, []);

  return (
    <Animated.View style={[styles.root, { opacity: screenOpacity }]}>
      {/* Background */}
      <Animated.View style={[styles.bg, { transform: [{ scale: bgScale }] }]}>
        {/* Decorative circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
        <View style={styles.circle4} />
      </Animated.View>

      {/* Content */}
      <View style={styles.content}>
        {/* Pulse rings behind logo */}
        <View style={styles.logoWrapper}>
          <Animated.View
            style={[
              styles.ring,
              {
                transform: [{ scale: ringScale1 }],
                opacity: ringOpacity1,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.ring,
              styles.ring2,
              {
                transform: [{ scale: ringScale2 }],
                opacity: ringOpacity2,
              },
            ]}
          />

          {/* Logo */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: logoScale },
                  { translateY: logoTranslateY },
                ],
              },
            ]}
          >
            <Image
              source={require("../assets/images/icon.png")}
              style={styles.logo}
              resizeMode="cover"
            />
          </Animated.View>
        </View>

        {/* App Name */}
        <Animated.Text
          style={[
            styles.appName,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleTranslateY }],
            },
          ]}
        >
          RiceLeaf<Text style={styles.appNameAccent}> AI</Text>
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          Smart Disease Detection for Farmers
        </Animated.Text>

        {/* Feature pills */}
        <Animated.View style={[styles.pillsRow, { opacity: taglineOpacity }]}>
          {["🔬 AI Scan", "🌾 Community", "🛒 Market"].map((pill) => (
            <View key={pill} style={styles.pill}>
              <Text style={styles.pillText}>{pill}</Text>
            </View>
          ))}
        </Animated.View>

        {/* Loading dots */}
        <Animated.View style={[styles.dotsRow, { opacity: dotsOpacity }]}>
          <Animated.View style={[styles.dot, { opacity: dot1 }]} />
          <Animated.View style={[styles.dot, { opacity: dot2 }]} />
          <Animated.View style={[styles.dot, { opacity: dot3 }]} />
        </Animated.View>
      </View>

      {/* Bottom brand */}
      <Animated.View style={[styles.footer, { opacity: taglineOpacity }]}>
        <View style={styles.footerDivider} />
        <Text style={styles.footerText}>Powered by TensorFlow · Go Backend</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#042f1e",
    zIndex: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  bg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "#042f1e",
    overflow: "hidden",
  },
  // Decorative blobs
  circle1: {
    position: "absolute",
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: "#064e3b",
    top: -80,
    right: -80,
    opacity: 0.6,
  },
  circle2: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#065f46",
    bottom: 60,
    left: -60,
    opacity: 0.5,
  },
  circle3: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#047857",
    top: height * 0.35,
    right: -30,
    opacity: 0.3,
  },
  circle4: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#10b981",
    bottom: height * 0.25,
    right: 40,
    opacity: 0.15,
  },
  // Main content
  content: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  // Logo
  logoWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    width: 160,
    height: 160,
  },
  ring: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: "#6ee7b7",
  },
  ring2: {
    borderColor: "#34d399",
    borderWidth: 1.5,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "rgba(110,231,183,0.4)",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  // Text
  appName: {
    fontSize: 38,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  appNameAccent: {
    color: "#6ee7b7",
    fontWeight: "900",
  },
  tagline: {
    fontSize: 14,
    color: "#a7f3d0",
    fontWeight: "500",
    letterSpacing: 0.3,
    marginBottom: 24,
    textAlign: "center",
  },
  // Feature pills
  pillsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 40,
  },
  pill: {
    backgroundColor: "rgba(16,185,129,0.15)",
    borderWidth: 1,
    borderColor: "rgba(110,231,183,0.3)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillText: {
    color: "#6ee7b7",
    fontSize: 12,
    fontWeight: "700",
  },
  // Loading dots
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#34d399",
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 48,
    alignItems: "center",
    gap: 10,
  },
  footerDivider: {
    width: 40,
    height: 1,
    backgroundColor: "rgba(110,231,183,0.3)",
    marginBottom: 4,
  },
  footerText: {
    color: "rgba(167,243,208,0.6)",
    fontSize: 11,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
});
