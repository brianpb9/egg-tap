# Egg Tap — CLAUDE.md

Panduan untuk Claude (dan developer) saat bekerja di repo ini.

## Apa ini
**Egg Tap** — game edukasi anak usia 3–6. **English-first** (target global Play Store), Indonesia kedua.
Loop inti: **tap telur → menetas (dramatis) → tantangan belajar (no-fail) → reward → koleksi**.
Prinsip utama: **"game adalah data, bukan kode."** Engine kecil menjalankan konten data; tambah konten = tambah data + aset.

## Bentuk teknis
- **Satu file**: `index.html` — HTML+CSS+JS inline, **tanpa build step**, **offline-first** (localStorage `eggtap_save_v2`).
- Tanpa framework/dependency. Entry = `index.html` (penting untuk Vercel: root menyajikan `index.html`).
- Deploy: static host apa pun (repo `egg-tap` → Vercel auto-deploy on push). `assets/` HARUS ikut.

## Cara menjalankan / menguji
- Buka `index.html` langsung, atau server lokal `http://localhost:8753/index.html`.
- Mesin TIDAK punya Node/Python. Server pakai PowerShell `HttpListener` inline di background (jangan `-ExecutionPolicy Bypass` — diblok). Versi single-thread lebih andal untuk screenshot daripada multi-thread.
- Verifikasi pakai **Chrome MCP**. **Catatan:** di sesi panjang, screenshot CDP sering time-out (`document_idle`) pada layar banyak-gambar — itu keterbatasan harness, bukan bug. Andalkan **assertion via `javascript_tool`** (cek state `S`, `IMG`, jumlah, `read_console_messages` errors) untuk verifikasi.
- Reset progress: 🔒 Zona Orang Tua → reset, atau `localStorage.removeItem('eggtap_save_v2')`.

## Struktur kode di `index.html`
- `DATA` = `worlds, creatures, eggs, dropTables, skills, challenges, decorations, badges, praise, story`.
  - Blok tambahan via IIFE: skill+challenge ekstra (Batch A), generator angka/hitung, **50 varian warna + Rainbow Meadow** (Batch B).
- `I18N` (`id`/`en`), `t(key)` UI, `nm(obj)` objek `{id,en}`. Default locale **`en`**.
- State/Save: `S`, `load()/save()`, `defaultSave()` (termasuk `settings.music`).
- **Audio**: `SFX.*` + `SFX.fanfare(rarity)` (WebAudio); **BGM** loop WebAudio (`startBGM/toggleMusic`); `speak()` Web Speech; `vo(key)/voPraise()` → mp3 VO (`VOICE` id, `VOICE_EN` en; locale lain pakai Web Speech). `haptic(p)` → `navigator.vibrate` (tap/crack/correct).
- **UI kit (SVG, bukan emoji)**: `ICON` = ikon nav (egg/album/home/world), currency (star/coin/dust), lock, music/muted, dipakai di nav + wallet + tombol pojok + goal chip. Album: **frame kartu per-rarity** (`.cardlet.rar-*`, Legendary bersinar). **Tutorial first-run**: pointer `#tapHint` di telur pertama (`S.tutDone`).
- **Render**: `creatureSVG()` (fallback prosedural per `kind`), `eggSVG()`. `creatureMarkup()` pilih gambar AI (`IMG`) bila ada — **ukuran ≤120 pakai thumbnail** `assets/thumbs/`. `eggMarkup()` (`EGGIMG`), `decoMarkup()` (`DECOIMG`). `BG` = background dunia.
- **Loop**: `newEgg → tapEgg → hatch → revealCreature (3-stage: shake→crack→reveal, fanfare per-rarity) → startChallenge → answer/answerSeq → reward → nextEgg`. **Anti-softlock**: `resumeHatch()` (telur selalu tappable saat balik ke Hatch), `finishChallenge()` (jalur jawaban tahan-error, reward selalu tampil), flag `LOOP.resolved` (abaikan tap setelah benar) + `LOOP.answered` (tap layar untuk pulih bila reward gagal muncul).
- **Home** (`renderHome`): item dapat di-geser dengan **grid-snap 24px + clamp**, **z-order by Y** (depth), **ground band** (lantai), hint progres ke level berikut. Background room **berubah art per-level** via `HOMEBG[lvl]` (`assets/home/lv1-5.png`: Kamar→Taman→Playground→Treehouse→Istana).
- **Adaptif 4-tier**: `tierFor()/recordAttempt()` (cap tier 4), `TIER_NAMES` (Beginner..Expert), usia 3/4/5 → T1/T2/T3.
- **Soft-stop** tiap 8 telur, **misi harian** (`MISSIONS`), **telur bonus** stardust, **Home progresif** (`HOME_LEVELS` Lv1–5).
- Arketipe challenge: FIND_ATTRIBUTE, FIND_OBJECT, COUNT, EMOTION, MATCH, MEMORY, SEQUENCE, PATTERN (+observation/odd-one-out via FIND_OBJECT).

