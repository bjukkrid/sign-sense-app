module.exports = {
  expo: {
    name: "sign-lang-app",
    slug: "sign-lang-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "signlangapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.signlang.app",
      infoPlist: {
        NSCameraUsageDescription:
          "This app needs camera access to detect sign language gestures in real-time",
        NSMicrophoneUsageDescription:
          "This app needs microphone access for audio features",
      },
    },
    android: {
      package: "com.signlang.app",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      permissions: ["android.permission.CAMERA"],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "react-native-vision-camera",
        {
          cameraPermissionText:
            "This app needs camera access to detect sign language gestures in real-time",
        },
      ],
      // Custom plugins to fix Android build issues
      "./plugins/withAndroidKotlinVersion",
      "./plugins/withExpoModulesCorePluginFix",
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
