export const table = {
  loading: "Memuat...",
  noData: {
    campaigns:
      "Tidak ada kampanye ditemukan. Buat kampanye pertama Kamu untuk memulai.",
    routines:
      "Tidak ada rutinitas ditemukan. Buat rutinitas pertama Kamu untuk memulai.",
  },
  columns: {
    select: "Pilih",
    name: "Nama",
    platform: "Platform",
    type: "Tipe",
    status: "Status",
    notes: "Catatan",
    actions: "Aksi",
  },
  pagination: {
    selected: "baris dipilih.",
    of: "dari",
    previous: "Sebelumnya",
    next: "Selanjutnya",
  },
  aria: {
    selectAll: "Pilih semua",
    selectRow: "Pilih baris",
  },
} as const;
