export const dictionary = {
  // Navigation
  nav: {
    title: "Holobiont",
    home: "Beranda",
    dashboard: "Dashboard",
    projects: "Proyek",
    schedules: "Jadwal",
    askAI: "Tanya AI",
    settings: "Pengaturan",
    templates: "Template",
    trash: "Sampah",
    help: "Bantuan",
    signIn: "Masuk",
    signUp: "Daftar",
    gettingStarted: "Mulai Sekarang",
    blog: "Blog",
    about: "Tentang",
    contactUs: "Hubungi Kami",
  },

  // Homepage
  home: {
    title: "Holobiont",
    subtitle: "Mengoptimalkan WHY kamu — dengan AI yang menjiwai",
    hero: {
      badge: "Segera Hadir • Versi 0.1.0",
      title: "Mengoptimalkan",
      titleHighlight: "WHY",
      titleSuffix: "kamu, — dengan AI yang menjiwai",
      description:
        "Holobiont adalah platform AI yang memahami cara berpikir Kamu — teman paling setia yang mendukung nilai dan tujuan Kamu.",
      cta: "Mulai Sekarang",
    },
    features: {
      title: "Fitur Unggulan",
      fileManagement: {
        title: "Manajemen File",
        description:
          "Simpan brief, aset (foto & video), dan draft di satu tempat—dapat dicari, aman, dan siap digunakan kapan saja.",
      },
      aiAssistant: {
        title: "Asisten AI Pribadi",
        description:
          "Brainstorm ide, tulis script/VO, dan dapatkan saran cerdas yang disesuaikan dengan niche Kamu.",
      },
      organizeContent: {
        title: "Organisasi Konten & Penjadwalan",
        description:
          "Rencanakan proyek, lacak status, dan jadwalkan posting dengan pengingat yang membuat Kamu tetap on track.",
      },
    },
  },

  // Common
  common: {
    loading: "Memuat...",
    error: "Terjadi kesalahan",
    success: "Berhasil",
    cancel: "Batal",
    save: "Simpan",
    delete: "Hapus",
    edit: "Edit",
    create: "Buat",
    search: "Cari",
    filter: "Filter",
    sort: "Urutkan",
    next: "Selanjutnya",
    previous: "Sebelumnya",
    close: "Tutup",
    open: "Buka",
    yes: "Ya",
    no: "Tidak",
    terms: "Ketentuan",
    policy: "Kebijakan",
    contact: "Hubungi",
    free: "Gratis",
  },

  // Notes
  notes: {
    title: "Catatan",
    create: "Buat Catatan",
    edit: "Edit Catatan",
    delete: "Hapus Catatan",
    empty: "Belum ada catatan",
    placeholder: "Mulai menulis catatan Kamu...",
  },

  // Auth
  auth: {
    signIn: "Masuk ke akun Kamu",
    signUp: "Buat akun baru",
    email: "Email",
    password: "Kata Sandi",
    confirmPassword: "Konfirmasi Kata Sandi",
    forgotPassword: "Lupa kata sandi?",
    rememberMe: "Ingat saya",
    alreadyHaveAccount: "Sudah punya akun?",
    dontHaveAccount: "Belum punya akun?",
  },

  // Onboarding
  onboarding: {
    title: "Memulai",
    description:
      "Lengkapi pengaturan Kamu untuk mendapatkan manfaat maksimal dari Holobiont",
    step: "Langkah",
    of: "dari",
    percent: "%",
    settingUp: "Menyiapkan profil Kamu...",
    creatingAssistant: "Kami sedang membuat asisten AI pribadi Kamu",
    welcome: {
      title: "Selamat Datang di Holobiont! 🎉",
      description:
        "Pengaturan cepat ini akan membantu kami memahami minat dan preferensi Kamu. Hanya membutuhkan",
      time: "2-3 menit",
      cta: "Mari Mulai!",
    },
    profile: {
      title: "Lengkapi Profil! 👤",
      description: "Isi informasi dasar untuk mengatur profil Kamu",
      fullName: "Nama Lengkap",
      fullNamePlaceholder: "Masukkan nama lengkap Kamu",
      fullNameRequired: "Nama lengkap wajib diisi",
      fullNameMinLength: "Nama lengkap minimal 2 karakter",
      phone: "Nomor Telepon",
      phonePlaceholder: "Masukkan nomor telepon Kamu",
      phoneRequired: "Nomor telepon wajib diisi",
      phoneInvalid: "Masukkan nomor telepon yang valid",
      phoneMinLength: "Nomor telepon minimal 10 digit",
      phoneHelp:
        "Sertakan kode negara jika di luar Indonesia (contoh: +62 812 3456 7890)",
    },
    categories: {
      title: "Pilih Kategori Minat 🎯",
      description: "Pilih hingga",
      maxCategories: "Kategori yang sesuai dengan minat Kamu",
      selected: "Kategori Terpilih",
      max: "maks",
    },
    niches: {
      title: "Pilih Niche Spesifik 🎭",
      description: "Pilih hingga",
      maxNiches: "area spesifik yang ingin Kamu fokuskan",
      selected: "Niche Terpilih",
    },
    bio: {
      title: "Tulis Bio ✨",
      generateBio: "Buat Bio dengan AI",
      generating: "AI Agent sedang membuat...",
      label: "Bio",
      placeholder:
        "Ceritakan tentang diri Kamu, pengalaman Kamu, passion Kamu, dan apa yang mendorong Kamu...",
      required: "Bio wajib diisi",
      minLength: "Bio minimal",
      maxLength: "Bio maksimal",
      characters: "karakter",
      moreNeeded: "karakter lagi dibutuhkan",
      goodLength: "✓ Panjang sudah pas",
      generateError: "Gagal membuat bio. Silakan coba lagi atau tulis sendiri.",
    },
    navigation: {
      previous: "Sebelumnya",
      next: "Selanjutnya",
      complete: "Selesaikan Pengaturan",
    },
    success: {
      title: "🎉 Selamat Datang di Holobiont!",
      description: "Profil telah berhasil dibuat.",
    },
    error: {
      title: "Gagal menyelesaikan pengaturan",
      description:
        "Silakan coba lagi atau hubungi dukungan jika masalah berlanjut.",
    },
  },
} as const;
