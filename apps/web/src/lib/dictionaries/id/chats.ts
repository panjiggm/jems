export const chats = {
  title: "Asisten AI",
  greeting: "Halo",
  greetingSuffix: "ada yang bisa saya bantu?",
  subtitle: "Gunakan salah satu prompt di bawah ini atau ketik sendiri untuk memulai percakapan.",
  suggestedPrompt: "Suggested prompt",
  defaultSuggestions: {
    todo: {
      title: "Buat daftar to-do untuk proyek atau tugas pribadi",
      description: "Dapatkan rencana terstruktur untuk mencapai tujuan pribadi Anda.",
    },
    email: {
      title: "Buat email untuk membalas tawaran pekerjaan",
      description: "Buat respons profesional yang disesuaikan dengan nada Anda.",
    },
    summarize: {
      title: "Ringkas artikel atau teks ini dalam satu paragraf",
      description: "Pahami poin-poin utama dari bacaan panjang dengan cepat.",
    },
  },
  messages: {
    thinking: "Berpikir...",
    aiRespondedSuccess: "AI merespons dengan sukses",
    aiResponseError: "Gagal mendapatkan respons AI. Silakan coba lagi.",
    newChat: "Chat Baru",
  },
  input: {
    placeholder: "Tanyakan apapun yang Anda inginkan...",
    attachmentTooltip: "Belum Tersedia",
  },
} as const;

