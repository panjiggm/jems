export const project = {
  search: {
    placeholder: "Cari konten...",
    filters: "Filter",
    clearAll: "Hapus semua",
    platform: "Platform",
    status: "Status",
    type: "Tipe",
    campaignType: "Tipe Kampanye",
  },
  views: {
    table: "Tabel",
    kanban: "Kanban",
    list: "Daftar",
    calendar: "Kalender",
    display: "Tampilan",
  },
  platforms: {
    tiktok: "TikTok",
    instagram: "Instagram",
    youtube: "YouTube",
    x: "X (Twitter)",
    facebook: "Facebook",
    threads: "Threads",
    other: "Lainnya",
  },
  campaignTypes: {
    barter: "Barter",
    paid: "Berbayar",
  },
  status: {
    productObtained: "Produk Diperoleh",
    production: "Produksi",
    published: "Dipublikasikan",
    payment: "Pembayaran",
    done: "Selesai",
    plan: "Rencana",
    inProgress: "Sedang Berlangsung",
    scheduled: "Dijadwalkan",
  },
  viewMessages: {
    kanban: {
      title: "Tampilan Kanban",
      description:
        "Seret dan lepas konten Kamu di kolom yang berbeda untuk mengelola alur kerja Kamu.",
    },
    list: {
      title: "Tampilan Daftar",
      description:
        "Silakan pilih proyek untuk menampilkan konten dalam format daftar.",
    },
    table: {
      title: "Tampilan Tabel",
      description:
        "Silakan pilih proyek untuk menampilkan konten dalam format tabel.",
    },
    calendar: {
      title: "Tampilan Kalender",
      description: "Tampilan kalender akan segera hadir...",
    },
  },
} as const;
