/**
 * Camera Screen - หน้าจอสำหรับ Pose Detection และ Sign Language Detection
 */

import { RNMediapipe, switchCamera } from "@thinksys/react-native-mediapipe";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * 📖 CONCEPT: Landmark Data Structure
 */
interface LandmarkData {
  landmarks?: any[];
  worldLandmarks?: any[];
  [key: string]: any;
}

// MediaPipe Pose Landmark Indices
const POSE_LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
};

function detectGesture(
  data: LandmarkData,
  isFrontCamera: boolean = true,
): string {
  if (!data || !data.landmarks || !Array.isArray(data.landmarks)) {
    return "Waiting...";
  }

  const landmarks = data.landmarks;

  if (landmarks.length === 0) {
    return "⏳ No Body Detected";
  }

  const leftWrist = landmarks[POSE_LANDMARKS.LEFT_WRIST];
  const rightWrist = landmarks[POSE_LANDMARKS.RIGHT_WRIST];
  const leftShoulder = landmarks[POSE_LANDMARKS.LEFT_SHOULDER];
  const rightShoulder = landmarks[POSE_LANDMARKS.RIGHT_SHOULDER];

  if (!leftWrist || !rightWrist) {
    return "👀 Body Visible";
  }

  const shoulderY = leftShoulder?.y || rightShoulder?.y || 0.5;

  if (leftWrist.y < shoulderY && rightWrist.y < shoulderY) {
    return "🙌 Both Hands Up!";
  }

  const leftLabel = isFrontCamera ? "🤚 Right Hand Up" : "✋ Left Hand Up";
  const rightLabel = isFrontCamera ? "✋ Left Hand Up" : "🤚 Right Hand Up";

  if (leftWrist.y < shoulderY) {
    return leftLabel;
  }

  if (rightWrist.y < shoulderY) {
    return rightLabel;
  }

  return "👀 Body Visible";
}

export default function PoseScreen() {
  const [isActive, setIsActive] = useState(false);

  // Use useFocusEffect to manage camera lifecycle
  useFocusEffect(
    useCallback(() => {
      setIsActive(true);
      return () => {
        setIsActive(false);
        setDetectedGesture("Paused");
      };
    }, []),
  );

  const [landmarkData, setLandmarkData] = useState<LandmarkData | null>(null);
  const [detectedGesture, setDetectedGesture] = useState("Waiting for body...");
  const [isDetecting, setIsDetecting] = useState(false);
  const [callCount, setCallCount] = useState(0);
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  const handleLandmark = useCallback(
    (data: any) => {
      setCallCount((prev) => prev + 1);
      setLandmarkData(data);
      setIsDetecting(true);
      const gesture = detectGesture(data, isFrontCamera);
      setDetectedGesture(gesture);
    },
    [isFrontCamera],
  );

  const handleSwitchCamera = useCallback(() => {
    switchCamera();
    setIsFrontCamera((prev) => !prev);
  }, []);

  if (!isActive) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <RNMediapipe
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        onLandmark={handleLandmark}
        frameLimit={30}
        face={true}
        leftArm={true}
        rightArm={true}
        leftWrist={true}
        rightWrist={true}
        torso={true}
        leftLeg={true}
        rightLeg={true}
        leftAnkle={true}
        rightAnkle={true}
      />

      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.header}>
          <Text style={styles.headerText}>🧘 Pose Detection</Text>
        </View>

        <View
          style={{
            position: "absolute",
            top: Platform.OS === "ios" ? 100 : 80,
            left: 20,
          }}
        >
          <View style={styles.statusBadge}>
            <View
              style={[styles.statusDot, isDetecting && styles.statusDotActive]}
            />
            <Text style={styles.statusText}>
              {isDetecting ? "Active" : "Searching..."}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.switchButton}
          onPress={handleSwitchCamera}
        >
          <Text style={styles.switchButtonText}>🔄</Text>
        </TouchableOpacity>

        <View style={styles.resultPanel}>
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>DETECTED ACTION</Text>
            <Text style={styles.resultText}>{detectedGesture}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f23",
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
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
    marginRight: 8,
  },
  statusDotActive: {
    backgroundColor: "#10B981",
  },
  statusText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
  switchButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 21,
  },
  switchButtonText: {
    fontSize: 20,
  },
  resultPanel: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
  },
  resultBox: {
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  resultText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
});
