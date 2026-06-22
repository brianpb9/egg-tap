# Wonder Egg World — Play Store Release Checklist

Everything needed to ship to Google Play. The **code/config/docs side is done**; the
remaining items require your machine, your accounts, and your keys (Claude can't log in or
build/sign for you). Work top to bottom.

Monetization model (decided): **interstitial ad every 3 hatches** (`AD_EVERY=3`) + a
**one-time, non-consumable "Remove Ads" purchase** that disables ads forever.

---

## A. Code config — fill in real IDs (in `index.html`)
- [ ] `ADMOB.appId` and `ADMOB.interstitial` → your real AdMob IDs (currently `XXXX` placeholders, line ~1570).
- [ ] `ADMOB.testMode` → **`false`** only after your AdMob account is approved (keep `true` while testing — using real ads in testing can get you banned).
- [ ] `wrapper/billing-glue.js` → set `RC_KEY` to your RevenueCat public Google key; entitlement `ad_free`, product `remove_ads`.
- [ ] (Optional, recommended) Firebase Analytics — see section F. Without it, `track()` safely no-ops.
- [ ] Bump the version string shown in `STORE.md` / wherever you display it.

## B. Build the Android app (Capacitor) — see `wrapper/README.md`
```bash
cd wrapper
npm install
npm run copy:web            # copies ../index.html + ../assets + ../manifest.json into www/
npm run add:android         # first time only
npm run sync                # after every web change
npm run open                # opens Android Studio
```
- [ ] In `www/index.html`, ensure `<script src="billing-glue.js"></script>` is included (add after copy if needed).
- [ ] `AndroidManifest.xml` → add AdMob `APPLICATION_ID` meta-data (real ID).
- [ ] Set `versionCode` (integer, increment every upload) and `versionName` (e.g. `1.0.0`).
- [ ] Confirm `applicationId` = `com.wonderegg.world` (or your chosen package — **cannot change after first publish**).

## C. Sign the app
- [ ] Generate an upload keystore (`keytool`) and **back it up safely** — losing it means you can't update the app.
- [ ] Enroll in **Play App Signing** (recommended).
- [ ] Build a signed **.aab** (Android App Bundle): Build → Generate Signed Bundle.

## D. Google Play Console — create & configure the app
- [ ] Create the app (Default language: English; type: Game; Free; with ads + IAP).
- [ ] **Target audience & content**: select age bands **Ages 5 & under** (and 6–8). This triggers Families requirements.
- [ ] Join **Designed for Families** program.
- [ ] **Content rating** (IARC questionnaire) → expect "Everyone".
- [ ] **Data safety form**: declare "No data collected / No data shared" (progress is local-only). If Firebase Analytics is on, declare analytics (anonymous, not linked to identity).
- [ ] **Ads declaration**: "Contains ads" = Yes.
- [ ] **Privacy policy URL**: host `PRIVACY.md` publicly (e.g. Vercel `/PRIVACY` or GitHub Pages) and paste the URL. **Fill in the contact email in `PRIVACY.md` first.**
- [ ] Government/news/COVID declarations as applicable (No).

## E. AdMob (Families)
- [ ] In AdMob, mark the app as **child-directed / Families self-certified**.
- [ ] Use only **Families-certified ad partners** (AdMob handles this when child-directed flags are set — already set in code).
- [ ] Add **app-ads.txt** to your published domain and link it in AdMob (recommended for fill rate).
- [ ] Keep `testMode:true` until the account + payments profile are approved.

## F. (Recommended) Firebase Analytics — so you're not blind at launch
- [ ] Create a Firebase project; add the Android app (`com.wonderegg.world`); download `google-services.json` into `android/app/`.
- [ ] Add the Capacitor Firebase Analytics plugin (`@capacitor-firebase/analytics`) and `npm run sync`.
- [ ] Events already emitted by the game (no extra code): `hatch`, `new_creature` (via hatch `is_new`), `daily_open`, `ad_interstitial`, `remove_ads_granted`. Watch **D1/D7 retention** and the **ad→purchase funnel**.

## G. In-app product
- [ ] Play Console → Monetize → In-app products → create **`remove_ads`** as a **non-consumable** (managed product), priced.
- [ ] Test purchase + **Restore** on a license-tester account (the game's Parent Zone has Remove Ads + Restore buttons).

## H. Store listing
- [ ] App icon (512×512) — `assets/store/icon.png`.
- [ ] Feature graphic (1024×500).
- [ ] Phone screenshots (min 2; use Hatch, Album, Home, a challenge). Tablet screenshots if targeting tablets.
- [ ] Short description + full description — draft in `STORE.md`.
- [ ] Promo video (optional) — `assets/store/trailer.mp4`.

## I. Test → release tracks
- [ ] **Internal testing** track first (instant, small tester list) — verify ads (test mode), purchase, restore, save/reset, audio, on a real device.
- [ ] Review the **Pre-launch report** (Play runs it on real devices) for crashes/policy flags.
- [ ] **Closed testing** (Play now often requires a testing period before production for new personal developer accounts — check current policy).
- [ ] Promote to **Production**. Consider a **staged rollout** (e.g. 10%) and one small country first (soft launch) to read retention before going wide.

## J. Post-launch
- [ ] Watch Firebase D1/D7 retention + crash-free rate (Android vitals).
- [ ] Watch ad eCPM/fill and Remove-Ads conversion.
- [ ] Iterate from real data — not guesses.

---

### Quick reference — what's already done in code
- Ad cadence (every 3 hatches) + child-directed, non-personalized, G-rated AdMob init.
- One-time non-consumable Remove-Ads flow (`removeAds`/`grantAdFree`/`restorePurchases`) + RevenueCat glue.
- Analytics shim (`track()`) — no-ops safely until Firebase/gtag is present.
- PWA `manifest.json`, `vercel.json` no-store, offline-first single file.
- Privacy policy (`PRIVACY.md`) — **fill in the contact email + host it**.

See also: `ADMOB_SETUP.md` (AdMob/COPPA detail), `wrapper/README.md` (build steps).
