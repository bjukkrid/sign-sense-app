# SignSense App 🤟

**SignSense App** is an AI-powered mobile application designed to detect and interpret Sign Language gestures in real-time. Built with **React Native** and **Expo**, it leverages the power of **Google MediaPipe** and **VisionCamera** for high-performance, on-device gesture recognition.

![Project Banner](https://via.placeholder.com/1200x400?text=SignSense+App+Preview)

## ✨ Key Features

- **Real-time Hand Detection:** Detects 21 hand landmarks with high precision and low latency using MediaPipe Hand Landmarker.
- **Full Body Pose Estimation:** Analyzes body posture and movements using MediaPipe Pose Landmarker.
- **Interactive Calibration:** Adjustable rotation and landmark alignment for different device orientations.
- **Modern Dashboard UI:** sleek, dark-themed interface for easy navigation between learning modules.
- **Native Performance:** Custom iOS Frame Processors written in Swift/Objective-C for optimal speed (30-60 FPS).

## 🛠 Tech Stack

- **Framework:** React Native + Expo (Development Build)
- **Camera & Vision:** `react-native-vision-camera` v4 + Frame Processors
- **AI Engine:** Google MediaPipe Tasks Vision (Native iOS Integration)
- **Navigation:** Expo Router (File-based routing)
- **Language:** TypeScript, Swift, Objective-C

## 🚀 Getting Started

### Prerequisites

- Node.js (LTS)
- Xcode (for iOS build)
- CocoaPods
- An iOS Device or Simulator

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/yourusername/sign-sense-app.git
    cd sign-sense-app
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Install iOS Pods (Native Modules):**

    ```bash
    npx pod-install
    ```

4.  **Run on iOS:**
    This project uses custom native code, so you must use the development build command:

    ```bash
    npx expo run:ios
    ```

    _(Note: allow `npx expo start --dev-client` for subsequent runs if native code hasn't changed)_

5.  **Run on iOS Fail:**
    When run on iOS fail:
    ```bash
    cd ios
    rm -rf Pods Podfile.lock build  # Clear cache all
    pod install
    cd ..
    npx expo run:ios
    ```

## 📱 Project Structure

```
SignSense/
├── app/                  # Screens and Navigation (Expo Router)
│   ├── (tabs)/           # Main Tabs (Home, Hand, Pose)
│   └── _layout.tsx       # Root Layout
├── components/           # Reusable UI Components
├── ios/                  # Native iOS Code
│   └── signlangapp/
│       ├── HandLandmarkerFrameProcessor.swift  # Core Vision Logic
│       └── HandLandmarkerFrameProcessor.m      # Obj-C Bridge
└── ...
```

## 🔧 Troubleshooting

- **Native Module Errors:** If you see errors related to `VisionCamera` or native modules not found, ensure you have run `npx pod-install` and rebuilt the app using `npx expo run:ios`.
- **Camera Permissions:** Ensure you've granted camera access on your device. Check `Info.plist` for `NSCameraUsageDescription`.

## 🤝 Contribution

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
