# HomeLib — Brand Identity & Design System Guidelines

> **Version:** 1.0.0  
> **Platform Target:** Android 8.0+ (API Level 26–35+) & Google Play Store  
> **Aesthetic:** Modern Literary • Material Design 3 • Warm Editorial  

---

## 1. Executive Summary & Brand Core

**HomeLib** is a personal library cataloging and home book management application designed for readers, collectors, and bibliophiles. It transforms physical bookshelves into an organized, searchable, and aesthetically pleasing digital sanctuary.

### Brand Pillars
1. **The Sanctuary (Home)**: Books are not merely data points; they are part of one's living space and comfort. The branding reflects warmth, wooden shelves, and quiet reading hours.
2. **The Curation (Library)**: Precision, cataloging elegance, and clarity. Tracking reading status, lending history, and personal annotations effortlessly.
3. **Timeless Refinement**: Moving away from generic flat tech aesthetics toward an evocative, literary design reminiscent of vintage bookplates, embossed spines, and archival paper.

### Voice and Tone
* **Warm & Thoughtful**: Welcoming, calm, and respectful of the reading habit.
* **Organized & Precise**: Clear data display for ISBNs, publishers, and Dewey/custom tags.
* **Non-Intrusive**: UI elements support reading, rather than demanding attention.

---

## 2. Brand Visual Identity & Logo Anatomy

```
                   ▲ [Apex: Home & Sanctuary]
                  / \
                 /   \__ [Chimney: Domestic Warmth]
                /     \ |
               /_______\_ 
              |  /\  /\  | [Open Folio: Knowledge & Pages]
              | /  \/  \ |
              |/________\|
```

### Visual Metaphor
* **The Gabled Roof & Chimney**: Represents the home, safety, and personal space.
* **The Open Book / Folio**: Forms the heart of the home, signifying stories living within your walls.
* **The Squircle Base**: Aligned with modern Android icon geometry, using soft organic curves for modern launcher harmony.

### Icon Usage Rules
* **Minimum Launcher Size**: 48 × 48 px (`mipmap-mdpi`).
* **Clear Space**: Always maintain a minimum clear margin equal to 15% of the icon width around the central mark.
* **Do's**:
  * Use the solid Evergreen background for standard launchers and Play Store listings.
  * Use the transparent foreground symbol when implementing Android Adaptive Icons.
  * Use the monochrome outline version for Android 13+ dynamic themed icons.
* **Don'ts**:
  * Do not stretch, skew, or distort the house or book proportions.
  * Do not add harsh drop shadows to the Google Play Store icon (Google Play dynamically generates elevation).
  * Do not place complex textual taglines inside the app icon.

---

## 3. Color System (Material Design 3 Compatible)

The color palette draws inspiration from classic private libraries: forest green leather bindings, warm gold leaf foil, and gentle parchment paper.

### Core Brand Colors

