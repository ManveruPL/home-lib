// Keeps the Android build free of warnings we can't fix at the source.
//
// - The Expo template still uses the Groovy `propName value` setter syntax (a Gradle 10
//   deprecation), and expo-modules-core (KSP) asks for a JDK 17 toolchain that Gradle
//   auto-provisions without a toolchain repository. Both are fixed in the generated files.
// - Third-party modules (node_modules) print hundreds of Kotlin, Java and C++ deprecation
//   warnings, and the Android/Kotlin Gradle plugins use deprecated Gradle APIs. We don't own
//   that code, so those diagnostics are silenced; the :app module keeps its own warnings.
// - The `RECORD_AUDIO` removal marker is a no-op (no library declares the permission) and
//   makes the manifest merger warn.
//
// Must stay last in app.json so it runs after the plugins that write these files.
// After an Expo SDK upgrade, run `gradlew assembleDebug --warning-mode all` once to review
// what is being silenced.
const fs = require('fs');
const path = require('path');
const {
  withAppBuildGradle,
  withFinalizedMod,
  withGradleProperties,
  withProjectBuildGradle,
  withSettingsGradle,
} = require('expo/config-plugins');

const FOOJAY_PLUGIN = 'id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"';

const APP_BUILD_GRADLE_FIXES = [
  [/^(\s*)ndkVersion (?!=)/m, '$1ndkVersion = '],
  [/^(\s*)namespace (?!=)/m, '$1namespace = '],
  [/^(\s*)signingConfig (?!=)/gm, '$1signingConfig = '],
  [/^(\s*)shrinkResources (?!=)/m, '$1shrinkResources = '],
  [/^(\s*)crunchPngs (?!=)/m, '$1crunchPngs = '],
  [/^(\s*)useLegacyPackaging (?!=)/m, '$1useLegacyPackaging = '],
  [/^(\s*)ignoreAssetsPattern (?!=)/m, '$1ignoreAssetsPattern = '],
];

const PROJECT_BUILD_GRADLE_FIXES = [[/maven \{ url (?!=)/g, 'maven { url = ']];

const SILENCE_MARKER = '// with-clean-android-build: silence third-party diagnostics';

const SILENCE_THIRD_PARTY = `
${SILENCE_MARKER}
subprojects { sub ->
  if (sub.path == ':app') return
  sub.tasks.withType(org.jetbrains.kotlin.gradle.tasks.KotlinCompile).configureEach {
    compilerOptions.suppressWarnings.set(true)
  }
  sub.tasks.withType(JavaCompile).configureEach {
    options.compilerArgs.addAll(['-nowarn', '-XDsuppressNotes'])
  }
  sub.plugins.withId('com.android.library') {
    sub.android.defaultConfig.externalNativeBuild.cmake.cFlags.add('-w')
    sub.android.defaultConfig.externalNativeBuild.cmake.cppFlags.add('-w')
  }
}
`;

function applyFixes(contents, fixes) {
  return fixes.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), contents);
}

module.exports = function withCleanAndroidBuild(config) {
  config = withAppBuildGradle(config, (mod) => {
    mod.modResults.contents = applyFixes(mod.modResults.contents, APP_BUILD_GRADLE_FIXES);
    return mod;
  });

  config = withProjectBuildGradle(config, (mod) => {
    let contents = applyFixes(mod.modResults.contents, PROJECT_BUILD_GRADLE_FIXES);
    if (!contents.includes(SILENCE_MARKER)) contents += SILENCE_THIRD_PARTY;
    mod.modResults.contents = contents;
    return mod;
  });

  config = withSettingsGradle(config, (mod) => {
    const contents = mod.modResults.contents;
    if (!contents.includes('foojay-resolver-convention')) {
      mod.modResults.contents = contents.replace(/^plugins \{\n/m, `plugins {\n  ${FOOJAY_PLUGIN}\n`);
    }
    return mod;
  });

  config = withGradleProperties(config, (mod) => {
    const overrides = {
      'org.gradle.warning.mode': 'none',
      // The template's 512 MiB metaspace runs out during a full release build.
      'org.gradle.jvmargs': '-Xmx4096m -XX:MaxMetaspaceSize=1024m',
    };
    const props = mod.modResults.filter(
      (item) => !(item.type === 'property' && item.key in overrides),
    );
    for (const [key, value] of Object.entries(overrides)) {
      props.push({ type: 'property', key, value });
    }
    mod.modResults = props;
    return mod;
  });

  // Expo's built-in blocked-permissions step writes the marker after user plugins run, so
  // strip it from the manifest on disk once every mod has finished.
  config = withFinalizedMod(config, [
    'android',
    async (mod) => {
      const manifestPath = path.join(
        mod.modRequest.platformProjectRoot,
        'app/src/main/AndroidManifest.xml',
      );
      const contents = await fs.promises.readFile(manifestPath, 'utf8');
      const cleaned = contents.replace(
        /\s*<uses-permission android:name="android\.permission\.RECORD_AUDIO" tools:node="remove"\/>/,
        '',
      );
      if (cleaned !== contents) await fs.promises.writeFile(manifestPath, cleaned);
      return mod;
    },
  ]);

  return config;
};
