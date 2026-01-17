const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Add CSV to source extensions so it can be imported as text
config.resolver.sourceExts.push('csv');

module.exports = withNativeWind(config, { input: "./global.css" });
// module.exports = config;
// module.exports = config;
