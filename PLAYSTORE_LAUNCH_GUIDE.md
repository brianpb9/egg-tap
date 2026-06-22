# 🎮 Play Store Launch — Panduan Lengkap A–Z (reusable untuk game baru)

Dokumen ini merangkum **semua syarat wajib** + **gotcha** yang kita temui saat merilis
*Wonder Egg World*. Pakai sebagai checklist dari awal supaya game baru siap dari A–Z,
tanpa nyangkut di hal yang sama.

> Konteks: game = **web single-file** (HTML/CSS/JS) dibungkus jadi Android app pakai
> **Capacitor**. Target: **game anak (Designed for Families)**, monetisasi **iklan + remove-ads**.
> Banyak poin berlaku umum untuk game apa pun.

---

## 0. Desain dari hari pertama (biar compliant by-design)
Kalau game-mu untuk **anak < 13**, rancang dari awal:
- ❌ **Tanpa login / akun / chat / user-generated content** (hindari semua kewajiban COPPA berat).
- ✅ **Progres disimpan LOKAL** (localStorage), bukan server. Tidak ada PII.
- ✅ **Iklan hanya child-directed + non-personalized** (lihat §4).
- ✅ **No-fail, no timer, tap besar** (UX anak).
- ✅ Siapkan **1 anchor art style** biar semua aset konsisten.
- ✅ Pikirkan **ukuran file sejak awal** — jangan kirim aset tak terpakai (§7).

---

## 1. Akun yang wajib dibuat
| Akun | Untuk | Biaya | Catatan |
|---|---|---|---|
| **Google Play Console** | publish | **$25 sekali seumur hidup** | Akun personal baru → **verifikasi identitas 1–3 hari** + wajib closed test 12/14 (§6) |
| **AdMob** | iklan | gratis | Daftarkan app → App ID (`~`) + Ad unit Interstitial (`/`) |
| **RevenueCat** | IAP remove-ads | gratis (tier kecil) | Atau pakai Play Billing langsung |
| **Firebase** (opsional) | analytics | gratis | Biar tahu retensi D1/D7 saat launch |

> ⚠️ **Daftar Play Console DULUAN** — verifikasi akun makan waktu & jadi bottleneck.

---

## 2. Build / teknis (gate yang keras)
Tooling di PC: **Node 18+**, **Android Studio + SDK**.

### Capacitor wrapper
- `npm install` → `npx cap add android` → `npx cap sync android`.
- **Project Android di-GENERATE oleh CLI**, bukan lewat wizard "New Project" Android Studio.
- Buka project lewat **`File → Open` → folder `android/`** (bukan wizard).

### Gotcha versi (PENTING)
- **Target & compile SDK WAJIB ≥ 35** (Play tolak API 34 untuk app baru). Set di `variables.gradle`.
- **Capacitor 6 + JDK**: pakai **JDK 17** untuk build, **bukan 21** (RevenueCat/Kotlin error `Unknown Kotlin JVM target: 21`). Android Studio bundle JBR 21 → di dialog Gradle pilih **"Use JVM 17"**, atau set `JAVA_HOME` ke JDK 17 untuk build CLI.
- compileSdk 35 + AGP 8.2.1 → **jalan** (cuma warning); Gradle auto-download platform 35.

### Signing (jangan sampai hilang!)
- Buat **keystore** sekali (`keytool -genkey ...`), **validity ≥ 25 tahun**.
- 🔒 **BACKUP keystore + password** ke cloud/USB. **Hilang = tidak bisa update app SELAMANYA.**
- Build **`.aab`** (Android App Bundle), bukan APK, untuk Play.
- Cara: Android Studio **Build → Generate Signed App Bundle** (password bisa "Remember"),
  ATAU CLI `gradlew bundleRelease` dengan `key.properties` + `signing.gradle`.

### versionCode
- **Naikkan `versionCode` tiap upload** (1→2→3…). "Version code X already used" = belum dinaikkan.

---

## 3. App content & compliance (form legal di Play Console)
Isi semua di **Policy → App content**:
| Form | Jawaban untuk game anak no-login |
|---|---|
| **Privacy policy** | URL publik wajib (host HTML, mis. Vercel `/privacy.html`). Wajib ada **email kontak**. |
| **App access** | "All functionality available without special access" (remove-ads ≠ mengunci konten). |
| **Ads** | "Yes, contains ads". |
| **Content rating** | Questionnaire: semua konten berbahaya = **No** → hasil **Everyone/3+**. Kategori: Educational/Game. |
| **Target audience** | "Ages 5 and under" (+6–8) → **Appeals to children: Yes** → memicu **Designed for Families**. |
| **Teacher Approved program** | **Join** (badge + tab "Kids", gratis, no risk). |
| **Data safety** | Lihat ⬇ |

