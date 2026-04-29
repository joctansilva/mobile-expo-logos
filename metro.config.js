const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Allow .db files to be bundled as static assets
config.resolver.assetExts.push("db");

module.exports = withNativeWind(config, { input: "./global.css" });
