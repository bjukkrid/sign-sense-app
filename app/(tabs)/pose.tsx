/**
 * Camera Screen - หน้าจอสำหรับ Pose Detection (Placeholder)
 *
 * NOTE: Previously used @thinksys/react-native-mediapipe which has been removed.
 * TODO: Implement Pose Detection using react-native-vision-camera + MediaPipe Native Module (similar to Hand Detection)
 */
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function PoseScreen() {
  const [isActive, setIsActive] = useState(false);

  // Use useFocusEffect to manage camera lifecycle
  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      return () => {
        setIsActive(false);
      };
    }, []),
  );

  return (
    <View style={styles.container}>
      {/* Placeholder for Camera */}
      <View style={styles.cameraPlaceholder}>
        <Text style={styles.placeholderText}>🧘 Pose Detection</Text>
        <Text style={styles.subText}>Coming Soon...</Text>
        <Text style={styles.techText}>
          (Requires Native Module Implementation)
        </Text>
      </View>

      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.header}>
          <Text style={styles.headerText}>🧘 Pose Detection</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f23",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraPlaceholder: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
  },
  placeholderText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: "#AAA",
    marginBottom: 5,
  },
  techText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
  },
  header: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFF",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 4,
  },
});
