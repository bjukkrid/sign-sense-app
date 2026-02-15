const { withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

/**
 * Config plugin to fix the Expo modules publishing issue
 * Modifies ExpoModulesCorePlugin.gradle to handle missing release component
 */
const withExpoModulesCorePluginFix = (config) => {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const pluginPath = path.join(
        config.modRequest.projectRoot,
        "node_modules/expo-modules-core/android/ExpoModulesCorePlugin.gradle",
      );

      if (fs.existsSync(pluginPath)) {
        let content = fs.readFileSync(pluginPath, "utf-8");

        // Fix the release component issue
        const oldPattern =
          /release\(MavenPublication\) \{\s*from components\.release\s*\}/;
        const newPattern = `release(MavenPublication) {
          if (components.hasProperty("release")) {
            from components.release
          } else {
            // Fallback or skip if release component is not found
            // expected behavior for some AGP versions where release component isn't automatically created
          }
        }`;

        if (oldPattern.test(content)) {
          content = content.replace(oldPattern, newPattern);
          fs.writeFileSync(pluginPath, content, "utf-8");
          console.log(
            "✅ Fixed ExpoModulesCorePlugin.gradle for AGP 8.0+ compatibility",
          );
        }
      }

      return config;
    },
  ]);
};

module.exports = withExpoModulesCorePluginFix;
