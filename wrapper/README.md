# Wonder Egg World — Android wrapper (Capacitor)

Turns the web game (repo root) into an installable Android app with **AdMob interstitials**,
a one-time **Remove-Ads** purchase, and optional **Firebase Analytics**. All the game logic
already lives in `../index.html`; this folder is just the native shell + build glue.

> Full submission steps (Play Console, Families, Data Safety, listing) are in
> `../RELEASE_CHECKLIST.md`. AdMob/COPPA detail in `../ADMOB_SETUP.md`.

## Prereqs (your machine — one-time)
- **Node 18+**, **Android Studio** (with the Android SDK + an emulator or a USB device),
  a **Google Play Console** account, an **AdMob** account.
- (Optional analytics) a **Firebase** project. (Optional IAP) a **RevenueCat** account.

## Fast path — from zero to .aab
```bash
cd wrapper
npm install
npm run prepare:android      # copy web + add android + sync + patch AdMob manifest (one shot)
npm run assets               # generate launcher icons/splash (uses ../assets/store/icon.png)
npm run open                 # Android Studio -> Build > Generate Signed Bundle (.aab)
```
After any later change to the web game, just re-run `npm run sync`.

### What `npm run prepare:android` does
1. `copy:web` — copies `../index.html`, `../assets`, `../manifest.json` into `www/`, copies
   `billing-glue.js`, and **auto-injects** `<script src="billing-glue.js"></script>`.
2. `cap add android` — creates the native `android/` project.
3. `cap sync android` — installs the plugins (AdMob, RevenueCat, Firebase Analytics).
4. `patch` — injects the **AdMob APPLICATION_ID** meta-data + a `strings.xml` entry
   (required — without it the app crashes when AdMob starts).

## Fill in your IDs (one-time, before building)
1. **AdMob**
   - `../index.html` -> `const ADMOB = { appId, interstitial, testMode }` — real IDs; keep
     `testMode:true` until your AdMob account is approved.
   - `android/app/src/main/res/values/strings.xml` -> `admob_app_id` -> your real **APP ID**.
2. **Remove-Ads (RevenueCat)** — `billing-glue.js` -> `RC_KEY` (public Google key);
   product `remove_ads` (non-consumable), entitlement `ad_free`.
3. **Analytics (optional)** — drop `google-services.json` into `android/app/`, then enable the
   google-services Gradle plugin (RELEASE_CHECKLIST.md section F). Without it, analytics no-ops
   and the app still builds.

## Signing
Easiest: **Android Studio -> Build -> Generate Signed Bundle/APK -> Android App Bundle** -> create
a new keystore (or pick yours) -> it builds the signed `.aab`. **Back up the keystore** — losing
it means you can never update the app.

### CLI signing (for `npm run build:aab`) — already wired
`patch-android.js` (run by `prepare:android`) drops a conditional `android/app/signing.gradle`
and applies it, so you do **not** edit `build.gradle` by hand. Just:
1. Create a keystore once (command is in `key.properties.example`).
2. Copy `key.properties.example` -> `android/key.properties` and fill in the 4 values
   (absolute keystore path + passwords + alias).
3. `npm run build:aab`  ->  `android/app/build/outputs/bundle/release/app-release.aab` (signed).

If `key.properties` is absent, the release build is just unsigned — use the Android Studio
wizard (Build > Generate Signed Bundle) instead.

## In-app product (Play Console)
Create `remove_ads` as a **non-consumable** managed product. The game's Parent Zone has
**Remove Ads** + **Restore** buttons that drive `onRemoveAdsPurchase()` / `restorePurchases()`
in `billing-glue.js` -> `grantAdFree()` on success.

## Files
- `package.json` — Capacitor + AdMob + RevenueCat + Firebase deps and build scripts.
- `capacitor.config.json` — appId `com.wonderegg.world`, webDir `www`.
- `copy-web.js` — copies the web game into `www/` and injects the billing glue.
- `patch-android.js` — injects the AdMob manifest meta-data (idempotent).
- `billing-glue.js` — RevenueCat wiring for Remove-Ads.
- `key.properties.example` — signing template.
- `www/`, `android/`, `node_modules/`, `key.properties`, `*.keystore` are git-ignored.
