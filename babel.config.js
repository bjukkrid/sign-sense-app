module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Required for react-native-worklets-core (Frame Processors)
      ["react-native-worklets-core/plugin"],
      // Required for react-native-reanimated (must be listed last)
      "react-native-reanimated/plugin",
    ],
  };
};
