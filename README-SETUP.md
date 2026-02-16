# Sign Language Detection App - Setup Guide

## 🚀 Quick Start for Team Members

โปรเจคนี้ commit โฟลเดอร์ `/android` และ `/ios` เข้า git เพื่อความมั่นใจว่าทุกคนจะ build ได้เหมือนกัน

### ขั้นตอนการ Setup (สำหรับคนที่ clone มาใหม่)

1. **Clone โปรเจค**

   ```bash
   git clone <repository-url>
   cd sign-sense-app
   ```

2. **ติดตั้ง dependencies**

   ```bash
   npm install
   ```

3. **รันแอพ**

   ```bash
   # Android
   npx expo run:android

   # iOS
   npx expo run:ios
   ```

**เท่านี้เอง!** ไม่ต้องรัน `expo prebuild` เพราะ `/android` และ `/ios` มีอยู่ใน git แล้ว

---

## 📱 รันบน Physical Device

### Android

```bash
# ดู devices ที่เชื่อมต่อ
adb devices

# รันบน device
npx expo run:android --device
```

### iOS

```bash
# รันบน device (เลือกจากรายการที่แสดง)
npx expo run:ios --device
```

---

## 🔧 การแก้ไข Native Code

### ⚠️ สำคัญมาก!

เมื่อแก้ไขไฟล์ใน `/android` หรือ `/ios`:

- ✅ **ต้อง commit เข้า git** เพื่อให้ทีมอื่นได้การเปลี่ยนแปลง
- ❌ **อย่าลบ** `/android` หรือ `/ios` ออกไป
- ❌ **อย่ารัน** `expo prebuild --clean` (จะ reset การแก้ไขทั้งหมด)

### ไฟล์ Native ที่มีการ Customize

#### iOS (Swift)

- `ios/signlangapp/HandLandmarkerFrameProcessor.swift` - Frame processor สำหรับ detect มือ

#### Android (Kotlin)

- `android/app/src/main/java/com/signlangapp/HandLandmarkerFrameProcessor.kt` - Frame processor สำหรับ detect มือ

#### Android Build Config

- `android/build.gradle` - ตั้งค่า Kotlin version เป็น 2.0.21
- `node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle` - แก้ไข publishing สำหรับ AGP 8.0+

---

## 🐛 Troubleshooting

### Build ไม่ผ่านบน Android

```bash
# ลบ build cache
cd android
./gradlew clean
cd ..

# ลบ node_modules และติดตั้งใหม่
rm -rf node_modules
npm install

# ลอง build อีกครั้ง
npx expo run:android
```

### Build ไม่ผ่านบน iOS

```bash
# ลบ Pods และติดตั้งใหม่
cd ios
pod deintegrate
pod install
cd ..

# ลอง build อีกครั้ง
npx expo run:ios
```

### Metro Bundler มีปัญหา

```bash
# Clear Metro cache
npx expo start --clear

# หรือ
npx react-native start --reset-cache
```

---

## 📦 Dependencies ที่สำคัญ

- **React Native**: 0.77.0
- **Expo**: 52.x
- **Kotlin**: 2.0.21 (สำคัญมาก! ต้องใช้ version นี้)
- **react-native-vision-camera**: สำหรับเข้าถึงกล้อง
- **react-native-worklets-core**: สำหรับ frame processor
- **@thinksys/react-native-mediapipe**: สำหรับ hand detection

---

## ⚠️ Known Issues

### 1. react-native-worklets version

**ห้ามติดตั้ง** `react-native-worklets` version 0.5.x หรือ 0.7.x เพราะไม่ compatible กับ React Native 0.77.0

**วิธีแก้:** ตอนนี้ใช้แบบ peer dependency จาก `react-native-vision-camera` อยู่แล้ว (ถูกต้อง)

### 2. Kotlin Version

**ห้ามเปลี่ยน** Kotlin version ใน `android/build.gradle` เป็น version อื่น เพราะจะทำให้ Compose Compiler plugin error

**ต้องใช้:** Kotlin 2.0.21

### 3. Node Modules แก้ไข

ไฟล์ `node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle` ถูกแก้ไขเพื่อรองรับ AGP 8.0+

**ถ้า npm install แล้วเจอ error ตรงนี้:** ต้องแก้ไขอีกครั้ง (ดูได้จาก git diff)

---

## 📚 เอกสารเพิ่มเติม

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Vision Camera](https://github.com/mrousavy/react-native-vision-camera)
- [MediaPipe Hand Landmarker](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker)

---

## 🔮 Future Improvements

ในอนาคตอาจจะเปลี่ยนไปใช้ **Expo Config Plugins** เพื่อ:

- ไม่ต้อง commit `/android` และ `/ios` เข้า git
- จัดการ native code ผ่าน plugins แทน
- ลด merge conflicts

ไฟล์ config plugins มีอยู่ใน `.future-configs/` แล้ว พร้อมใช้งานเมื่อต้องการ
