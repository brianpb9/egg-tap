# Wonder Egg World — AdMob + Play Store Setup

The game is a single static web app (`index.html` + `assets/`). The ad + remove-ads
logic is already wired in JS (`ADMOB`, `ADS`, `removeAds`, `grantAdFree`,
`restorePurchases`). In a plain browser ads are **no-ops**; they only run once the
web app is wrapped in a native Android shell with the AdMob plugin. This guide is
the checklist to ship it to Google Play with ads + a one-time "Remove Ads" purchase.

---

## 0. IMPORTANT — Kids / Families compliance (read first)
This app targets **ages 3–6** → it must join **Google Play "Designed for Families"** and
follow the **Families Self-Certified Ads SDK** program + COPPA / GDPR-K / UU PDP.
- Use **AdMob** (it is families-self-certified) and **only** the non-personalized,
  child-directed path. The code already calls `initialize({ tagForChildDirectedTreatment:true,
  tagForUnderAgeOfConsent:true, maxAdContentRating:'G' })` and requests `npa:true`
  (non-personalized) interstitials.
- **No behavioral targeting, no data collection from children, G-rated ads only.**
- Interstitials must be full-screen, clearly closeable, and **not** shown on app open
  or during a learning task. Here they show only **between hatches** (every `AD_EVERY`).
- Declare ads truthfully in Play Console (Data safety + "Ads" + target age).
> If review friction is a concern, the cleanest alternative is **paid app or IAP-only
> (no ads)** — the code supports `S.adsRemoved` as a permanent ad-free state.

---

## 1. Put your real AdMob IDs in the game
In `index.html`, edit the `ADMOB` object:
```js
const ADMOB={ appId:'ca-app-pub-REAL~REAL', interstitial:'ca-app-pub-REAL/REAL', testMode:false };
```
Keep `testMode:true` until you're approved (uses Google test ads — never click real ads on your own device during development; it can ban your account).
Create the app + ad unit at https://admob.google.com → "Interstitial".

## 2. Wrap the web app with Capacitor
From a folder *next to* this repo (not inside it, to keep Vercel static):
```bash
npm create @capacitor/app wonder-egg-app   # or: npm init -y && npm i @capacitor/core @capacitor/cli @capacitor/android
cd wonder-egg-app
npx cap init "Wonder Egg World" com.wonderegg.world --web-dir=www
# copy the game's index.html + assets + manifest.json into ./www
npx cap add android
```
`capacitor.config.json`:
```json
{
  "appId": "com.wonderegg.world",
  "appName": "Wonder Egg World",
  "webDir": "www",
  "android": { "backgroundColor": "#bfe6ff" }
}
```

## 3. AdMob plugin
```bash
npm i @capacitor-community/admob
npx cap sync android
```
Add to `android/app/src/main/AndroidManifest.xml` inside `<application>`:
```xml
<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID"
           android:value="ca-app-pub-REAL~REAL"/>
```
The game auto-detects the plugin (`Capacitor.Plugins.AdMob`) and serves the
interstitial via `ADS.interstitial()`. Call `ADS.init()` once at startup (the code
already calls it lazily before the first ad).

## 4. "Remove Ads" one-time purchase (the monetization)
Pick a billing layer and wire 3 hooks already present in the game:
- On successful purchase → call `grantAdFree()` (sets `S.adsRemoved=true`, hides ads forever).
- `removeAds()` (the Parent-Zone button) → start the purchase.
- `restorePurchases()` → query entitlement, then `grantAdFree()` if owned.

Recommended: **RevenueCat** (`@revenuecat/purchases-capacitor`) or
`@capacitor-community/in-app-purchases` with a Google Play **non-consumable** product
e.g. `remove_ads`. Example glue (add near `removeAds` in index.html):
```js
async function onRemoveAdsPurchase(){ /* call your billing plugin's purchase('remove_ads') */ /* on success: */ grantAdFree(); }
```
Create the product in Play Console → Monetize → In-app products (non-consumable),
id `remove_ads`.

## 5. Build, sign, upload
```bash
npx cap copy android && npx cap sync android
npx cap open android   # Android Studio
# Build > Generate Signed Bundle (.aab), upload to Play Console
```

## 6. Play Console checklist
- [ ] App content → **Target audience & content = Ages 3–6**, join **Designed for Families**.
- [ ] **Ads** declaration = Yes; using AdMob (families-certified).
- [ ] **Data safety**: no personal data collected from children; non-personalized ads only.
- [ ] **Content rating** questionnaire (IARC) → Everyone.
- [ ] Store listing from `STORE.md` (icon `assets/store/icon.png`, screenshots, trailer).
- [ ] In-app product `remove_ads` (non-consumable) live.
- [ ] Privacy policy URL (required for Families).

## Tuning
- Ad frequency: `const AD_EVERY=2;` in index.html (interstitial after every N hatches).
- Make it gentler if review pushes back (e.g. 4) — kids-app ad density should be modest.