### Data safety (paling teliti — karena AdMob)
- "Collect/share data?" → **Yes** (AdMob ambil Device ID; under-declare = app disuspend).
- Encrypted in transit → **Yes**. Account creation → **My app doesn't allow account creation**.
- Data type → **HANYA "Device or other IDs"**.
- Ephemeral → No · Required → Yes · Purpose (collected & shared) → **Advertising or marketing** + **Fraud prevention, security, and compliance**.
- Linked to identity → No · Used for tracking → No.
- "Follow Families Policy commitment" → **Yes** (badge).
- ⚠️ **Verifikasi nilai persis di panduan resmi "AdMob Data safety"** (ini pernyataan hukummu).

---

## 4. Monetisasi
### AdMob (child-directed config — wajib untuk Families)
Init dengan flag ini (di `index.html` via plugin Capacitor AdMob):
```js
initialize({ initializeForTesting: ADMOB.testMode, tagForChildDirectedTreatment:true,
             tagForUnderAgeOfConsent:true, maxAdContentRating:'G' });
prepareInterstitial({ adId, isTesting: ADMOB.testMode, npa:true }); // npa = non-personalized
```
- **App ID asli WAJIB di `AndroidManifest`** (`<meta-data ...APPLICATION_ID...>`), kalau tidak → **crash saat buka**.
- `testMode:true` selama internal/closed test (**jangan klik iklan asli sendiri** → akun di-ban).
  `testMode:false` HANYA untuk build production.
- Cadence iklan untuk anak: jangan terlalu sering (3–4 hatch/aksi). Jual **Remove-Ads (non-consumable)**.
- `app-ads.txt` di domain → isi publisher ID (fill rate ↑).

### IAP Remove-Ads
- Play Console → buat produk **non-consumable** `remove_ads`.
- Wire restore + grant (lewat RevenueCat / Play Billing).

---

## 5. Aset store listing (siapkan dari awal)
| Aset | Spek | Catatan |
|---|---|---|
| **App name** | ≤ 30 char | |
| **Short description** | ≤ 80 char | |
| **Full description** | ≤ 4000 char | jujur (jangan klaim "100+" kalau 60) |
| **App icon** | **512×512** PNG | |
| **Feature graphic** | **1024×500** | wajib; bikin dari banner + judul (bukan icon!) |
| **Phone screenshots** | min 2, maks 8 | pakai state **terisi/menarik**, bukan layar kosong |
| **Kategori** | Educational/Game | |

---

## 5b. Cara GENERATE semua aset (in-game + store) ⭐
> Bagian yang sering kelupaan: hampir semua gambar **harus dibuat/generate**, bukan ada otomatis.

**Tool:**
- **Higgsfield MCP** — `generate_image` (model `gpt_image_2`, quality `low` cukup) →
  `remove_background` (transparan, **maks 8 job konkuren**) → download via PowerShell.
- **PowerShell System.Drawing** — resize, bikin thumbnail, composite teks, upscale.
- **ffmpeg** — re-encode audio, (opsi) PNG→WebP.

### In-game art (karakter, telur, background, dekorasi)
- Generate via Higgsfield. **Pakai 1 "anchor" image** sebagai referensi gaya (`medias`) supaya 60+ aset konsisten.
- `remove_background` untuk yang perlu transparan (karakter/dekor/telur).
- Bikin **thumbnail 256px** untuk tampilan kecil (≤120px) → hemat memori & load.
- Wire via peta di code: `IMG` (id→png), `BG`, `EGGIMG`, `DECOIMG`, path thumbnail.
- ⚠️ Jangan kirim aset tak terpakai ke app (§7).

### Store assets — WAJIB dibuat sendiri:
| Aset | Cara buat |
|---|---|
| **App icon 512×512** | Generate art icon (Higgsfield). Simpan juga **1024 source** untuk generator launcher icon. |
| **Feature graphic 1024×500** | AI sering gagal render teks → **generate banner scene TANPA teks** (sisakan ruang langit) lalu **composite judul** pakai System.Drawing (font bold + faux-outline). **Jangan pakai file icon** (→ error "too small"). |
| **Phone screenshots** | **Tangkap dari HP/emulator** saat game **terisi & menarik** (koleksi penuh, home rame) — bukan layar kosong. Min 2, maks 8. |
| **Launcher icon + splash (Android)** | Auto-generate: `npx capacitor-assets generate --android` (butuh `wrapper/assets/icon.png` 1024 + `splash.png` 2732). |

### Audio
- **VO** bisa di-generate (TTS, mis. ElevenLabs "Maya"). **BGM** disediakan sendiri (Suno/Udio).
- Re-encode untuk ukuran (§7): BGM 128k, VO 64k mono.

