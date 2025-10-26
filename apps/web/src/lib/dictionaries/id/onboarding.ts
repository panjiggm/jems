export const onboarding = {
  title: "Pengenalan",
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
  logout: "Keluar",
} as const;
