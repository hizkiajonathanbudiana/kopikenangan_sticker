// data/stickerLab.ts
export type Locale = "zh" | "en";

export type LanguageOption = {
  id: Locale;
  label: string;
  description: string;
  badge: string;
};

export type StickerTheme = {
  id: string;
  assetFolder: string;
  logo: string;
  heroEmoji: string;
  heroBadge: string;
  accent: string;
  accentMuted: string;
  previewTagline: Record<Locale, string>;
  copy: Record<
    Locale,
    {
      brandTag: string;
      title: string;
      description: string;
      accountTitle: string;
  sponsorTagline: string;
  accountSubtitle: string;
      validity: string;
      buttonLabel: string;
      themeDescription: string;
    }
  >;
  stickers: Array<{
    filename: string;
    emoji: string;
    label: Record<Locale, string>;
  }>;
};

// HAPUS BAGIAN INI: globalAssets sudah tidak digunakan
// export const globalAssets = {
//   kopiKenanganLogoC: "/stickers/logo_global.png", 
// };

// Warna hijau standard LINE (global untuk tombol utama di Store Preview)
export const LINE_GREEN = "#06C755";

export const languageOptions: LanguageOption[] = [
  {
    id: "zh",
    label: "繁體中文",
    description: "面向台灣 / 香港受眾",
    badge: "中文 UI",
  },
  {
    id: "en",
    label: "English",
    description: "Global & SEA markets",
    badge: "EN UI",
  },
];

export const localeDisplayName: Record<Locale, string> = {
  en: "English",
  zh: "繁體中文",
};

export const uiCopy: Record<
  Locale,
  {
    heroTitle: string;
    heroSubtitle: string;
    previewTitle: string;
    previewSubtitle: string;
    downloadAction: string; 
    downloadFilename: string;
  }
> = {
  en: {
    heroTitle: "LINE Sticker UX Kit",
    heroSubtitle: "",
    previewTitle: "LINE Store Preview",
    previewSubtitle:
      "Explore the localized sticker sets designed to bridge contemporary coffee culture and ancient Indonesian traditions.",
    downloadAction: "Download Preview Image (PNG)",
    downloadFilename: "sticker-lab-preview",
  },
  zh: {
    heroTitle: "LINE 貼圖 UX 工具",
    heroSubtitle: "",
    previewTitle: "LINE Store 預覽",
    previewSubtitle:
      "探索結合現代咖啡文化與印尼古老傳統蠟染的數位貼圖設計。",
    downloadAction: "下載預覽圖片 (PNG)",
    downloadFilename: "贴图预览",
  },
};