---

## 6. Alur testing → production (gate waktu!)
1. **Internal testing** — instan, ≤100 tester via email. Buat release → upload `.aab` → publish.
   - Tester install lewat **opt-in link** (Play TIDAK kirim email otomatis). Buka link di HP yang login email tester.
2. **Closed testing** — **WAJIB untuk akun personal baru**: **≥12 tester aktif selama 14 hari berturut-turut** sebelum bisa **Apply for production access**.
   - ⏰ **Mulai secepatnya** — ini bottleneck terbesar. Update build SELAMA periode ini **tidak mereset** 14 hari.
3. **Production** — setelah lolos → submit → review Google (jam–hari) → **LIVE**.
   - Saran: **soft launch 1 negara** dulu, baca retensi 2–4 minggu, baru global.

---

## 7. Gotcha yang kita temui (skip ini di game berikutnya)
- 🐛 **Audio terus main saat app di-background** (WebView) → pasang listener `visibilitychange` +
  Capacitor `App.appStateChange` → pause BGM + suspend AudioContext + cancel speech.
- 📦 **Ukuran file membengkak** karena aset tak terpakai ikut dikirim:
  - Buang **roster/art lama** yang sudah diganti, **trailer** (store-only), **gambar katalog** yang tak di-wire.
  - **Re-encode audio** (ffmpeg): BGM 128k, VO 64k mono → bisa −30–50%.
  - Lanjutan: **PNG → WebP** (ffmpeg) → −25–30% lagi (perlu ubah path `.png`→`.webp`).
  - Batas Play: download per-device ≤ **200MB** (target idealnya jauh di bawah).
- 🔑 **versionCode wajib naik** tiap upload.
- ☕ **JDK 17 bukan 21** untuk Capacitor 6.
- 🎯 **API 35** wajib.
- 🖼️ **Feature graphic ≠ icon** — slot feature minta 1024×500 (icon 512 → "too small").
- 🔒 **Backup keystore** — paling fatal kalau lupa.
- 🌐 **Privacy policy harus URL yang ke-render** (HTML), bukan file `.md` mentah.

---

## 8. Checklist A–Z (urutan eksekusi)
```
[ ] A. Desain compliant: no login/PII, save lokal, child-directed (kalau anak)
[ ] A2. GENERATE semua aset: in-game (anchor style + thumbnail 256px) + store
        (icon 512, feature 1024x500 banner+judul, screenshot terisi) — lihat §5b
[ ] B. Daftar Play Console ($25) — VERIFIKASI DULUAN (1–3 hari)
[ ] C. Daftar AdMob + RevenueCat (+Firebase opsional)
[ ] D. Host privacy policy (HTML, ada email kontak) → catat URL
[ ] E. Setup Capacitor wrapper (Node + Android Studio)
[ ] F. Set compile/target SDK = 35
[ ] G. Isi AdMob App ID (manifest+code) + ad unit + testMode:true
[ ] H. Buat keystore + BACKUP + signing config
[ ] I. Build .aab ter-sign (JDK 17, versionCode 1)
[ ] J. Optimasi ukuran (buang aset mati, re-encode audio, [opsi WebP])
[ ] K. Buat app di Play Console (package name = applicationId, permanen)
[ ] L. Upload ke Internal testing → test di HP via opt-in link
[ ] M. Isi App content: privacy, ads, app access, content rating, target audience, data safety
[ ] N. Store listing: nama, deskripsi, icon 512, feature 1024×500, ≥2 screenshot
[ ] O. Closed testing: countries + 12 tester + upload .aab → review
[ ] P. Tunggu 12 tester × 14 hari → Apply for production access
[ ] Q. Set testMode:false → rebuild .aab (versionCode naik) → upload Production
[ ] R. Submit → review Google → LIVE (soft launch 1 negara dulu)
[ ] S. Pantau crash-free rate + retensi (Firebase) → iterasi
```

---

## 9. Snippet reusable (Capacitor)
- `wrapper/` berisi: `package.json` (deps + script `prepare:android`/`assets`/`build:aab`),
  `copy-web.js` (copy web + inject billing + **exclude aset mati**), `patch-android.js`
  (inject AdMob manifest + signing.gradle + bump SDK 35), `key.properties.example`.
- Build cepat dari nol:
  ```
  cd wrapper && npm install && npm run prepare:android && npm run assets
  # isi key.properties → npm run build:aab  (atau Android Studio wizard)
  ```

---

_Dibuat dari pengalaman rilis Wonder Egg World (Capacitor + AdMob + Families). Update bila ada perubahan kebijakan Play._
