# Wonder Egg World — Android wrapper (Capacitor + AdMob + Remove-Ads)

Turns the web game (repo root) into an installable Android app with AdMob
interstitials and a one-time "Remove Ads" purchase. The game's ad/IAP logic
already lives in `../index.html`; this folder is just the native shell.

> See `../ADMOB_SETUP.md` for the AdMob account setup and Families/COPPA compliance.

## Prereqs
- Node 18+, Android Studio (with SDK), a Google Play Console account, an AdMob account.

## Build steps
```bash
cd wrapper
npm install
npm run copy:web          # copies ../index.html + ../assets + ../manifest.json into www/
npx cap init "Wonder Egg World" com.wonderegg.world --web-dir=www   # first time only (config already provided)
npm run add:android       # adds the android/ project
npm run sync              # copy web + sync plugins
npm run open              # opens Android Studio -> Build > Generate Signed Bundle (.aab)
```
Re-run `npm run sync` after any change to the web game.

## 1. AdMob IDs
- In `../index.html` set the real IDs in `const ADMOB = { appId, interstitial, testMode:false }`.
- In `android/app/src/main/AndroidManifest.xml`, inside `<application>`:
  ```xml
  <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID"
             android:value="ca-app-pub-REAL~REAL"/>
  ```
- Keep `testMode:true` until your account is approved (use test ads only).

## 2. Remove-Ads purchase
- Create a **non-consumable** product `remove_ads` in Play Console.
- This folder uses **RevenueCat** (`@revenuecat/purchases-capacitor`); set your key
  and entitlement (`ad_free`) in `billing-glue.js`, then include it from `www/index.html`:
  ```html
  <script src="billing-glue.js"></script>
  ```
  (copy-web.js copies index.html; add the script tag in the source or post-copy).
- The game's `removeAds()` auto-calls `onRemoveAdsPurchase()` and `restorePurchases()`
  which `billing-glue.js` defines; success calls `grantAdFree()`.

## 3. Compliance (kids 3–6) — required
- Play Console → join **Designed for Families**, target age **3–6**.
- AdMob is **families-self-certified**; the game already inits child-directed,
  non-personalized, G-rated. Declare ads + data safety accordingly.
- Add a **privacy policy URL** (required for Families).

## Files
- `package.json` — Capacitor + AdMob + RevenueCat deps.
- `capacitor.config.json` — appId `com.wonderegg.world`, webDir `www`.
- `copy-web.js` — copies the web game into `www/`.
- `billing-glue.js` — Play Billing wiring for Remove-Ads.
- `www/`, `android/`, `node_modules/` are git-ignored (generated at build).
