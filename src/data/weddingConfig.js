/* ============================================================================
 *  weddingConfig.js — SATU-SATUNYA FILE YANG PERLU ANDA UBAH
 * ----------------------------------------------------------------------------
 *  Semua teks, tanggal, foto, rekening, dan musik undangan diatur dari sini.
 *  Cari komentar bertanda ">> GANTI" untuk mengetahui bagian yang wajib
 *  diganti dengan data asli pasangan.
 * ========================================================================== */

export const weddingConfig = {
  /* ------------------------------------------------------------------
   * 1. META / INFORMASI UMUM
   * ------------------------------------------------------------------ */
  meta: {
    // >> GANTI: dipakai untuk judul dokumen, tombol share, dan QR code.
    title: 'Diana & Hengki — Undangan Pernikahan',
    shortTitle: 'Diana & Hengki',
    description:
      'Undangan pernikahan Diana & Hengki — Sabtu, 14 November 2026. Kami mengundang Anda untuk berbagi kebahagiaan di hari istimewa kami.',
    // >> GANTI: domain final website. Dipakai untuk link share & QR code.
    siteUrl: import.meta.env.VITE_SITE_URL || 'https://undangan-diana-hengki.example.com',
    hashtag: '#DianaHengkiForever',
    // >> GANTI: nama default bila tamu membuka tautan tanpa parameter ?to=
    defaultGuest: 'Tamu Undangan',
    // >> GANTI: bahasa untuk format tanggal (locale Intl)
    locale: 'id-ID',
    // >> GANTI: zona waktu acara (dipakai untuk semua perhitungan waktu)
    timeZone: 'Asia/Jakarta',
    timeZoneLabel: 'WIB',
  },

  /* ------------------------------------------------------------------
   * 2. CALON PENGANTIN
   * ------------------------------------------------------------------ */
  couple: {
    bride: {
      // >> GANTI: data mempelai wanita
      fullName: 'Diana Kartika Sari, S.E.',
      nickname: 'Diana',
      initials: 'D',
      // >> GANTI: foto (rasio potret 4:5, minimal 800x1000px)
      photo: '/images/couple/bride.svg',
      childOrder: 'Putri kedua dari',
      father: 'Bapak H. Suryana Wijaya',
      mother: 'Ibu Hj. Ratna Dewi',
      // >> GANTI: username tanpa tanda @
      instagram: 'dianakartika',
    },
    groom: {
      // >> GANTI: data mempelai pria
      fullName: 'Hengki Prasetya Nugraha, S.T.',
      nickname: 'Hengki',
      initials: 'H',
      // >> GANTI: foto (rasio potret 4:5, minimal 800x1000px)
      photo: '/images/couple/groom.svg',
      childOrder: 'Putra pertama dari',
      father: 'Bapak Ir. Bambang Prasetya',
      mother: 'Ibu Sri Wahyuni',
      // >> GANTI: username tanpa tanda @
      instagram: 'hengkiprasetya',
    },
  },

  // Teks pembuka pada halaman cover
  cover: {
    eyebrow: 'The Wedding Of',
    inviteToLabel: 'Kepada Yth. Bapak/Ibu/Saudara/i',
    openButtonLabel: 'Buka Undangan',
    hint: 'Mohon maaf apabila ada kesalahan penulisan nama atau gelar.',
  },

  /* ------------------------------------------------------------------
   * 3. QUOTES & AYAT PERNIKAHAN
   *     >> GANTI dengan kutipan pilihan Anda. Semua baris boleh diubah.
   * ------------------------------------------------------------------ */
  quote: {
    title: 'Our Love Story',
    subtitle: 'Sebuah perjalanan yang dipertemukan oleh waktu',
    // Setiap item = satu baris kalimat (muncul dengan animasi stagger)
    lines: [
      'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri',
      'supaya kamu dapat ketenangan hati dan menjadikan kasih sayang di antara kamu.',
      'Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berfikir.',
    ],
    // >> GANTI referensi kutipan/ayat sesuai keyakinan Anda.
    source: {
      text: 'Ar-Rum: 21',
      label: 'Al-Qur’an',
    },
    // >> GANTI kutipan roman tambahan (boleh dikosongkan menjadi null)
    romanticQuote: {
      lines: [
        'Cinta bukan tentang menemukan seseorang yang sempurna,',
        'tetapi tentang belajar mencintai seseorang dengan sepenuh hati.',
      ],
      source: 'Diana & Hengki, 2026',
    },
  },

  /* ------------------------------------------------------------------
   * 4. ACARA PERNIKAHAN
   *     PENTING: format tanggal memakai ISO 8601 beserta offset zona waktu.
   *     Contoh: '2026-11-14T08:00:00+07:00' (pukul 08.00 WIB).
   *     Perhitungan countdown & tautan kalender mengikuti nilai ini.
   * ------------------------------------------------------------------ */
  event: {
    // >> GANTI: tanggal & waktu utama (dasar countdown)
    dateISO: '2026-11-14T08:00:00+07:00',
    // >> GANTI: batas akhir konfirmasi kehadiran
    rsvpDeadlineISO: '2026-11-01T23:59:00+07:00',
    // >> GANTI: teks tanggal yang tampil di halaman (boleh ditulis puitis)
    dateLabel: 'Sabtu, 14 November 2026',
    timeZoneLabel: 'WIB (GMT+7)',

    akad: {
      title: 'Akad Nikah',
      icon: 'rings',
      dateLabel: 'Sabtu, 14 November 2026',
      timeStart: '08.00',
      timeEnd: '10.00',
      timezone: 'WIB',
      venue: 'Masjid Agung Al-Falah',
      address:
        'Jl. Merdeka No. 24, Kel. Sukamaju, Kec. Cilandak, Jakarta Selatan, DKI Jakarta 12430',
      // >> GANTI: koordinat asli lokasi (buka Google Maps → klik kanan → salin koordinat)
      lat: -6.288512,
      lng: 106.797247,
      // Boleh dibiarkan null → tautan otomatis dibuat dari koordinat
      mapsUrl: null,
      // Warna umpan visual pada kalender
      calendarLocation: 'Masjid Agung Al-Falah, Jakarta Selatan',
    },

    resepsi: {
      title: 'Resepsi',
      icon: 'party',
      dateLabel: 'Sabtu, 14 November 2026',
      timeStart: '11.00',
      timeEnd: '14.00',
      timezone: 'WIB',
      venue: 'Balai Kartini — Nusa Indah Ballroom',
      address:
        'Jl. Gatot Subroto Kav. 37, Kuningan Timur, Setiabudi, Jakarta Selatan, DKI Jakarta 12950',
      // >> GANTI: koordinat asli lokasi resepsi
      lat: -6.239632,
      lng: 106.828518,
      mapsUrl: null,
      calendarLocation: 'Balai Kartini, Jakarta Selatan',
    },

    // Teks pengantar pada bagian acara
    intro:
      'Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan resepsi pernikahan putra-putri kami.',
    dressCode: {
      label: 'Dress Code',
      // >> GANTI palet dress code bila perlu
      colors: ['#B9955B', '#7188A5', '#77785F', '#5B5044', '#F7F5EF'],
      note: 'Mohon kenakan pakaian dengan nuansa warna di atas agar foto kita senada.',
    },
  },

  /* ------------------------------------------------------------------
   * 5. GALERI FOTO PREWEDDING
   *     >> GANTI src dengan foto asli (letakkan di public/images/gallery/).
   *     ratio membantu layout masonry: 'portrait' | 'landscape' | 'square'
   * ------------------------------------------------------------------ */
  gallery: {
    title: 'Galeri Kami',
    subtitle: 'Potret perjalanan sebelum hari bahagia',
    photos: [
      {
        src: '/images/gallery/gallery-01.svg',
        alt: 'Diana dan Hengki berfoto di taman dengan latar bunga mawar biru',
        ratio: 'portrait',
        caption: 'Langkah pertama menuju selamanya',
      },
      {
        src: '/images/gallery/gallery-02.svg',
        alt: 'Diana tersenyum mengenakan kebaya di depan pintu kayu klasik',
        ratio: 'landscape',
        caption: 'Senyum yang mengubah segalanya',
      },
      {
        src: '/images/gallery/gallery-03.svg',
        alt: 'Hengki memegang buket bunga mawar biru',
        ratio: 'square',
        caption: 'Buket kecil untuk janji besar',
      },
      {
        src: '/images/gallery/gallery-04.svg',
        alt: 'Diana dan Hengki berjalan beriringan di jalan setapak',
        ratio: 'portrait',
        caption: 'Melangkah bersama',
      },
      {
        src: '/images/gallery/gallery-05.svg',
        alt: 'Foto berdua dengan latar langit senja keemasan',
        ratio: 'landscape',
        caption: 'Senja yang tidak pernah pudar',
      },
      {
        src: '/images/gallery/gallery-06.svg',
        alt: 'Foto tangan Diana dan Hengki saling menggenggam',
        ratio: 'square',
        caption: 'Tangan yang tidak ingin lepas',
      },
      {
        src: '/images/gallery/gallery-07.svg',
        alt: 'Diana mengenakan gaun putih dengan ornamen bunga',
        ratio: 'portrait',
        caption: 'Untuk hari yang dinanti',
      },
      {
        src: '/images/gallery/gallery-08.svg',
        alt: 'Hengki dan Diana tertawa bersama di bawah pohon zaitun',
        ratio: 'landscape',
        caption: 'Tertawa bersama sampai tua',
      },
      {
        src: '/images/gallery/gallery-09.svg',
        alt: 'Siluet Diana dan Hengki berdiri di pelataran',
        ratio: 'portrait',
        caption: 'Dua nama, satu cerita',
      },
    ],
  },

  /* ------------------------------------------------------------------
   * 6. WEDDING GIFT
   *     >> GANTI dengan nomor rekening ASLI. Jangan dibiarkan dummy
   *     saat undangan disebarkan. Setel `enabled: false` untuk menyembunyikan.
   * ------------------------------------------------------------------ */
  gift: {
    enabled: true,
    title: 'Wedding Gift',
    subtitle: 'Tanda kasih untuk hari bahagia kami',
    intro:
      'Doa dan kehadiran Anda sudah lebih dari cukup. Namun jika ingin memberikan tanda kasih, kami sediakan kemudahan berikut.',
    accounts: [
      {
        provider: 'Bank Mandiri',
        // >> GANTI nama pemilik rekening
        accountName: 'Diana Kartika Sari',
        // >> GANTI nomor rekening asli
        accountNumber: '1370009123456',
        color: '#B9955B',
      },
      {
        provider: 'Bank BCA',
        // >> GANTI nama pemilik rekening
        accountName: 'Hengki Prasetya Nugraha',
        // >> GANTI nomor rekening asli
        accountNumber: '5230918274',
        color: '#7188A5',
      },
      {
        provider: 'Dana / E-Wallet',
        accountName: 'Diana Kartika Sari',
        accountNumber: '081234567890',
        color: '#77785F',
      },
    ],
    // Alamat pengiriman kado fisik. Setel `enabled: false` bila tidak ingin ditampilkan.
    address: {
      enabled: true,
      // >> GANTI nama & alamat penerima kado
      recipient: 'Diana Kartika Sari',
      lines: ['Jl. Kenanga Raya No. 17, RT 04 / RW 09', 'Kel. Sukamaju, Cilandak', 'Jakarta Selatan 12430'],
      phone: '0812-3456-7890',
    },
    // >> GANTI dengan nomor WhatsApp konfirmasi (format internasional tanpa '+')
    // Setel null untuk menyembunyikan tombol konfirmasi.
    confirmWhatsapp: '6281234567890',
    confirmMessage: 'Assalamualaikum, saya ingin mengirimkan tanda kasih untuk pernikahan Diana & Hengki.',
  },

  /* ------------------------------------------------------------------
   * 7. MUSIK LATAR
   *     >> GANTI file di public/audio/ dengan lagu pilihan Anda (mp3).
   *     Musik hanya diputar SETELAH tamu menekan "Buka Undangan".
   * ------------------------------------------------------------------ */
  music: {
    src: '/audio/wedding-bgm.wav',
    title: 'Love Theme',
    artist: 'Synthesized Ambience (placeholder)',
    // Volume awal 0–1. 0.35–0.5 terasa nyaman di ponsel.
    volume: 0.45,
  },

  /* ------------------------------------------------------------------
   * 8. RSVP & UCAPAN
   * ------------------------------------------------------------------ */
  rsvp: {
    title: 'RSVP & Doa Terbaik',
    subtitle: 'Konfirmasi kehadiran dan kirimkan doa untuk kami',
    intro:
      'Kami akan sangat senang jika Anda berkenan hadir. Mohon konfirmasi kehadiran sebelum batas waktu berikut.',
    // >> GANTI batas jumlah tamu yang boleh dibawa satu undangan
    maxGuests: 10,
    messageMinLength: 3,
    messageMaxLength: 400,
    nameMaxLength: 70,
    // Mode penyimpanan: 'auto' (Supabase bila .env terisi, selain itu demo),
    // 'supabase' (wajib online), atau 'demo' (localStorage browser).
    provider: 'auto',
    // >> GANTI pesan kustom setelah tamu berhasil mengirim ucapan
    successMessage: 'Terima kasih! Ucapan Anda sudah kami terima.',
    // Batas minimum detik pengisian formulir (anti-spam bot)
    minFillSeconds: 2.5,
  },

  /* ------------------------------------------------------------------
   * 9. NAVIGASI
   *     `icon` mengacu pada nama ikon di src/components/Icon.jsx
   *     Urutan array ini menentukan urutan section & navigasi.
   * ------------------------------------------------------------------ */
  navigation: [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'quote', label: 'Quotes', icon: 'quote' },
    { id: 'couple', label: 'Mempelai', icon: 'heart' },
    { id: 'event', label: 'Acara', icon: 'calendar' },
    { id: 'maps', label: 'Maps', icon: 'map' },
    { id: 'gallery', label: 'Gallery', icon: 'gallery' },
    { id: 'rsvp', label: 'RSVP', icon: 'send' },
    { id: 'gift', label: 'Gift', icon: 'gift' },
  ],

  // Menu yang tampil langsung pada bottom navigation (maksimal 5, sisanya
  // dapat diakses lewat tombol "Lainnya"). Ubah urutannya sesuai kebutuhan.
  primaryNavIds: ['home', 'couple', 'event', 'gallery', 'rsvp'],

  /* ------------------------------------------------------------------
   * 10. PENUTUP
   * ------------------------------------------------------------------ */
  closing: {
    title: 'Terima Kasih',
    lines: [
      'Merupakan suatu kehormatan dan kebahagiaan bagi kami',
      'apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.',
    ],
    families: [
      'Kel. Bapak H. Suryana Wijaya',
      'Kel. Bapak Ir. Bambang Prasetya',
    ],
    salam: 'Wassalamualaikum Warahmatullahi Wabarakatuh',
  },

  /* ------------------------------------------------------------------
   * 11. WARNA TEMA (dipakai komponen ornamen & gradient CSS-in-JS)
   * ------------------------------------------------------------------ */
  theme: {
    ivory: '#F7F5EF',
    champagne: '#B9955B',
    dustyBlue: '#7188A5',
    oliveGreen: '#77785F',
    darkBrown: '#5B5044',
    white: '#FFFFFF',
  },
}

/** Daftar seluruh id section sesuai urutan navigasi. */
export const sectionIds = weddingConfig.navigation.map((item) => item.id)

/** Ambil item navigasi berdasarkan id. */
export function getNavItem(id) {
  return weddingConfig.navigation.find((item) => item.id === id)
}

export default weddingConfig
