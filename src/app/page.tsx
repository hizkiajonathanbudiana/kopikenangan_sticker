"use client";

import Image from "next/image";
import { useMemo, useState, useRef, useEffect } from "react";
// Impor html2canvas untuk fitur download (memerlukan instalasi terpisah)
import html2canvas from "html2canvas";

import {
  Locale,
  languageOptions,
  localeDisplayName,
  stickerThemes,
  uiCopy,
  globalAssets,
  LINE_GREEN, // Impor warna hijau global
} from "@/data/stickerLab";

const landingCopy = {
  heroTitle: "Kopi Kenangan × Batik LINE Stickers",
  heroSubtitle:
    "Showcasing local Indonesian heritage through digital creativity. Switch between the Kawung (Yogyakarta) and Mega Mendung (Cirebon) themes to explore the sticker collections.",
  templateLabel: "數位文創應用 | Digital & Cultural",
};

export default function Home() {
  const [activeThemeId, setActiveThemeId] = useState<string>(stickerThemes[0].id);
  const [locale, setLocale] = useState<Locale>("en");

  // State untuk melacak stiker mana yang sedang di-zoom
  const [zoomedSticker, setZoomedSticker] = useState<{
    themeFolder: string;
    filename: string;
    alt: string;
  } | null>(null);

  // State untuk menyimpan referensi DOM dari komponen preview untuk diunduh
  const [previewRefState, setPreviewRefState] = useState<HTMLDivElement | null>(null);

  const activeTheme = useMemo(
    () => stickerThemes.find((theme) => theme.id === activeThemeId)!,
    [activeThemeId]
  );

  const activeCopy = uiCopy[locale];

  // Fungsi untuk mengunduh preview sebagai gambar PNG
  const handleDownloadPreview = async () => {
    if (!previewRefState) return;

    // Tambahkan class sementara untuk memastikan latar belakang preview solid putih saat difoto
    previewRefState.classList.add("bg-white");

    // Matikan transisi Tailwind sementara agar tidak merusak kalkulasi html2canvas
    const style = document.createElement('style');
    document.head.appendChild(style);
    style.sheet?.insertRule('* { transition: none !important; }', 0);

    try {
      const canvas = await html2canvas(previewRefState, {
        scale: 2, // Meningkatkan resolusi gambar hasil (Retina quality)
        useCORS: true, // Mencoba memuat gambar eksternal jika ada (penting untuk stiker asli)
        backgroundColor: "#ffffff", // Memastikan latar belakang putih
        logging: false, // Matikan log konsol
        onclone: (clonedDoc) => {
          // Kita bisa memodifikasi kloning DOM di sini jika perlu sebelum difoto
          // Misalnya menyembunyikan elemen tertentu yang tidak ingin difoto
          // Di sini kita biarkan apa adanya.
        },
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `${activeCopy.downloadFilename}-${activeTheme.id}-${locale}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      // Hapus style sementara dan class
      style.remove();
      previewRefState.classList.remove("bg-white");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      {/* MODAL OVERLAY UNTUK STIKER YANG DI-ZOOM 
        Menggunakan fixed positioning dan z-index tinggi agar menimpa segalanya.
      */}
      {zoomedSticker && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm cursor-zoom-out p-10"
          onClick={() => setZoomedSticker(null)} // Klik di mana saja untuk menutup
        >
          <div className="relative flex flex-col items-center gap-6 rounded-3xl bg-white/10 p-12 shadow-2xl backdrop-blur-md">
            {/* Tombol X Tutup */}
            <button
              type="button"
              className="absolute -top-6 -right-6 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/50 text-white hover:bg-slate-900"
              onClick={() => setZoomedSticker(null)}
            >
              ✕
            </button>
            <div className="relative h-64 w-64">
              <Image
                src={`/stickers/${zoomedSticker.themeFolder}/${zoomedSticker.filename}`}
                alt={zoomedSticker.alt}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <p className="text-sm font-mono text-white/70">
              {zoomedSticker.filename} (Zoom Preview)
            </p>
          </div>
        </div>
      )}

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-16">
        <header className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
            {landingCopy.templateLabel}
          </p>
          <h1 className="text-4xl font-semibold leading-tight">
            {landingCopy.heroTitle}
          </h1>
          <p className="mx-auto max-w-2xl text-base text-slate-500">
            {landingCopy.heroSubtitle}
          </p>
        </header>

        <div className="flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
          <TemplateToggle activeId={activeThemeId} onSelect={setActiveThemeId} />
          <LanguageToggle activeLocale={locale} onSelect={setLocale} />
        </div>

        {/* WRAPPER PREVIEW + TOMBOL DOWNLOAD
          Kita batasi max-width wrapper ini agar konten di dalamnya tetap rapi di layar lebar
        */}
        <section className="mx-auto flex w-full max-w-md flex-col gap-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              {activeCopy.previewTitle}
            </p>
            <p className="mt-2 text-sm text-slate-500">{activeCopy.previewSubtitle}</p>
          </div>

          {/* KOMPONEN PREVIEW STORE (Sekarang menerima ref) */}
          <ThemePreview
            locale={locale}
            theme={activeTheme}
            onStickerClick={setZoomedSticker}
            setPreviewRef={setPreviewRefState} // Kirim fungsi setter ref ke komponen anak
          />

          {/* TOMBOL ACTION UNTUK DOWNLOAD PREVIEW SEBAGAI GAMBAR */}
          <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={handleDownloadPreview}
              disabled={!previewRefState} // Nonaktifkan jika ref belum terpasang
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
            >
              <span>🖼️</span>
              {activeCopy.downloadAction}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function TemplateToggle({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {stickerThemes.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => onSelect(theme.id)}
          className={`text-left transition ${activeId === theme.id
              ? "rounded-3xl border-2 border-lime-400 bg-lime-50 p-6 shadow-lg"
              : "rounded-3xl border border-slate-200 bg-white p-6 hover:border-slate-400"
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-3xl" aria-hidden>
              {theme.heroEmoji}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
              {theme.heroBadge}
            </span>
          </div>
          <h2 className="mt-4 text-2xl font-semibold">
            {theme.copy.en.title}
          </h2>
          <p className="text-sm text-slate-500">{theme.previewTagline.en}</p>
        </button>
      ))}
    </div>
  );
}

function LanguageToggle({
  activeLocale,
  onSelect,
}: {
  activeLocale: Locale;
  onSelect: (locale: Locale) => void;
}) {
  return (
    <div className="flex w-full justify-center gap-3">
      {languageOptions.map((language) => (
        <button
          key={language.id}
          type="button"
          onClick={() => onSelect(language.id)}
          className={`rounded-full border px-5 py-2 text-sm font-medium transition ${activeLocale === language.id
              ? "border-lime-400 bg-white shadow"
              : "border-slate-200 text-slate-500 hover:border-slate-400"
            }`}
        >
          {localeDisplayName[language.id]}
        </button>
      ))}
    </div>
  );
}

// Komponen ThemePreview diperbarui untuk menerima ref dan callback klik stiker
function ThemePreview({
  theme,
  locale,
  onStickerClick,
  setPreviewRef,
}: {
  theme: (typeof stickerThemes)[number];
  locale: Locale;
  // Callback untuk memberi tahu parent jika stiker diklik
  onStickerClick: (sticker: {
    themeFolder: string;
    filename: string;
    alt: string;
  }) => void;
  // Fungsi setter untuk menyimpan referensi DOM ke parent
  setPreviewRef: (node: HTMLDivElement | null) => void;
}) {
  const copy = theme.copy[locale];
  const logoAlt = `${copy.title} logo`;

  // Gunakan ref internal dan hubungkan ke setter parent saat mount
  const localRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Berikan referensi DOM lokal ke fungsi setter parent
    setPreviewRef(localRef.current);
    // Bersihkan ref saat unmount
    return () => setPreviewRef(null);
  }, [setPreviewRef]);

  return (
    // Pasang ref ke container utama preview agar ini yang "difoto" oleh html2canvas
    <div
      ref={localRef}
      className="overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.08)]"
    >
      <div className="flex items-center justify-between border-b border-slate-100 p-6 pb-4 text-xs uppercase tracking-[0.3em] text-slate-500">
        <span>LINE STORE</span>
        <div className="flex items-center gap-4 text-base text-slate-400">
          <span>↑</span>
          <span>✕</span>
        </div>
      </div>
      <div className="flex flex-col items-center px-12 pb-6 pt-6 text-center">
        <div className="flex h-36 w-36 items-center justify-center rounded-[30px] border border-slate-200 bg-slate-50">
          <Image
            src={theme.logo}
            alt={logoAlt}
            width={112}
            height={112}
            className="object-contain"
          />
        </div>
        <span className="mt-6 rounded-full border border-slate-200 bg-slate-50 px-4 py-1 text-xs text-slate-500">
          {copy.brandTag}
        </span>
        <h3 className="mt-4 text-2xl font-semibold">{copy.title}</h3>
        <p className="text-sm text-slate-500">{copy.validity}</p>
      </div>
      <div className="space-y-4 px-12 pb-6">
        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">{copy.accountTitle}</p>
              <p className="text-xs text-slate-500">{copy.accountSubtitle}</p>
            </div>
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 text-xl">
              🛍️
            </span>
          </div>
          {/* TOMBOL DOWNLOAD UTAMA (Sekarang Selalu Hijau LINE)
            Kami menggunakan warna hijau LINE global, bukan warna accent theme.
          */}
          <button
            type="button"
            className="mt-4 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition hover:brightness-105 active:scale-[0.98]"
            style={{ backgroundColor: LINE_GREEN, color: "#041b11" }}
          >
            {copy.buttonLabel}
          </button>
        </div>
        <p className="text-xs leading-6 text-slate-500">{copy.description}</p>
      </div>

      {/* Grid Stiker */}
      <div className="rounded-[28px] border border-slate-100 bg-white px-6 pb-8 pt-6">
        <div className="grid grid-cols-4 gap-2">
          {theme.stickers.map((sticker) => (
            <div key={sticker.filename} className="flex flex-col items-center">
              {/* Wrapper Stiker yang Sekarang Bisa Diklik 
                Menambahkan cursor-zoom-in untuk memberi tahu user ini bisa diklik.
              */}
              <button
                type="button"
                className="flex h-16 w-16 cursor-zoom-in items-center justify-center rounded-2xl border border-slate-100 bg-white transition hover:border-slate-300 hover:scale-105 active:scale-95"
                onClick={() =>
                  onStickerClick({
                    themeFolder: theme.assetFolder,
                    filename: sticker.filename,
                    alt: `${copy.title} - ${sticker.label[locale]}`,
                  })
                }
              >
                <StickerImage
                  themeFolder={theme.assetFolder}
                  filename={sticker.filename}
                  alt={`${copy.title} - ${sticker.label[locale]}`}
                  size={64}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* LOGO GLOBAL (C) KOPI KENANGAN DI BAWAH STIKER
        Posisi ini sekarang sejajar dengan stiker dan menimpa teks deskripsi di atasnya jika difoto.
      */}
      <div className="flex justify-center border-t border-slate-100 p-8 pt-6">
        <Image
          src={globalAssets.kopiKenanganLogoC}
          alt="Kopi Kenangan"
          width={180}
          height={32}
          className="object-contain"
        />
      </div>
    </div>
  );
}

function StickerImage({
  themeFolder,
  filename,
  alt,
  size,
}: {
  themeFolder: string;
  filename: string;
  alt: string;
  size: number;
}) {
  return (
    <Image
      src={`/stickers/${themeFolder}/${filename}`}
      alt={alt}
      width={size}
      height={size}
      className="object-contain"
      unoptimized // Sangat penting agar html2canvas tidak terblokir oleh cross-origin policy browser
    />
  );
}