# Egg Tap — CLAUDE.md

Panduan untuk Claude (dan developer) saat bekerja di repo ini.

## Apa ini
**Egg Tap** — prototipe game edukasi anak usia 3–5 (Bahasa Indonesia first, English second).
Loop inti: **tap telur → menetas → tantangan belajar (no-fail) → reward → koleksi**.
Dibangun dari `EGG_TAP_MASTER_BIBLE` (lihat `/docs` jika ada) sebagai **vertical slice** yang bisa dimainkan.

Prinsip utama: **"game adalah data, bukan kode."** Engine kecil menjalankan konten yang
didefinisikan sebagai data. Tambah konten = tambah data + aset, tanpa ubah logika.

## Bentuk teknis
- **Satu file**: `eggtap.html` — HTML + CSS + JS inline, **tanpa build step**, **offline-first** (localStorage, key `eggtap_save_v2`).
- Tidak ada framework, tidak ada dependency. Buka langsung di browser.
- Target akhir (per Bible) adalah Unity+Spine; file ini adalah prototipe web untuk membuktikan loop & feel.

## Cara menjalankan / menguji
- **Paling gampang:** buka `eggtap.html` di browser (double-click).
- **Disarankan saat dev:** jalankan server lokal lalu buka `http://localhost:8753/eggtap.html`.
  Mesin ini TIDAK punya Node/Python. Server pakai PowerShell `HttpListener`
  (jangan pakai `-ExecutionPolicy Bypass` — diblok sandbox). Jalankan listener inline di background.
- Verifikasi visual/bug pakai **Chrome MCP** (`mcp__Claude_in_Chrome__*`): navigate ke localhost,
  `read_console_messages`, `javascript_tool`, `computer screenshot`. `file://` ditolak tool navigate.
- Reset progress: tombol 🔒 (Zona Orang Tua) → "Mulai Ulang Data", atau `localStorage.removeItem('eggtap_save_v2')`.

## Struktur kode di `eggtap.html`
- `DATA` = sumber konten: `worlds, creatures, eggs, dropTables, skills, challenges, decorations, badges, praise, story`.
- `I18N` = string UI (`id`/`en`). `t(key)` untuk UI, `nm(obj)` untuk objek `{id,en}`.
- **State/Save**: `S` (objek save), `load()/save()`, default di `defaultSave()`.
- **Audio**: `SFX.*` (WebAudio sintesis), `speak()` (Web Speech fallback), `vo(key)/voPraise()` (mp3 VO Higgsfield).
- **Render karakter/telur**: `creatureSVG()` (fallback prosedural per `kind`), `eggSVG()`.
  `creatureMarkup()/eggMarkup()` memilih **gambar AI** bila ada, else SVG.
- **Loop**: `newEgg → tapEgg → hatch → startChallenge → answer/answerSeq → reward → nextEgg`.
- **Adaptif**: `tierFor()/recordAttempt()` (success-rate 5 percobaan terakhir, naik/turun tier).
- Layar: `show(id)` + `renderNav/renderAlbum/renderHome/renderWorld/renderParent`.

## Aset AI (Higgsfield MCP)
- Lokasi: `assets/creatures/*.png` (38, transparan), `assets/eggs/*.png` (5), `assets/bg/*.png` (5 background dunia), `assets/audio/*.mp3` (VO Bahasa Indonesia, suara "Maya"/ElevenLabs).
- Dipetakan ke data lewat **`IMG` (creatureId→file)**, **`BG` (worldId→file)**, **`VOICE`/`PRAISE_VO`/`PROMPTVO`** di awal `<script>`.
- Aturan: kalau aset ada → dipakai; kalau tidak → fallback SVG/Web Speech. **Tambah aset = tambah baris di peta ini.**
- Pipeline: `nano_banana_pro` (gambar, pakai 1 creature "jangkar" sbg referensi gaya agar konsisten) → `remove_background` (transparan) → download lokal. VO: `text2speech_v2_elevenlabs`.
- **Penting:** `assets/` HARUS ikut di samping `eggtap.html` agar gambar/suara termuat.

## Konvensi
- Bahasa UI utama: **Indonesia**. Semua teks pemain lewat `t()`/`nm()` (siap lokalisasi).
- Toddler-UX: 1 aksi utama/layar, tap target ≥64px, no-fail, audio+ikon (teks minimal), tanpa timer/iklan.
- Kepatuhan: tanpa iklan, tanpa PII anak, tanpa pembelian acak; pembelian (jika ada) di balik gerbang ortu.
- Creature id: `crt_<world>_<name>`. Gambar disimpan dgn nama pendek (mis. `bunny.png`) dan dipetakan via `IMG`.

## Status & roadmap (per audit QA terakhir)
- **Quick wins:** SELESAI (fix COUNT overflow, gerbang ortu pakai kata, kontras cue, goal chip, label rarity lokal, lazy-load, avatar AI, redesign onboarding hero, reward duplikat, guard VO autoplay).
- **Berikutnya (Medium):** soft-stop sesi, misi harian, sink stardust, thumbnail aset (perf low-end), safe-area/orientation, perlambat MEMORY + angka urutan SEQUENCE.
- **Big:** Home progresif + dekorasi ber-art AI (ganti emoji), animasi karakter (Spine), musik latar, IAP/cloud save.
- Publish readiness: ⚠️ menuju soft-launch (dua blocker — COUNT & gerbang ortu — sudah diperbaiki).

## Catatan kerja
- File besar satu berkas: gunakan edit bertarget (anchor unik), bukan tulis ulang penuh kecuali perlu.
- Selalu verifikasi perubahan di Chrome (console bersih + screenshot) sebelum menyatakan selesai.
- Hindari mem+ emoji decorations yang bentrok gaya dengan aset AI (temuan audit visual).
