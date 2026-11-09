const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Drizzle migrations are bundled as .sql files.
config.resolver.sourceExts.push('sql');

// Don't watch native build output (android/, node_modules/*/android/). A clean Gradle build
// writes gigabytes there and runs Metro out of memory.
config.resolver.blockList = [
  ...[config.resolver.blockList].flat(),
  /[\\/]android[\\/](?:[^\\/]+[\\/])?(?:build|\.cxx|\.gradle)(?:[\\/].*)?$/,
];

module.exports = withNativeWind(config, { input: './src/global.css' });
