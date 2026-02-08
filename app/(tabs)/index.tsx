import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();

  const features = [
    {
      id: "hand",
      title: "Hand Detection",
      subtitle: "Practice fingerspelling (A-Z)",
      icon: "hand-paper-o",
      colors: ["#4ECDC4", "#556270"],
      route: "/hand",
    },
    {
      id: "pose",
      title: "Body Gestures",
      subtitle: "Full body sign language",
      icon: "child",
      colors: ["#FF6B6B", "#C44D58"],
      route: "/pose",
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>Learner! 👋</Text>
        </View>
        <TouchableOpacity style={styles.profileBtn}>
          <FontAwesome name="user-circle" size={40} color="#E5E7EB" />
        </TouchableOpacity>
      </View>

      {/* Hero / Daily Goal Card */}
      <View style={styles.heroCard}>
        <LinearGradient
          colors={["#6C63FF", "#3F3D56"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBg}
        >
          <View style={styles.heroContent}>
            <View>
              <Text style={styles.heroTitle}>Daily Goal</Text>
              <Text style={styles.heroSubtitle}>Learn 5 new signs today</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: "60%" }]} />
              </View>
              <Text style={styles.progressText}>3 / 5 completed</Text>
            </View>
            <FontAwesome
              name="trophy"
              size={50}
              color="#FFD700"
              style={{ opacity: 0.8 }}
            />
          </View>
        </LinearGradient>
      </View>

      {/* Quick Access Section */}
      <Text style={styles.sectionTitle}>Start Practicing</Text>
      <View style={styles.grid}>
        {features.map((feature) => (
          <TouchableOpacity
            key={feature.id}
            style={styles.card}
            onPress={() => router.push(feature.route as any)}
          >
            <LinearGradient
              colors={feature.colors as any}
              style={styles.cardGradient}
            >
              <FontAwesome name={feature.icon as any} size={32} color="#FFF" />
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{feature.title}</Text>
                <Text style={styles.cardSubtitle}>{feature.subtitle}</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Activity / Vocabulary */}
      <Text style={styles.sectionTitle}>Recent Vocabulary</Text>
      <View style={styles.vocabList}>
        {[
          { word: "Hello", sign: "👋", status: "Mastered" },
          { word: "Thank You", sign: "🙏", status: "Review" },
          { word: "Love", sign: "🤟", status: "Mastered" },
        ].map((item, index) => (
          <View key={index} style={styles.vocabItem}>
            <View style={styles.vocabLeft}>
              <View style={styles.vocabIcon}>
                <Text style={{ fontSize: 20 }}>{item.sign}</Text>
              </View>
              <Text style={styles.vocabWord}>{item.word}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                item.status === "Mastered"
                  ? styles.statusMastered
                  : styles.statusReview,
              ]}
            >
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Spacer for bottom tab bar */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f23", // Matching Dark Theme
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  greeting: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  username: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  profileBtn: {
    padding: 4,
  },
  heroCard: {
    height: 160,
    borderRadius: 24,
    marginBottom: 30,
    overflow: "hidden",
    // Shadow
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  gradientBg: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  heroSubtitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 4,
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    marginBottom: 8,
    width: 150,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFD700",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  card: {
    width: (SCREEN_WIDTH - 50) / 2,
    height: 140,
    borderRadius: 20,
    overflow: "hidden",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  cardText: {
    marginTop: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  cardSubtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  vocabList: {
    gap: 12,
  },
  vocabItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  vocabLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  vocabIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  vocabWord: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusMastered: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
  },
  statusReview: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#E5E7EB", // Getting lighter for contrast
  },
});
