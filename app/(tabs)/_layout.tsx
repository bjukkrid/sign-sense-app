import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import React from "react";
import { Platform, Pressable } from "react-native";

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#4ECDC4", // Mint Green like Hand Tab
        tabBarInactiveTintColor: "#6B7280", // Gray
        tabBarStyle: {
          backgroundColor: "#0f0f23", // Dark Theme Background
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.1)",
          height: Platform.OS === "ios" ? 85 : 60,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "600",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false, // Let Dashboard handle its own header
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    color={Colors[colorScheme ?? "light"].text}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="hand"
        options={{
          title: "Hand",
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="hand-paper-o" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pose"
        options={{
          title: "Pose",
          tabBarIcon: ({ color }) => <TabBarIcon name="child" color={color} />,
        }}
      />
    </Tabs>
  );
}