| Swatch | Name | Hex Code | RGB | HSL | Semantic Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| ![#144C3A](https://via.placeholder.com/14/144C3A/000000?text=+) | **Evergreen Primary** | `#144C3A` | `rgb(20, 76, 58)` | `161°, 58%, 19%` | Primary brand identifier, launcher background, app bar |
| ![#DEB25B](https://via.placeholder.com/14/DEB25B/000000?text=+) | **Gilded Ochre** | `#DEB25B` | `rgb(222, 178, 91)` | `40°, 68%, 61%` | Accent highlights, star ratings, active filters, icon motif |
| ![#F6EAD0](https://via.placeholder.com/14/F6EAD0/000000?text=+) | **Parchment Cream** | `#F6EAD0` | `rgb(246, 234, 208)` | `41°, 68%, 89%` | Light mode surface, card backgrounds, book page fill |
| ![#221811](https://via.placeholder.com/14/221811/000000?text=+) | **Espresso Ink** | `#221811` | `rgb(34, 24, 17)` | `25°, 33%, 10%` | High-contrast body text, primary typography |
| ![#121A16](https://via.placeholder.com/14/121A16/000000?text=+) | **Deep Walnut** | `#121A16` | `rgb(18, 26, 22)` | `150°, 18%, 9%` | Dark mode background and surface |
| ![#7E9F8E](https://via.placeholder.com/14/7E9F8E/000000?text=+) | **Muted Sage** | `#7E9F8E` | `rgb(126, 159, 142)` | `149°, 15%, 56%` | Tertiary status badges (e.g. "Read", "Lent") |

### Material 3 Token Mapping

```xml
<!-- Light Theme Tokens -->
<color name="md_theme_light_primary">#144C3A</color>
<color name="md_theme_light_onPrimary">#FFFFFF</color>
<color name="md_theme_light_primaryContainer">#BAE8D4</color>
<color name="md_theme_light_secondary">#7A5900</color>
<color name="md_theme_light_secondaryContainer">#FFDF9E</color>
<color name="md_theme_light_background">#FAF6EE</color>
<color name="md_theme_light_surface">#FAF6EE</color>
<color name="md_theme_light_onSurface">#191C1B</color>

<!-- Dark Theme Tokens -->
<color name="md_theme_dark_primary">#9ED2BD</color>
<color name="md_theme_dark_onPrimary">#003829</color>
<color name="md_theme_dark_background">#121A16</color>
<color name="md_theme_dark_surface">#121A16</color>
<color name="md_theme_dark_onSurface">#E1E3DF</color>
```

---

## 4. Typography Guidelines

HomeLib combines a literary editorial serif with a crisp, geometric sans-serif for UI clarity.

### Primary Font Pairings
* **Headings, Book Titles & Display**: **[Lora](https://fonts.google.com/specimen/Lora)** or **[Merriweather](https://fonts.google.com/specimen/Merriweather)**
  * *Characteristics*: Warm calligraphic curves, elegant serifs, literary heritage.
  * *Use Cases*: App brand title, Book detail title, Author highlight banner.
* **Interface, Metadata & ISBNs**: **[Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)** or **[Inter](https://fonts.google.com/specimen/Inter)**
  * *Characteristics*: High legibility, neutral geometry, tall x-height.
  * *Use Cases*: Navigation bar, book search field, barcode/ISBN scanner labels, shelf categories.

### Type Scale

| Role | Font Family | Weight | Size | Line Height |
| :--- | :--- | :--- | :--- | :--- |
| **Display Large** | Lora | Bold (700) | 32 sp | 40 sp |
| **Headline Medium** | Lora | SemiBold (600) | 24 sp | 30 sp |
| **Title Medium** | Plus Jakarta Sans | Medium (500) | 16 sp | 24 sp |
| **Body Large** | Plus Jakarta Sans | Regular (400) | 16 sp | 24 sp |
| **Body Small** | Plus Jakarta Sans | Regular (400) | 12 sp | 16 sp |
| **Label Small** | Plus Jakarta Sans | Medium (500) | 11 sp | 16 sp |

---

## 5. Android Build Asset Directory Structure

All required build sizes have been generated and structured to match standard Android Studio projects:

```
homelib-branding/
│
├── branding.md                                   <- This document
│
├── android/
│   └── res/
│       ├── mipmap-mdpi/                          <- 1.0x baseline (legacy)
│       │   ├── ic_launcher.png                   (48 × 48 px)
│       │   ├── ic_launcher_round.png             (48 × 48 px)
│       │   └── ic_launcher_foreground.png        (108 × 108 px)
│       ├── mipmap-hdpi/                          <- 1.5x density
│       │   ├── ic_launcher.png                   (72 × 72 px)
│       │   ├── ic_launcher_round.png             (72 × 72 px)
│       │   └── ic_launcher_foreground.png        (162 × 162 px)
│       ├── mipmap-xhdpi/                         <- 2.0x density
│       │   ├── ic_launcher.png                   (96 × 96 px)
│       │   ├── ic_launcher_round.png             (96 × 96 px)
│       │   └── ic_launcher_foreground.png        (216 × 216 px)
│       ├── mipmap-xxhdpi/                        <- 3.0x density
│       │   ├── ic_launcher.png                   (144 × 144 px)
│       │   ├── ic_launcher_round.png             (144 × 144 px)
│       │   └── ic_launcher_foreground.png        (324 × 324 px)
│       ├── mipmap-xxxhdpi/                       <- 4.0x density
│       │   ├── ic_launcher.png                   (192 × 192 px)
│       │   ├── ic_launcher_round.png             (192 × 192 px)
│       │   └── ic_launcher_foreground.png        (432 × 432 px)
│       ├── mipmap-anydpi-v26/                    <- Adaptive icon declarations (API 26+)
│       │   ├── ic_launcher.xml
│       │   └── ic_launcher_round.xml
│       ├── drawable/                             <- Vector drawables
│       │   └── ic_launcher_foreground.xml        (108dp Android Vector Drawable)
│       └── values/                               <- Color tokens
│           └── colors.xml                        (Brand & launcher colors)
│
├── store/
│   ├── playstore-icon-512x512.png                <- Official Google Play Store asset (full bleed)
│   └── playstore-icon-squircle-512x512.png       <- Marketing squircle asset
│
├── vector/
│   ├── homelib-logo-full.svg                     <- Scalable SVG with squircle background
│   └── homelib-logo-symbol.svg                   <- Scalable SVG symbol on transparent background
│
└── master-assets/
    ├── homelib-fullbleed-1024x1024.png           <- Master full bleed canvas
    ├── homelib-icon-master-1024x1024.png         <- Master raw graphic
    ├── homelib-icon-squircle-1024x1024.png       <- Master squircle on transparent canvas
    └── homelib-symbol-only-1024x1024.png         <- Master foreground symbol
```

---

## 6. Android Studio Integration Quickstart

### Step 1: Copy Resources
Copy the contents of the `android/res/` folder into your Android Studio project at:
```
<your-project>/app/src/main/res/
```

### Step 2: Configure AndroidManifest.xml
Ensure your `<application>` tag points to the generated launcher resources:

```xml
<application
    android:name=".HomeLibApplication"
    android:allowBackup="true"
    android:icon="@mipmap/ic_launcher"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:label="@string/app_name"
    android:theme="@style/Theme.HomeLib">
    ...
</application>
```

### Step 3: Android 12+ Splash Screen API
To enable the branded splash screen, define the theme in `res/values/themes.xml`:

```xml
<style name="Theme.HomeLib.Starting" parent="Theme.SplashScreen">
    <item name="windowSplashScreenBackground">@color/homelib_evergreen_primary</item>
    <item name="windowSplashScreenAnimatedIcon">@drawable/ic_launcher_foreground</item>
    <item name="postSplashScreenTheme">@style/Theme.HomeLib</item>
</style>
```

---
*Created for HomeLib — Curate, Cherish, and Catalog.*
