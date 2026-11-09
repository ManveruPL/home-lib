This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Project: Home Library

Offline-first, Android-only book catalog. Requirements live in `.ai-data/` (`application_description.md`, `developer_documentation.md`). Read them before implementing a feature.

### Stack

- Expo Router (`src/app/`), NativeWind 4 (Tailwind 3) for styling. Use `min-h-touch`/`min-w-touch` for 48px tap targets.
- expo-sqlite + Drizzle ORM. Schema in `src/db/schema.ts`. Screens read data through `useDbQuery` (`src/db/use-db-query.ts`), which re-runs on changes to any listed table, joined tables included. Don't use Drizzle's `useLiveQuery`: it misses junction-table changes.
- Writes go through the feature repositories (`*-repository.ts`). Multi-table writes use a synchronous `db.transaction((tx) => …)` with `.run()/.get()/.all()`.
- react-hook-form + zod for forms. Zod error messages are i18n keys (e.g. `validation.required`).
- TanStack Query only for the external ISBN lookup APIs, not for local DB data.
- i18next with PL + EN (`src/i18n/locales/*.json`). Never hard-code user-facing strings. `en.json` is the source of the key types.
- Bottom sheets for selectors and pickers (never small dropdowns): use `SelectSheet` / `Sheet` from `src/components/ui/`. They are built on React Native's `Modal` + `Animated`. Don't reintroduce `@gorhom/bottom-sheet`: v5.2 silently fails to open with Reanimated 4, which SDK 57 requires.
- Search, filter and sort happen in memory (`book-filters.ts`): `foldText` handles Polish diacritics and `compareText` handles Polish collation. SQLite `LIKE`/`ORDER BY` can do neither.

### Theme & branding

Brand kit: `.ai-data/branding/branding.md`. Colors live in `src/theme/palette.ts` (Material 3 tokens, light + dark), which feeds both `tailwind.config.ts` and the React Navigation theme.

- Use token classes (`bg-primary`, `text-on-surface`, `bg-surface-variant`, `text-accent` for stars). Never hard-code hex values or use raw Tailwind colors.
- Use `Text` from `@/components/ui/text` with a `variant` (display, headline, title, body, bodySmall, label) instead of the React Native `Text`.
- Fonts (`Lora`, `PlusJakartaSans`) are embedded at build time by the expo-font plugin in `app.json`. Select weights with `font-medium`/`font-bold`, not per-weight family names.
- App icons in `assets/images/` were generated from `.ai-data/branding/master-assets/`.

### Layout

- `src/app/` – routes only: `(tabs)/` Library, Search, Quick Scan, Settings; `book/new`, `book/[id]`, `book/[id]/edit`, `author/[id]`
- `src/db/` – Drizzle client, schema, generated migrations, `useDbQuery`
- `src/features/<feature>/` – repositories, hooks, form schemas and feature components (books, authors, genres, lookup, scan, backup)
- `src/lib/` – framework-agnostic helpers (ISBN validation, query client)
- `src/theme/`, `src/components/ui/` – palette, theme root, shared UI primitives
- `src/providers/` – app-wide providers (DB migrations, query client, gestures, bottom sheets)

### ISBN lookup

`src/features/lookup/lookup-isbn.ts` tries e-ISBN first, then Open Library.

- e-ISBN (`.ai-data/Dokumentacja_API.pdf`) needs no key. It returns ONIX 3.0 XML and accepts ISBN-13 only, so ISBN-10 is converted first.
- Its data is noisy: publishers listed as contributors, trailing catalogue punctuation, authors often under role Z99. `onix.ts` handles this; change it carefully.
- Open Library: the `/api/books?bibkeys=…&jscmd=data` endpoint in `developer_documentation.md` now returns 404. Use the Read API `/api/volumes/brief/isbn/{isbn}.json`: `[]` means not found, otherwise `records[*].data` has the same shape.

### Hermes / runtime gotchas

- Avoid Unicode property escapes (`\p{L}`) in regexes. They may not run on Hermes; use explicit ranges.
- Don't pass `count` to `t()`: it triggers i18next plural rules, which need `Intl.PluralRules`. Use another name (`n`) and phrase counts as "Books: {{n}}".
- Cached covers live in `Paths.document/covers` (`covers.ts`). Delete them when a book is deleted or its cover changes. Camera and gallery picks are downscaled to 600px wide (`shrinkPickedCover`) before saving.
- `patches/` is applied by `postinstall`. `react-native-screens+4.26.2.patch` fixes an Android crash, "ScreenStackFragment added into a non-stack container", on `router.replace` after saving a book (upstream #4429 / PR #4498). Drop it once a screens release includes the fix. The masked-view patch only removes build warnings. Expo modules marked 📦 in the Gradle output are prebuilt AARs, so patching their sources has no effect. If a patch no longer applies after an upgrade, check whether it's still needed. `npx patch-package <pkg>` fails on this machine, so build patches with `git diff --no-index` against the `npm pack`ed original.
- The goal is a warning-free Android build. `plugins/with-clean-android-build.js` must stay last in `app.json`. It fixes the generated gradle files (`=` assignment, foojay toolchain resolver), removes the no-op `RECORD_AUDIO` removal marker from the manifest, silences Kotlin/Java/C++ warnings for third-party modules (not `:app`), and sets `org.gradle.warning.mode=none` because the remaining deprecations are in library build files and AGP/Kotlin internals. After an Expo SDK upgrade, run `gradlew assembleDebug --warning-mode all` once to review what is being silenced.
- `metro.config.js` excludes native build output (`android/**/build`, `.cxx`) from Metro. Without that, Metro runs out of memory during a clean Gradle build.
- Backups are format version 2: the JSON from the spec plus `covers` (backup book id → `{ mimeType, base64 data }`). Version 1 files (no covers) still restore. Cover files are written only after the restore transaction commits.

### Tests

`npm test` (jest-expo). Tests sit next to the code as `*.test.ts` and import `describe/expect/it` from `@jest/globals`, because TypeScript 6 no longer loads `@types/jest` globals. Keep tested modules free of DB imports (see `parse-backup.ts`) or mock them.

### Database changes

Edit `src/db/schema.ts`, then run `npm run db:generate`. Migrations are applied on startup by `DatabaseProvider`. Never edit generated files in `src/db/migrations/` by hand.

### Running

- Expo Go: `npm run start:go`. Everything works except the embedded fonts, icon and splash screen.
- Development build: `npm run android` (`expo run:android`). Needs the Android SDK (not installed on the dev machine yet).

Before finishing a task, run `npm run typecheck`, `npm run lint` and `npm test`.
