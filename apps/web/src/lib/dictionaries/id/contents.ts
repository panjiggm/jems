export const contents = {
  dialog: {
    title: "Buat Konten",
    description: {
      withProject: "Buat konten baru untuk proyek ini",
      selectProject: "Buat konten baru dan pilih proyek",
    },
    form: {
      project: "Proyek",
      projectPlaceholder: "Pilih proyek",
      projectRequired: "Pilih proyek",
      title: "Judul Konten",
      titlePlaceholder: "Masukkan judul konten",
      titleRequired: "Judul konten wajib diisi",
      platform: "Platform",
      platformRequired: "Platform wajib dipilih",
      dueDate: "Tanggal Jatuh Tempo",
      publishedAt: "Tanggal Publikasi",
      notes: "Catatan",
      notesPlaceholder: "Tambahkan catatan tambahan...",
      sowPlaceholder: "Tambahkan pernyataan pekerjaan (SOW)...",
      createButton: "Buat Konten",
      type: "Tipe",
      campaignTypeRequired: "Tipe kampanye wajib dipilih",
    },
    messages: {
      success: "Konten berhasil dibuat!",
      successDescription: "telah dibuat",
      error: "Gagal membuat konten",
      errorDescription: "Silakan coba lagi",
    },
  },
  activity: {
    title: "Aktivitas",
    statusHistory: "Riwayat Status",
    projectActivities: "Aktivitas Proyek",
    noActivity: "Belum Ada Aktivitas",
    noActivityDescription:
      "Aktivitas seperti pembaruan, perubahan status, dan tindakan lainnya akan muncul di sini.",
    actions: {
      created: "dibuat",
      updated: "diperbarui",
      deleted: "dihapus",
      completed: "diselesaikan",
      statusChanged: "status diubah",
      scheduled: "dijadwalkan",
      published: "dipublikasikan",
      assigned: "ditugaskan",
    },
    timeAgo: {
      justNow: "Baru saja",
      minutesAgo: "menit yang lalu",
      minuteAgo: "menit yang lalu",
      hoursAgo: "jam yang lalu",
      hourAgo: "jam yang lalu",
      daysAgo: "hari yang lalu",
      dayAgo: "hari yang lalu",
    },
  },
  detail: {
    details: "Detail",
    media: "Media",
    tasks: "Tugas",
    activity: "Aktivitas",
    back: "Kembali",
    delete: "Hapus",
    deleteTitle: "Hapus",
    deleteDescription: "Apakah Anda yakin ingin menghapus",
    deleteWarning:
      "Tindakan ini tidak dapat dibatalkan. Semua tugas terkait akan tetap ada tetapi tidak akan lagi terhubung dengan",
    deleteSuccess: "Konten berhasil dihapus",
    deleteError: "Gagal menghapus konten",
    cancel: "Batal",
    confirmDelete: "Hapus",
    created: "Dibuat",
    updated: "Diperbarui",
    statementOfWork: "Pernyataan Pekerjaan",
    noMedia: "Belum ada media yang dilampirkan",
  },
  media: {
    upload: {
      clickToUpload: "Klik untuk mengunggah atau seret dan lepas",
      uploading: "Mengunggah...",
      supportedFormats: "Gambar dan video didukung",
    },
    card: {
      view: "Lihat",
      delete: "Hapus",
    },
    deleteDialog: {
      title: "Hapus File Media",
      description: "Apakah Anda yakin ingin menghapus",
      warning: "Tindakan ini tidak dapat dibatalkan.",
      cancel: "Batal",
      confirmDelete: "Hapus",
    },
  },
  duration: {
    title: "Pengaturan Durasi",
    description:
      "Tetapkan durasi target untuk setiap transisi status. Ini opsional.",
    configured: "(dikonfigurasi)",
    transitions: {
      campaign: {
        productObtainedToProduction: "Produk Diperoleh → Produksi",
        productObtainedToProductionDesc:
          "Waktu untuk memulai produksi setelah menerima produk",
        productionToPublished: "Produksi → Dipublikasikan",
        productionToPublishedDesc:
          "Waktu untuk mempublikasikan setelah produksi selesai",
        publishedToPayment: "Dipublikasikan → Pembayaran",
        publishedToPaymentDesc:
          "Waktu untuk menerima pembayaran setelah publikasi",
        paymentToDone: "Pembayaran → Selesai",
        paymentToDoneDesc:
          "Waktu untuk menyelesaikan setelah pembayaran diterima",
      },
      routine: {
        planToInProgress: "Rencana → Sedang Berlangsung",
        planToInProgressDesc: "Waktu untuk mulai bekerja setelah perencanaan",
        inProgressToScheduled: "Sedang Berlangsung → Dijadwalkan",
        inProgressToScheduledDesc:
          "Waktu untuk menjadwalkan setelah mulai bekerja",
        scheduledToPublished: "Dijadwalkan → Dipublikasikan",
        scheduledToPublishedDesc: "Waktu antara penjadwalan dan publikasi",
      },
    },
  },
};