## Aset AI (Higgsfield MCP)
- `assets/creatures/*.png` (38), `assets/variants/*.png` (50 varian warna), `assets/eggs/*.png`, `assets/bg/*.png` (6 dunia), `assets/deco/*.png` (8), `assets/audio/*.mp3` (VO id+en), `assets/thumbs/{creatures,variants}/*.png` (256px), `assets/store/{icon.png,trailer.mp4}`.
- Peta di awal `<script>`: **`IMG`** (creatureId→png), **`BG`** (worldId→png), **`DECOIMG`**, **`EGGIMG`**, **`VOICE`/`VOICE_EN`/`PRAISE_VO`/`PROMPTVO`**. Aset ada → dipakai; else fallback SVG/Web Speech. **Tambah aset = tambah baris peta.**
- Pipeline: `nano_banana_pro` (pakai 1 creature "anchor" id `161f37b3-...` sbg referensi gaya agar konsisten) → `remove_background` (transparan, **maks 8 job konkuren**) → download lokal. Thumbnail via PowerShell `System.Drawing`. VO: `text2speech_v2_elevenlabs` (voice "Maya"). **Musik latar TIDAK bisa di-generate standalone** (sonilo_music khusus pipeline game) → pakai sintesis WebAudio.
- Rarity: `common`(grey)/`rare`(blue)/`epic`(purple, alias `magic`)/`legend`(gold) di `RARCOLOR`/`RARLABEL`.

## Status (V3)
- **Batch A** ✅ 4-tier difficulty + 86 challenge + arketipe baru.
- **Batch B** ✅ 50 varian + rarity Epic + Rainbow Meadow + album chase; **88/88 creature ber-art AI**.
- **Batch C** ✅ BGM WebAudio + fanfare per-rarity + Home progresif + English VO + dekorasi AI.
- **Batch D** ✅ thumbnail perf + app icon + trailer (`assets/store/`) + `STORE.md`.
- **V3.1 polish** ✅ UI kit SVG (ganti emoji nav/currency/lock/music/goalchip), frame kartu per-rarity, haptic, tutorial first-run, Home grid/z-order/ground, + perbaikan bug (no-Next soft-lock & "tap setelah benar terhitung salah").
- Bug status: **data & flow integrity = 0 bug** (cek via JS), 1 bug tap-after-correct sudah fix.
- **Home per-level room art** ✅ (`HOMEBG`, 5 background AI) — Interior "dibangun".
- Audit ~**8.7–9.0/10**. Sisa ke 10/10: (1) parallax/ambient background hidup; (2) regresi test + migrasi save + device matrix; (3) animasi karakter (Spine) untuk produksi.

## Konvensi
- UI utama **English** (lewat `t()`/`nm()`). Toddler-UX: 1 aksi/layar, tap ≥64px, no-fail, audio+ikon, tanpa timer/iklan.
- Kepatuhan: tanpa iklan/PII anak/pembelian acak; aksi sensitif di balik gerbang ortu (berbasis kata-angka).
- Creature id: `crt_<world>_<name>`; varian `crt_var_<animal>_<color>`. Aset disimpan nama pendek, dipetakan via `IMG`.

## Catatan kerja
- Edit bertarget (anchor unik), bukan tulis ulang penuh.
- Verifikasi via JS assertion + console bersih sebelum klaim selesai (screenshot harness tidak reliabel).
- Commit per-batch ke `main`; aset besar (png/mp4) ikut di-commit.
