# SignSense App 🤟

**SignSense App** is an AI-powered mobile application designed to detect and interpret Sign Language gestures in real-time. Built with **React Native** and **Expo**, it leverages the power of **Google MediaPipe** and **VisionCamera** for high-performance, on-device gesture recognition.

![Project Banner](https://via.placeholder.com/1200x400?text=SignSense+App+Preview)

## ✨ Key Features

- **Real-time Hand Detection:** Detects 21 hand landmarks with high precision and low latency using MediaPipe Hand Landmarker.
- **Full Body Pose Estimation:** Analyzes body posture and movements using MediaPipe Pose Landmarker.
- **Interactive Calibration:** Adjustable rotation and landmark alignment for different device orientations.
- **Native Performance:** Custom iOS (Swift/Obj-C) and Android (Kotlin) Frame Processors for optimal speed (30-60 FPS).
- **Offline Capable:** All processing happens on-device; no internet connection required for detection.

## 🛠 Tech Stack

- **Framework:** React Native 0.77 + Expo 52
- **Language:** TypeScript, Swift, Kotlin (2.0.21)
- **Camera:** `react-native-vision-camera` v4
- **AI Engine:** Google MediaPipe Tasks Vision
- **Navigation:** Expo Router
- **State Management:** React Context / Hooks

## 🚀 Getting Started

This project contains custom native code in the `/android` and `/ios` directories. **These directories are committed to Git.**

### Prerequisites

- **Node.js** (LTS recommended)
- **Yarn** or **npm**
- **iOS Development:**
  - Mac with macOS
  - Xcode 15+
  - CocoaPods (`sudo gem install cocoapods`)
- **Android Development:**
  - Android Studio
  - Java Development Kit (JDK) 17
  - Android SDK Platform-Tools

### 📥 Installation (Fresh Start)

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/sign-sense-app.git
    cd sign-sense-app
    ```

2.  **Install JavaScript dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Setup Native Dependencies:**
    - **iOS:**
      ```bash
      cd ios
      pod install
      cd ..
      ```

## 📱 Building & Running

Since this project uses custom native code, you **must** use the development build command. You cannot use Expo Go.

### iOS

Run on a simplified simulator or physical device:

```bash
npx expo run:ios
```

**To run on a physical device:**

```bash
npx expo run:ios --device
```

### Android

Run on an emulator or connected device:

```bash
npx expo run:android
```

## 🔧 Troubleshooting & Clean Build

If you encounter build errors, follow these steps to perform a clean build. This solves 90% of issues.

### 🍎 iOS Issues

**Problem:** "Native module not found", "Duplicate symbols", or "Pod install failed".

**Solution:**

```bash
# 1. Clear Watchman and Metro cache
watchman watch-del-all
rm -rf node_modules
npm install

# 2. Re-install Pods with a clean slate
cd ios
rm -rf Pods
rm -rf build
rm -rf Podfile.lock
pod deintegrate
pod install
cd ..

# 3. Rebuild
npx expo run:ios
```

### 🤖 Android Issues

**Problem:** Build failures related to Kotlin or Gradle.

**Solution:**

```bash
# 1. Clean Gradle build
cd android
./gradlew clean
cd ..

# 2. Rebuild
npx expo run:android
```

## ⚠️ Critical Configuration Notes

This project has specific native configurations that **must not be changed** without careful consideration:

1.  **Kotlin Version:** The project is hardcoded to use **Kotlin 2.0.21** in `android/build.gradle`. Changing this may break the build due to Compose Compiler compatibility.
2.  **Native Directories:** Do **NOT** delete `/android` or `/ios`. They contain custom Frame Processors that are not managed by Expo Prebuild.
    - **Do NOT run** `npx expo prebuild --clean` unless you know exactly what you are doing (it will wipe the custom native code).
3.  **Worklets:** The project uses `react-native-worklets-core`. Ensure the version matches the requirement of `react-native-vision-camera`.

## 📂 Project Structure

```
SignSense/
├── app/                        # Screens and Navigation (Expo Router)
│   ├── (tabs)/                 # Main Tabs (Home, Hand, Pose)
│   └── ...
├── components/                 # Reusable UI Components
├── ios/signlangapp/            # Native iOS Code
│   ├── HandLandmarkerFrameProcessor.swift  # 🧠 Core Vision Logic (Swift)
│   └── HandLandmarkerFrameProcessor.m      # Obj-C Bridge
├── android/app/src/main/java/  # Native Android Code
│   └── com/signlangapp/
│       └── HandLandmarkerFrameProcessor.kt # 🧠 Core Vision Logic (Kotlin)
├── assets/                     # Images and Models (tflite/task files)
└── ...
```

## 📄 License

This project is licensed under the MIT License.
