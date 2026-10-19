# Undangan Pernikahan Digital — Diana & Hengki

Website undangan pernikahan digital bergaya **floral klasik premium**: kertas ivory bertekstur,
aksen champagne gold, mawar dusty blue, dan dedaunan olive green. Seluruh ornamen bunga dibuat
sebagai **SVG vektor lokal** (bukan gambar dari server luar), sehingga tampil tajam di semua
perangkat, ringan, dan tetap terlihat rapi walau koneksi lambat.

Website ini benar-benar berjalan — bukan mockup. Semua tombol, tautan, animasi, countdown,
lightbox, pemutar musik, dan penyimpanan RSVP berfungsi.

---

## Daftar isi

1. [Fitur](#1-fitur)
2. [Teknologi](#2-teknologi)
3. [Menjalankan project](#3-menjalankan-project)
4. [Struktur proyek](#4-struktur-proyek)
5. [Mengubah data undangan](#5-mengubah-data-undangan)
6. [Mengirim undangan ke tamu (?to=)](#6-mengirim-undangan-ke-tamu-to)
7. [RSVP & ucapan: mode demo vs Supabase](#7-rsvp--ucapan-mode-demo-vs-supabase)
8. [Daftar aset yang harus diganti](#8-daftar-aset-yang-harus-diganti)
9. [Musik latar](#9-musik-latar)
10. [Pemeriksaan kualitas otomatis](#10-pemeriksaan-kualitas-otomatis)
11. [Deploy](#11-deploy)
12. [Aksesibilitas & performa](#12-aksesibilitas--performa)
13. [Pemecahan masalah](#13-pemecahan-masalah)

---

## 1. Fitur

**Halaman pembuka (cover)**

- Ornamen floral muncul perlahan, inisial pengantin scale-up, jabat tangan emas tergambar bertahap
  (animasi `pathLength`), nama pengantin fade-up.
- Nama tamu otomatis dari parameter URL `?to=Nama+Tamu`.
- Parallax ringan mengikuti gerakan pointer (otomatis nonaktif pada perangkat sentuh).
- Tombol **Buka Undangan** dengan efek kilau, transisi "amplop terbuka", lalu musik latar dimulai
  (hanya setelah interaksi pengguna).
- QR code undangan (dibuat di browser, library dimuat secara lazy).

**Navigasi**

- Desktop: navigasi pill mengambang yang muncul setelah melewati cover, dengan indikator aktif
  yang bergeser halus dan garis progres baca emas di atas layar.
- Mobile: bottom navigation dengan 5 menu utama + tombol **Lainnya** (bottom sheet berisi seluruh
  menu & tombol salin tautan). Memperhatikan `safe-area-inset-bottom` (home indicator iOS).

**Bagian undangan**

| Bagian | Isi |
| --- | --- |
| Home | Sambutan hangat berisi nama tamu + tombol *Simpan Tanggal* |
| Quotes | Ayat/kutipan dengan animasi stagger + kutipan romantis pendamping |
| Mempelai | Profil simetris kedua mempelai dengan bingkai foto oval emas |
| Acara | Countdown akurat, kartu Akad & Resepsi, dress code |
| Maps | Peta Google tersemat (tanpa API key) + tombol *Buka di Google Maps* |
| Gallery | Masonry 9 foto, lightbox dengan keyboard & swipe |
| RSVP | Formulir konfirmasi kehadiran + daftar ucapan terbaru |
| Gift | Rekening + tombol salin + notifikasi "berhasil disalin" + alamat kado |
| Penutup | Ucapan terima kasih, nama keluarga, kembali ke atas |

**Detail yang berfungsi nyata**

- Countdown dihitung dari ISO 8601 + offset zona waktu, akurat dan tidak "melenceng"; menampilkan
  pesan khusus bila acara sudah berlangsung atau tanggal belum diatur.
- Tombol kalender menghasilkan tautan Google Calendar **dan** berkas `.ics` (Apple/Outlook).
- Peta memakai `output=embed` Google Maps sehingga tidak butuh API key.
- Lightbox: tombol, keyboard (←/→/Esc), swipe di ponsel, fokus keyboard terkendali.
- Salin rekening/alamat dengan fallback `document.execCommand` untuk browser non-HTTPS.
- Semua animasi menghormati `prefers-reduced-motion`.

---

## 2. Teknologi

| Kebutuhan | Pilihan |
| --- | --- |
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 (`@theme` tokens, `@utility` kustom) |
| Animasi | Framer Motion (Motion for React) |
| Ikon | Lucide React |
| QR code | `qrcode` (dimuat dinamis) |
| Backend (opsional) | Supabase (Postgres + RLS + Realtime) |
| Font | Cormorant Garamond, Playfair Display, Lato, Great Vibes (Google Fonts) |

> **React Router tidak dipakai** karena undangan ini satu halaman berisi banyak bagian
> (scroll antar-section), bukan multi-halaman. Menambahkan router hanya akan menambah berat
> bundel tanpa manfaat.
>
> **React Icons tidak dipakai** karena seluruh kebutuhan ikon sudah tercakup Lucide React.

---

## 3. Menjalankan project

Prasyarat: **Node.js 20+** dan npm.

```bash
# 1. Instal dependensi
npm install

# 2. Buat berkas aset placeholder (foto, musik, og-image)
npm run assets

# 3. Jalankan server pengembangan
npm run dev          # http://localhost:5173

# 4. Build untuk produksi
npm run build        # hasil ada di folder dist/
npm run preview      # uji hasil build di http://localhost:4173
```

Perintah lain:

```bash
npm run smoke        # render SSR + pemeriksaan data, tautan, validasi & aset
npm run assets       # buat ulang semua aset placeholder
```

> `npm run assets` **menimpa** berkas di `public/images`, `public/audio`, dan `public/og-image.png`.
> Jangan dijalankan setelah Anda mengganti aset dengan foto asli.

---

## 4. Struktur proyek

```
undangan/
├─ index.html                      # meta SEO, Open Graph, favicon, splash awal
├─ vite.config.js
├─ vite.smoke.config.js            # konfigurasi khusus npm run smoke
├─ .env.example                    # contoh kredensial Supabase
├─ supabase/
│  └─ schema.sql                   # tabel, validasi server, RLS, realtime
├─ scripts/
│  ├─ generate-placeholder-assets.mjs   # generator foto/musik/og-image
│  └─ smoke-render.jsx             # pemeriksaan otomatis tanpa browser
├─ public/
│  ├─ favicon.svg, manifest.webmanifest, og-image.png
│  ├─ audio/wedding-bgm.wav
│  └─ images/couple/*.svg, images/gallery/*.svg
└─ src/
   ├─ main.jsx                     # entry React
   ├─ App.jsx                      # susunan seluruh bagian + state cover & musik
   ├─ index.css                    # token warna/tipografi, animasi, utility kustom
   ├─ data/weddingConfig.js        # ★ SATU FILE UNTUK SEMUA DATA UNDANGAN
   ├─ hooks/
   │  ├─ useCountdown.js           # hitung mundur akurat
   │  ├─ useMusicPlayer.js         # pemutar musik (aman autoplay)
   │  ├─ useActiveSection.js       # scroll-spy menu aktif
   │  ├─ useGuestName.js           # nama tamu dari ?to=
   │  └─ useScrollLock.js          # kunci scroll (cover & lightbox)
   ├─ lib/
   │  ├─ utils.js                  # format tanggal, Maps, kalender .ics, clipboard
   │  └─ validation.js             # aturan validasi + normalisasi data ucapan
   ├─ services/
   │  ├─ rsvpService.js            # ★ satu pintu masuk data RSVP (demo/Supabase)
   │  └─ supabaseClient.js         # klien Supabase (lazy, opsional)
   ├─ components/
   │  ├─ WeddingCover.jsx          # halaman pembuka + transisi amplop + QR
   │  ├─ BottomNavigation.jsx      # navigasi bawah mobile + sheet "Lainnya"
   │  ├─ DesktopNavigation.jsx     # navigasi pill desktop
   │  ├─ ScrollProgress.jsx        # garis progres baca
   │  ├─ MusicPlayer.jsx           # tombol & panel musik
   │  ├─ Countdown.jsx             # kartu hitung mundur
   │  ├─ EventCard.jsx             # kartu Akad / Resepsi
   │  ├─ GalleryGrid.jsx           # masonry foto
   │  ├─ GalleryLightbox.jsx       # lightbox layar penuh
   │  ├─ RSVPForm.jsx              # formulir konfirmasi kehadiran
   │  ├─ WishesList.jsx            # daftar ucapan tamu
   │  ├─ GiftSection.jsx           # rekening, salin, alamat kado
   │  ├─ FloralDecoration.jsx      # ★ seluruh ornamen bunga SVG
   │  ├─ Monogram.jsx              # inisial dalam lingkaran emas
   │  ├─ SectionShell.jsx          # kerangka section
   │  ├─ SectionHeading.jsx        # judul + ornamen
   │  ├─ Motion.jsx                # Reveal / Stagger / Press + easing
   │  ├─ Button.jsx                # tombol seragam (gold/outline/ivory/dusty)
   │  ├─ CopyField.jsx             # baris data + tombol salin
   │  ├─ QrCard.jsx                # QR code
   │  ├─ Toast.jsx                 # notifikasi
   │  ├─ Icon.jsx                  # peta nama ikon → Lucide
   │  ├─ ErrorBoundary.jsx         # fallback bila terjadi kesalahan
   │  └─ Footer.jsx                # penutup undangan
   └─ sections/
      ├─ HomeSection.jsx
      ├─ QuoteSection.jsx
      ├─ CoupleSection.jsx
      ├─ EventSection.jsx          # termasuk blok #maps
      ├─ GallerySection.jsx
      └─ RSVPSection.jsx
```

---

## 5. Mengubah data undangan

Hampir semua hal diatur dari **satu berkas**: [`src/data/weddingConfig.js`](src/data/weddingConfig.js).
Cari komentar bertanda `>> GANTI`.

| Bagian | Yang diatur |
| --- | --- |
| `meta` | Judul, deskripsi, domain (`siteUrl`), hashtag, nama tamu default, zona waktu |
| `couple` | Nama lengkap & panggilan, inisial, foto, nama orang tua, Instagram |
| `cover` | Teks "The Wedding Of", label penerima, tombol, catatan |
| `quote` | Kutipan/ayat + referensi + kutipan romantis |
| `event` | Tanggal ISO, batas RSVP, Akad & Resepsi, koordinat, alamat, dress code |
| `gallery` | 9 foto + alt text + rasio |
| `gift` | Rekening, alamat kado, konfirmasi WhatsApp |
| `music` | Berkas musik, judul, artis, volume |
| `rsvp` | Batas tamu, panjang teks, mode penyimpanan, pesan sukses |
| `navigation` | Urutan section & label menu |
| `closing` | Ucapan penutup & nama keluarga |

**Contoh mengubah tanggal acara** (dipakai countdown, kalender, dan peta):

```js
event: {
  dateISO: '2027-06-12T08:00:00+07:00',  // akad, pukul 08.00 WIB
  rsvpDeadlineISO: '2027-05-30T23:59:00+07:00',
  dateLabel: 'Sabtu, 12 Juni 2027',
  ...
}
```

Format wajib **ISO 8601 + offset zona waktu**. `+07:00` untuk WIB, `+08:00` untuk WITA,
`+09:00` untuk WIT.

**Warna tema** juga terpusat di `src/index.css` pada blok `@theme`. Mengubah satu variabel
(mis. `--color-dusty`) langsung mengubah seluruh nuansa website.

```css
@theme {
  --color-ivory: #f7f5ef;
  --color-champagne: #b9955b;
  --color-dusty: #7188a5;
  --color-olive: #77785f;
  --color-cocoa: #5b5044;
}
```

---

## 6. Mengirim undangan ke tamu (?to=)

Tambahkan parameter `to` pada tautan undangan. Nama tersebut otomatis tampil di cover,
sambutan Home, dan terisi di formulir RSVP.

```
https://undangan-diana-hengki.example.com/?to=Bapak%20Andi%20Pratama
https://undangan-diana-hengki.example.com/?to=Keluarga+Besar+Hartono
https://undangan-diana-hengki.example.com/?to=Ibu+Sri+%26+Keluarga
```

Tips:

- Gunakan `%20` atau `+` untuk spasi. Karakter `&` harus ditulis `%26`.
- Bila parameter kosong, nama yang dipakai adalah `meta.defaultGuest` ("Tamu Undangan").
- Nama disanitasi otomatis (maksimal 80 karakter, karakter `<` dan `>` dibuang).

---

## 7. RSVP & ucapan: mode demo vs Supabase

Seluruh akses data melewati **satu pintu**: `src/services/rsvpService.js`, sehingga mudah
diganti tanpa menyentuh komponen.

### Mode Demo (bawaan — tanpa backend)

Undangan tetap berfungsi penuh:

- Ucapan & konfirmasi disimpan di **localStorage** browser tamu (`undangan:rsvp:wishes:v1`).
- Daftar terisi 3 ucapan **contoh** yang diberi label "Contoh" — jelas, bukan data palsu
  yang menyamar sebagai ucapan nyata.
- UI menampilkan banner **"Mode Demo Aktif"** yang menjelaskan bahwa ucapan tidak terlihat
  tamu lain, beserta cara mengaktifkan Supabase.
- Pembatasan pengiriman 10 detik (simulasi pembatas spam server).

Mode demo berguna untuk uji coba tampilan, tetapi **tidak** untuk undangan yang disebar.

### Mode Supabase (disarankan untuk undangan sungguhan)

1. Buat project gratis di [supabase.com](https://supabase.com).
2. Buka **SQL Editor → New query**, tempel isi [`supabase/schema.sql`](supabase/schema.sql),
   lalu **Run**. Skrip ini idempotent (aman dijalankan ulang) dan menyiapkan:
   - tabel `rsvp_wishes` + index,
   - **CHECK constraint** sebagai validasi sisi server (panjang nama/ucapan, daftar kehadiran,
     rentang jumlah tamu, konsistensi jumlah tamu),
   - trigger `rsvp_wishes_before_insert` yang membersihkan karakter kontrol dan **membatasi
     3 kiriman per 60 detik per klien** (hash IP + User-Agent, `created_at` selalu dari server
     sehingga tidak bisa dipalsukan),
   - **Row Level Security**: anon hanya boleh `SELECT` dan `INSERT` (tanpa `UPDATE`/`DELETE`),
   - Realtime untuk tabel + view ringkasan `rsvp_summary`.
3. Salin kredensial dari **Project Settings → API**:

   ```bash
   cp .env.example .env
   ```

   ```dotenv
   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   VITE_SITE_URL=https://undangan-diana-hengki.example.com
   ```

4. Jalankan ulang `npm run dev`. Banner otomatis berubah menjadi
   **"Terhubung ke Supabase"** dan ucapan tersimpan online.

Catatan keamanan:

- `anon key` **memang** boleh dipublikasikan; yang melindungi data adalah RLS. Jangan pernah
  menaruh `service_role key` di frontend.
- Validasi dijalankan berlapis: `RSVPForm` (UX) → `rsvpService` → constraint & trigger database.
- Butuh pembatas berbasis IP yang lebih ketat? Tambahkan Cloudflare Turnstile dan verifikasi
  token di Supabase Edge Function.

### Mengganti backend

`rsvpService.js` mengekspor `fetchWishes`, `submitWish`, `countWishes`, `subscribeWishes`, dan
`summarizeWishes`, semuanya mengembalikan `{ data, error }`. Untuk memakai Firebase atau API
lain, cukup tulis implementasi baru dengan kontrak yang sama — komponen tidak perlu diubah.

---

## 8. Daftar aset yang harus diganti

Semua aset bawaan adalah **placeholder** buatan sendiri (bebas lisensi) dan harus diganti
dengan aset asli pasangan.

| Berkas | Ukuran disarankan | Keterangan |
| --- | --- | --- |
| `public/images/couple/bride.svg` | 900 × 1125 (4:5) | Foto mempelai wanita → ganti dengan `.jpg`/`.webp`, lalu ubah `couple.bride.photo` |
| `public/images/couple/groom.svg` | 900 × 1125 (4:5) | Foto mempelai pria |
| `public/images/gallery/gallery-01…09.svg` | lihat tabel rasio di bawah | Sembilan foto prewedding (jangan pakai foto yang sama) |
| `public/audio/wedding-bgm.wav` | ≤ 5 MB, `.mp3` lebih baik | Musik latar → ubah `music.src` |
| `public/og-image.png` | **1200 × 630** | Pratinjau tautan WhatsApp/Facebook |
| `public/favicon.svg` | 64 × 64 (atau `.png` 512 × 512) | Ikon tab browser |

Rasio foto galeri (agar layout masonry tetap rapi — `GalleryGrid` menulis `width`/`height`
intrinsik untuk mencegah layout shift):

| Berkas | Rasio | Ukuran |
| --- | --- | --- |
| gallery-01, 04, 07, 09 | potret 3:4 | 900 × 1200 |
| gallery-02, 05, 08 | lanskap 4:3 | 1200 × 900 |
| gallery-03, 06 | kotak | 1000 × 1000 |

Tips mengganti foto:

1. Letakkan berkas asli di `public/images/...` (nama boleh berbeda, cukup sesuaikan di
   `weddingConfig.js`).
2. Gunakan `.webp` atau `.jpg` terkompresi (target < 300 KB per foto) agar cepat di ponsel.
3. Perbarui `alt` setiap foto — dipakai pembaca layar dan baik untuk SEO.
4. Perbarui `meta.description`, `og:image`, dan `apple-touch-icon` di `index.html` bila perlu.

> Setelah mengganti aset, **jangan** menjalankan `npm run assets` lagi karena akan menimpanya.

---

## 9. Musik latar

- Berkas bawaan `public/audio/wedding-bgm.wav` adalah **musik placeholder hasil sintesis**
  (musik kot, 28 detik, bebas lisensi). Ganti dengan lagu pilihan Anda:

  ```js
  music: {
    src: '/audio/lagu-kita.mp3',
    title: 'A Thousand Years',
    artist: 'Christina Perri',
    volume: 0.45,
  }
  ```

- Musik **tidak** pernah autoplay. Pemutaran dimulai dari dalam event handler klik tombol
  "Buka Undangan", sesuai kebijakan browser.
- Bila berkas hilang atau diblokir browser, pemutar menampilkan pesan yang jelas
  ("Musik tidak dapat diputar…") dan website tetap berjalan normal — tidak ada error di console.
- Tombol musik tersedia mengapung di kanan atas (48 × 48 px, nyaman disentuh) dengan panel
  volume dan tombol bisu.
- Gunakan lagu yang Anda miliki haknya. Menyematkan lagu komersial tanpa izin dapat melanggar
  hak cipta.

---

## 10. Pemeriksaan kualitas otomatis

```bash
npm run smoke
```

Perintah ini merender seluruh pohon komponen dengan React SSR lalu memeriksa:

1. Halaman dapat dirender tanpa kesalahan.
2. Semua section (`home`, `quote`, `couple`, `event`, `maps`, `gallery`, `rsvp`, `gift`) ada.
3. Tautan Google Maps, peta tersemat, dan tautan kalender benar-benar terbentuk.
4. Tanggal acara valid dan masih di masa depan.
5. Validasi formulir RSVP menolak data kosong & jumlah tamu berlebih, dan menerima data sah.
6. Semua aset (foto, musik, favicon, og-image) ada dan tidak kosong; header WAV valid,
   durasi wajar, dan audio tidak senyap; berkas SVG dapat diparse.

Jalankan sebelum men-deploy undangan.

---

## 11. Deploy

Hasil `npm run build` adalah berkas statis di `dist/`.

**Vercel**

```bash
npm i -g vercel
vercel            # framework: Vite, build: npm run build, output: dist
```

**Netlify**

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

**Hosting statis lain (cPanel, GitHub Pages, Cloudflare Pages)**

Unggah seluruh isi `dist/`. Bila diletakkan di subfolder (mis. `/undangan/`), tambahkan
`base: '/undangan/'` pada `vite.config.js` **sebelum** build.

Tambahkan berkas `vercel.json` bila ingin semua URL diarahkan ke `index.html`:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Penting untuk pratinjau WhatsApp:** meta Open Graph di `index.html` bersifat statis karena
crawler WhatsApp **tidak** menjalankan JavaScript. Perbarui `og:title`, `og:description`,
`og:url`, dan `og:image` dengan domain final Anda, lalu unggah `og-image.png` (1200 × 630).
Uji dengan [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).

---

## 12. Aksesibilitas & performa

**Aksesibilitas**

- HTML semantik (`header`/`main`/`section`/`article`/`footer`), setiap section punya
  `aria-labelledby`.
- Selama cover terbuka, konten utama diberi `inert` + `aria-hidden` sehingga tidak bisa
  difokus keyboard maupun dibaca pembaca layar.
- Semua input memiliki `<label>`; pesan galat memakai `role="alert"`/`aria-live`;
  grup radio memakai `<fieldset>`/`<legend>` dengan `peer-focus-visible` yang terlihat.
- Lightbox: fokus dipindahkan ke dialog, jebakan Tab, tombol Esc/←/→, dan fokus dikembalikan
  ke elemen pemicu saat ditutup.
- Target sentuh minimal 44 × 44 px; navigasi memakai `aria-current`.
- Kontras teks dijaga (cocoa `#5B5044` di atas ivory `#F7F5EF` ≈ 8:1).

**Performa**

- Ornamen floral adalah SVG inline tanpa permintaan jaringan.
- Font Google dimuat dengan `preconnect` + `display=swap`.
- `lazy loading` + `decoding="async"` pada semua foto, `width`/`height` intrinsik untuk
  mencegah layout shift.
- Library berat (`@supabase/supabase-js`, `qrcode`) dimuat **dinamis** — hanya saat dibutuhkan.
- Layout masonry memakai CSS multi-column (tanpa library masonry).
- Scroll-spy memakai satu listener passive + `requestAnimationFrame`.
- `prefers-reduced-motion` dihormati: animasi dimatikan, scroll menjadi instan, kelopak
  melayang tidak dirender.
- Splash awal pada `index.html` mencegah layar putih sebelum JavaScript siap, dan ada
  `ErrorBoundary` yang menampilkan informasi acara inti bila terjadi kesalahan.

**Kompatibilitas:** Chrome, Safari, Firefox, Edge versi modern (desktop & mobile). Mendukung
`dvh/svh`, `env(safe-area-inset-*)`, dan `inert`.

---

## 13. Pemecahan masalah

| Gejala | Penyebab & solusi |
| --- | --- |
| Musik tidak berbunyi | Browser memblokir autoplay — tekan tombol musik di kanan atas. Pastikan berkas ada di `public/audio/` dan `music.src` benar. |
| Ucapan tidak muncul di perangkat tamu lain | Masih **mode demo**. Isi `.env` dengan kredensial Supabase dan jalankan `supabase/schema.sql`. |
| Banner masih "Mode Demo Aktif" padahal `.env` sudah diisi | Variabel Vite harus bernama `VITE_` dan server perlu dijalankan ulang (`npm run dev`). |
| Peta kosong | Berisi koordinat yang belum diisi. Lengkapi `lat`/`lng` pada `weddingConfig.event`, atau akan dipakai alamat sebagai kata kunci. |
| `npm run smoke` gagal di bagian "Tanggal acara masih di masa depan" | Perbarui `event.dateISO` dengan tanggal baru. |
| Foto tidak berubah setelah diganti | Nama berkas berbeda dari konfigurasi, atau jalankan `npm run assets` yang menimpa aset. |
| Tampilan gepeng di beberapa bagian | Pastikan Tailwind v4 terpasang (`@tailwindcss/vite`) dan kelas kustom pada `src/index.css` tidak diubah namanya. |
| Ingin menyembunyikan bagian Gift | Setel `gift.enabled: false` pada `weddingConfig.js`. |
| Ingin menyembunyikan alamat kado | Setel `gift.address.enabled: false`. |
| Ingin menyembunyikan tombol konfirmasi WhatsApp | Setel `gift.confirmWhatsapp: null`. |

---

Undangan ini dibuat dengan struktur modular: setiap bagian dapat diganti, dikembangkan, atau
dimatikan tanpa merusak bagian lain. Selamat menyambut hari bahagia Anda.
