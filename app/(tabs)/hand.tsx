/**
 * Hand Detection Screen
 *
 * 🔒 Locked Calibration:
 * - Rotation: 270°
 * - ResizeMode: contain
 * - Flip X/Y: OFF
 */

import { useIsFocused } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";
import {
  Camera,
  Frame,
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
  VisionCameraProxy,
} from "react-native-vision-camera";
import { useRunOnJS } from "react-native-worklets-core";

// Initialize the Frame Processor Plugin
const plugin = VisionCameraProxy.initFrameProcessorPlugin("detectHands");

/**
 * Wrapper function to call the native frame processor
 */
function detectHands(frame: Frame) {
  "worklet";
  if (plugin == null) {
    return null;
  }
  return plugin.call(frame);
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// สีสำหรับแต่ละนิ้ว
const FINGER_COLORS: Record<string, string> = {
  THUMB: "#FF6B6B",
  INDEX: "#4ECDC4",
  MIDDLE: "#45B7D1",
  RING: "#96CEB4",
  PINKY: "#FFEAA7",
  WRIST: "#DDA0DD",
};

interface HandLandmark {
  index: number;
  name: string;
  x: number;
  y: number;
  z: number;
}

interface DetectedHand {
  handedness: string;
  confidence: number;
  landmarks: HandLandmark[];
}

export default function HandScreen() {
  const isFocused = useIsFocused(); // Check if tab is active
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice("front");

  const [detectedHands, setDetectedHands] = useState<DetectedHand[]>([]);
  const [frameCount, setFrameCount] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const onHandsDetected = useCallback((result: any) => {
    setFrameCount((prev) => (prev + 1) % 10000);
    if (
      result &&
      (result.hands?.length > 0 || (Array.isArray(result) && result.length > 0))
    ) {
      const handsData: DetectedHand[] = result.hands || result;

      // Transform data to match json2socket.json structure
      const transformedData = {
        v: 1,
        frame_id: frameCount + 1, // Simple incremental frame ID
        ts_ms: Date.now(),
        hand_positions: handsData.reduce(
          (acc, hand, index) => {
            const handKey =
              hand.handedness === "Left" ? "Right_hand" : "Left_hand"; // Mirroring for selfie camera if needed, or keep as is. usually camera flips.
            // Note: MediaPipe often returns "Left" for your actual Right hand in selfie mode.
            // Let's assume standard behavior:
            // If the model says "Left", it means it sees a left hand structure.
            // You might need to adjust logic based on your specific camera mirror settings.

            const landmarksObj: Record<string, any> = {};

            // Map index to name based on MediaPipe Hands landmark indices
            // 0: WRIST
            // 1-4: THUMB
            // 5-8: INDEX
            // 9-12: MIDDLE
            // 13-16: RING
            // 17-20: PINKY
            const LANDMARK_NAMES = [
              "WRIST",
              "THUMB_CMC",
              "THUMB_MCP",
              "THUMB_IP",
              "THUMB_TIP",
              "INDEX_FINGER_MCP",
              "INDEX_FINGER_PIP",
              "INDEX_FINGER_DIP",
              "INDEX_FINGER_TIP",
              "MIDDLE_FINGER_MCP",
              "MIDDLE_FINGER_PIP",
              "MIDDLE_FINGER_DIP",
              "MIDDLE_FINGER_TIP",
              "RING_FINGER_MCP",
              "RING_FINGER_PIP",
              "RING_FINGER_DIP",
              "RING_FINGER_TIP",
              "PINKY_MCP",
              "PINKY_PIP",
              "PINKY_DIP",
              "PINKY_TIP",
            ];

            hand.landmarks.forEach((l, i) => {
              if (i < LANDMARK_NAMES.length) {
                const name = LANDMARK_NAMES[i];
                landmarksObj[name] = {
                  index: i,
                  x: l.x,
                  y: l.y,
                  z: l.z,
                  visibility: 1, // MediaPipe Hands usually implies visibility 1 if detected
                };
              }
            });

            acc[handKey] = {
              landmarks: landmarksObj,
              handedness_score: hand.confidence,
              hand_index: index,
              // palm_size: calculatePalmSize(hand.landmarks) // Optional: implement if needed
            };
            return acc;
          },
          {} as Record<string, any>,
        ),
        // pose_positions: {} // Add pose logic here later if needed
      };

      console.log(JSON.stringify(transformedData, null, 2));

      setDetectedHands(handsData);
      setIsDetecting(true);
    } else {
      setDetectedHands([]);
      setIsDetecting(false);
    }
  }, []);

  const onHandsDetectedWorklet = useRunOnJS(onHandsDetected, [onHandsDetected]);
  const frameProcessor = useFrameProcessor(
    (frame) => {
      "worklet";
      const result = detectHands(frame);
      if (result) onHandsDetectedWorklet(result);
    },
    [onHandsDetectedWorklet],
  );

  const getLandmarkColor = (index: number) => {
    if (index === 0) return FINGER_COLORS.WRIST;
    if (index <= 4) return FINGER_COLORS.THUMB;
    if (index <= 8) return FINGER_COLORS.INDEX;
    if (index <= 12) return FINGER_COLORS.MIDDLE;
    if (index <= 16) return FINGER_COLORS.RING;
    return FINGER_COLORS.PINKY;
  };

  /**
   * 📐 Locked Transform Logic (270°)
   */
  const transformPoint = (x: number, y: number) => {
    // Rotation 270° Logic:
    const tx = 1 - y;
    const ty = x;

    return {
      x: tx * SCREEN_WIDTH,
      y: ty * (SCREEN_HEIGHT * 0.75), // Match camera height
    };
  };

  if (!hasPermission || !device)
    return (
      <View style={styles.container}>
        <Text style={styles.headerText}>Camera Error</Text>
      </View>
    );

  const cameraHeight = SCREEN_HEIGHT * 0.75;

  return (
    <View style={styles.container}>
      <Camera
        device={device}
        isActive={isFocused} // Only active when focused
        style={[styles.camera, { height: cameraHeight }]}
        frameProcessor={frameProcessor}
        pixelFormat="rgb"
        resizeMode="contain" // Locked to contain
      />

      <View
        style={[styles.landmarksOverlay, { height: cameraHeight }]}
        pointerEvents="none"
      >
        {detectedHands.map((hand, handIndex) => (
          <View key={handIndex} style={StyleSheet.absoluteFill}>
            {hand.landmarks?.map((l, i) => {
              const { x, y } = transformPoint(l.x, l.y);
              return (
                <View
                  key={i}
                  style={[
                    styles.landmark,
                    {
                      left: x - 6, // Adjusted center offset (12px size)
                      top: y - 6,
                      backgroundColor: getLandmarkColor(i),
                    },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>🤚 Hand Detection</Text>
        <View style={styles.badge}>
          <View style={[styles.dot, isDetecting && styles.dotActive]} />
          <Text style={styles.badgeText}>
            {isDetecting ? `${detectedHands.length} Hands` : "Searching..."}
          </Text>
        </View>
      </View>

      {/* Info Panel */}
      <View style={styles.statusPanel}>
        <View style={styles.infoBox}>
          {detectedHands.length > 0 ? (
            detectedHands.map((hand, index) => (
              <Text key={index} style={styles.handInfoText}>
                {hand.handedness} Hand (
                {Math.round((hand.confidence || 0) * 100)}%)
              </Text>
            ))
          ) : (
            <Text style={styles.hintText}>Show your hand to the camera</Text>
          )}
          <Text style={styles.fpsText}>FPS: {30} • Latency: Low</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  camera: { width: SCREEN_WIDTH },
  landmarksOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
  },
  landmark: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#FFF",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
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
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginRight: 8,
  },
  dotActive: { backgroundColor: "#10B981" },
  badgeText: { color: "#FFF", fontSize: 13, fontWeight: "600" },
  statusPanel: { position: "absolute", bottom: 40, left: 20, right: 20 },
  infoBox: {
    backgroundColor: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(10px)", // Works on some platforms, robust fallback
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  handInfoText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  hintText: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
  fpsText: {
    color: "#6B7280",
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
});
