# Setup Instructions

## สำหรับทีมที่ clone โปรเจคมาใหม่

โปรเจคนี้ใช้ **Expo with Prebuild** ซึ่งไม่ได้ commit โฟลเดอร์ `/android` และ `/ios` เข้า git

### ขั้นตอนการ Setup

1. **Clone โปรเจค**

   ```bash
   git clone <repository-url>
   cd sign-sense-app
   ```

2. **ติดตั้ง dependencies**

   ```bash
   npm install
   ```

3. **Generate โฟลเดอร์ native (android/ios)**

   ```bash
   npx expo prebuild --clean
   ```

   คำสั่งนี้จะ:
   - สร้างโฟลเดอร์ `/android` และ `/ios` ใหม่
   - Apply config plugins ทั้งหมดที่อยู่ใน `plugins/` โฟลเดอร์
   - ตั้งค่า native code ตาม `app.config.js`

4. **รันแอพ**

   ```bash
   # Android
   npx expo run:android

   # iOS
   npx expo run:ios
   ```

## Config Plugins ที่ใช้

โปรเจคนี้ใช้ custom config plugins เพื่อแก้ไข native code อัตโนมัติ:

### 1. **withAndroidKotlinVersion.js**

- ตั้งค่า Kotlin version เป็น 2.0.21
- เพิ่ม Kotlin Gradle Plugin version
- จำเป็นสำหรับ Compose Compiler plugin

### 2. **withExpoModulesCorePluginFix.js**

- แก้ไขปัญหา "Could not get unknown property 'release'"
- รองรับ Android Gradle Plugin 8.0+
- Patch `ExpoModulesCorePlugin.gradle` ใน node_modules หลัง npm install

## สำหรับการพัฒนา

### เมื่อต้องการแก้ไข native code

**❌ อย่า** แก้ไขไฟล์ใน `/android` หรือ `/ios` โดยตรง เพราะจะหายเมื่อรัน `prebuild`

**✅ ทำแทน:**

1. สร้าง config plugin ใหม่ใน `plugins/` folder
2. เพิ่ม plugin ลงใน `app.config.js`
3. รัน `npx expo prebuild --clean` เพื่อ apply การเปลี่ยนแปลง

ตัวอย่าง:

```javascript
// plugins/withMyCustomConfig.js
const { withProjectBuildGradle } = require("@expo/config-plugins");

const withMyCustomConfig = (config) => {
  return withProjectBuildGradle(config, (config) => {
    // modify gradle file here
    return config;
  });
};

module.exports = withMyCustomConfig;
```

```javascript
// app.config.js
module.exports = {
  expo: {
    plugins: [
      // ...other plugins
      "./plugins/withMyCustomConfig",
    ],
  },
};
```

## Native Modules

### Swift Code (iOS)

ไฟล์ Swift native modules อยู่ที่:

- `ios/signlangapp/HandLandmarkerFrameProcessor.swift`

ไฟล์เหล่านี้จะถูกสร้างโดย Expo prebuild และ config plugins

### Kotlin Code (Android)

ไฟล์ Kotlin native modules อยู่ที่:

- `android/app/src/main/java/com/signlangapp/HandLandmarkerFrameProcessor.kt`

## Troubleshooting

### ถ้า build ไม่ผ่าน

```bash
# ลบ node_modules และ generated folders
rm -rf node_modules android ios

# ติดตั้งใหม่
npm install
npx expo prebuild --clean
```

### ถ้า config plugin ไม่ทำงาน

```bash
# Clear Expo cache
npx expo prebuild --clean
```

## อ่านเพิ่มเติม

- [Expo Config Plugins](https://docs.expo.dev/config-plugins/introduction/)
- [Expo Prebuild](https://docs.expo.dev/workflow/prebuild/)
- [Custom Native Code](https://docs.expo.dev/workflow/customizing/)
