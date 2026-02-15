const { withProjectBuildGradle } = require("@expo/config-plugins");

/**
 * Config plugin to set Kotlin version to 2.0.21 in android/build.gradle
 */
const withAndroidKotlinVersion = (config) => {
  return withProjectBuildGradle(config, (config) => {
    if (config.modResults.contents) {
      // Replace the kotlinVersion line
      config.modResults.contents = config.modResults.contents.replace(
        /kotlinVersion\s*=\s*findProperty\(['"]android\.kotlinVersion['"]\)\s*\?\:\s*['"][^'"]+['"]/,
        `kotlinVersion = findProperty('android.kotlinVersion') ?: '2.0.21'`,
      );

      // Ensure Kotlin Gradle Plugin version is specified
      config.modResults.contents = config.modResults.contents.replace(
        /classpath\(['"]org\.jetbrains\.kotlin:kotlin-gradle-plugin['"]\)/,
        `classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:\${kotlinVersion}")`,
      );
    }
    return config;
  });
};

module.exports = withAndroidKotlinVersion;