export const stickerThemes: StickerTheme[] = [
  {
    id: "ka-kun",
    assetFolder: "kawung",
    logo: "/stickers/logo_kakun.png",
    heroEmoji: "",
    heroBadge: "Kawung",
    accent: "#06C755", 
    accentMuted: "rgba(6, 199, 85, 0.18)",
    previewTagline: {
      en: "Coffee-fueled Kawung energy for energetic conversations.",
      zh: "Kawung 傳統與咖啡濃度一次到位。",
    },
    copy: {
      en: {
        brandTag: "Kopi Kenangan Official",
        title: "Brand Commerce × Ka-Kun (Kawung)",
        description:
          "Kopi Kenangan × Ka-Kun free stickers launch today! Bring Yogyakarta's Kawung heritage to every conversation and add the official account to claim before 2026/04/16.",
  accountTitle: "Kopi Kenangan",
  sponsorTagline: "Sponsor for this sticker set",
  accountSubtitle: "",
        validity: "Valid for 90 days",
        buttonLabel: "👤 Add this friend to download for free!",
        themeDescription: "Bold espresso palette with Kawung pattern cues.",
      },
      zh: {
        brandTag: "Kopi Kenangan Official",
        title: "品牌商務 × 卡君（Kawung）",
        description:
          "Kopi Kenangan × 卡君免費貼圖今天上線囉！讓充滿日惹 Kawung 傳統風情的卡君陪你聊天，下載期限至 2026/04/16。",
  accountTitle: "Kopi Kenangan",
  sponsorTagline: "本貼圖組贊助合作",
  accountSubtitle: "",
        validity: "有效期限 90 天",
        buttonLabel: "👤 加好友立即免費下載",
        themeDescription: "濃烈咖啡色系搭配 Kawung 圖紋靈感。",
      },
    },
    stickers: [
      { filename: "1.png", emoji: "💪", label: { zh: "貼圖 01", en: "Sticker 01" } },
      { filename: "2.png", emoji: "🥺", label: { zh: "貼圖 02", en: "Sticker 02" } },
      { filename: "3.png", emoji: "😅", label: { zh: "貼圖 03", en: "Sticker 03" } },
      { filename: "4.png", emoji: "❤️", label: { zh: "貼圖 04", en: "Sticker 04" } },
      { filename: "5.png", emoji: "😎", label: { zh: "貼圖 05", en: "Sticker 05" } },
      { filename: "6.png", emoji: "🤩", label: { zh: "貼圖 06", en: "Sticker 06" } },
      { filename: "7.png", emoji: "🤔", label: { zh: "貼圖 07", en: "Sticker 07" } },
      { filename: "8.png", emoji: "😴", label: { zh: "貼圖 08", en: "Sticker 08" } },
    ],
  },
  {
    id: "mega-miu",
    assetFolder: "mega",
    logo: "/stickers/logo_mega.png",
    heroEmoji: "",
    heroBadge: "Mega Mendung",
    accent: "#6EC7FF", 
    accentMuted: "rgba(110, 199, 255, 0.18)",
    previewTagline: {
      en: "Cirebon-inspired cloud spirits for soft chats.",
      zh: "來自井里汶的雲朵靈感，療癒整天。",
    },
    copy: {
      en: {
        brandTag: "Kopi Kenangan Official",
        title: "Brand Commerce × Mega-Miu",
        description:
          "Kopi Kenangan × Mega-Miu free stickers are live! Bring the Mega Mendung cloud motif to your chat list and grab them before 2026/04/16.",
  accountTitle: "Kopi Kenangan",
  sponsorTagline: "Sponsor for this sticker set",
  accountSubtitle: "",
        validity: "Valid for 90 days",
        buttonLabel: "👤 Add this friend to download for free!",
        themeDescription: "Dreamy gradients with cloud-light interactions.",
      },
      zh: {
        brandTag: "Kopi Kenangan Official",
        title: "品牌商務 × 雲美格",
        description:
          "Kopi Kenangan × 雲美格（Mega-Miu）免費貼圖今天上線囉！帶著井里汶 Mega Mendung 雲朵圖騰の超萌美格陪你聊天，下載期限至 2026/04/16。",
  accountTitle: "Kopi Kenangan",
  sponsorTagline: "本貼圖組贊助合作",
  accountSubtitle: "",
        validity: "有效期限 90 天",
        buttonLabel: "👤 加好友立即免費下載",
        themeDescription: "柔霧藍紫色系與雲朵互動。",
      },
    },
    stickers: [
      { filename: "IMG_9439.PNG", emoji: "☁️", label: { zh: "貼圖 01", en: "Sticker 01" } },
      { filename: "IMG_9440.PNG", emoji: "✨", label: { zh: "貼圖 02", en: "Sticker 02" } },
      { filename: "IMG_9442.PNG", emoji: "😠", label: { zh: "貼圖 03", en: "Sticker 03" } },
      { filename: "IMG_9445.PNG", emoji: "💤", label: { zh: "貼圖 04", en: "Sticker 04" } },
      { filename: "IMG_9447.PNG", emoji: "😊", label: { zh: "貼圖 05", en: "Sticker 05" } },
      { filename: "IMG_9449.PNG", emoji: "🤍", label: { zh: "貼圖 06", en: "Sticker 06" } },
      { filename: "IMG_9452.PNG", emoji: "🤭", label: { zh: "貼圖 07", en: "Sticker 07" } },
      { filename: "IMG_9453.PNG", emoji: "🌧️", label: { zh: "貼圖 08", en: "Sticker 08" } },
    ],
  },
];