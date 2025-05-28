// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Enable CJS and modify resolver settings
config.resolver.sourceExts.push("cjs");
config.resolver.unstable_enablePackageExports = false;

// Inject NativeWind config
const finalConfig = withNativeWind(config, { input: "./app/globals.css" });

module.exports = finalConfig;
