const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push("cjs");
config.resolver.unstable_enablePackageExports = false;

const finalConfig = withNativeWind(config, {
  input: "./app/globals.css",
  cssToReactNativeRuntime: false,
});

module.exports = finalConfig;
