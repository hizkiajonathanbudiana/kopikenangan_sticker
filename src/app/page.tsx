"use client";

/* eslint-disable @next/next/no-img-element */

import { useMemo, useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";

import {
  Locale,
  languageOptions,
  localeDisplayName,
  stickerThemes,
  uiCopy,
  LINE_GREEN,
  // globalAssets dihapus
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

    const cleanupAnimations = disableAnimations();
    const cleanupBackground = enforceSolidBackground(previewRefState);

    try {
      await ensurePreviewAssetsReady(previewRefState);

      const dataUrl = await toPng(previewRefState, {
        cacheBust: true,
        backgroundColor: "#ffffff",
        pixelRatio: Math.max(window.devicePixelRatio || 1, 2),
      });

      const linkSource = dataUrl;
      const link = document.createElement("a");
      link.href = linkSource;
      link.download = `${activeCopy.downloadFilename}-${activeTheme.id}-${locale}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to generate image. Please try again.");
    } finally {
      cleanupAnimations();
      cleanupBackground();
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
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

        {/* WRAPPER PREVIEW + TOMBOL DOWNLOAD */}
        <section className="mx-auto flex w-full max-w-md flex-col gap-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              {activeCopy.previewTitle}
            </p>
            <p className="mt-2 text-sm text-slate-500">{activeCopy.previewSubtitle}</p>
          </div>

          {/* KOMPONEN PREVIEW STORE */}
          <ThemePreview
            locale={locale}
            theme={activeTheme}
            setPreviewRef={setPreviewRefState}
          />

          {/* TOMBOL ACTION UNTUK DOWNLOAD */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleDownloadPreview}
              disabled={!previewRefState}
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

function ThemePreview({
  theme,
  locale,
  setPreviewRef,
}: {
  theme: (typeof stickerThemes)[number];
  locale: Locale;
  setPreviewRef: (node: HTMLDivElement | null) => void;
}) {
  const copy = theme.copy[locale];
  const logoAlt = `${copy.title} logo`;

  const localRef = useRef<HTMLDivElement>(null);

  // State untuk melacak ID stiker mana yang sedang membesar (di-klik)
  const [zoomedId, setZoomedId] = useState<string | null>(null);

  useEffect(() => {
    setPreviewRef(localRef.current);
    return () => setPreviewRef(null);
  }, [setPreviewRef]);

  return (
    <div
      ref={localRef}
      className="rounded-[36px] border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.08)] cursor-default"
      // Klik di sembarang area kosong akan me-reset zoom stiker
      onClick={() => setZoomedId(null)}
    >
      <div className="flex items-center justify-between border-b border-slate-100 p-6 pb-4 text-xs uppercase tracking-[0.3em] text-slate-500">
        <span>LINE STORE</span>
        <div className="flex items-center gap-4 text-base text-slate-400">
          <span>↑</span>
          <span>✕</span>
        </div>
      </div>

      <div className="flex flex-col items-center px-12 pb-6 pt-6 text-center">
        <div className="flex h-36 w-36 items-center justify-center rounded-[30px] border border-slate-200 bg-slate-50 overflow-hidden">
          <div className="h-full w-full">
            <img
              src={theme.logo}
              alt={logoAlt}
              className="h-full w-full object-cover select-none"
              draggable={false}
            />
          </div>
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
              <p className="text-xs text-slate-500">{copy.sponsorTagline}</p>
              <p className="text-xs text-slate-400">{copy.accountSubtitle}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white">
              <img
                src="/stickers/kopikenangan.png"
                alt="Kopi Kenangan logo"
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
                loading="lazy"
                decoding="async"
                crossOrigin="anonymous"
                draggable={false}
              />
            </div>
          </div>
          <button
            type="button"
            className="mt-4 w-full rounded-2xl px-4 py-3 text-sm font-bold transition hover:brightness-105 active:scale-[0.98]"
            style={{ backgroundColor: LINE_GREEN, color: "#ffffff" }}
          >
            {copy.buttonLabel}
          </button>
        </div>

        {/* Teks Deskripsi akan memudar jika ada stiker yang di-zoom */}
        <p className={`text-[13px] leading-relaxed text-slate-500 transition-opacity duration-300 ${zoomedId ? 'opacity-30' : 'opacity-100'}`}>
          {copy.description}
        </p>
      </div>

      {/* Area Grid Stiker */}
      <div className="relative px-6 pb-12 pt-2">
        {/* UBAH DI SINI: PERMINTAAN USER 1 
          "Decorating (photos/profile) supported" ganti jadi "Decorating (photos/profile) not supported"
        */}
        <div className={`mb-6 ml-2 flex items-center gap-1.5 text-xs text-slate-400 transition-opacity duration-300 ${zoomedId ? 'opacity-30' : 'opacity-100'}`}>
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-slate-400 text-[9px]">i</span>
          Decorating (photos/profile) not supported
        </div>

        {/* Grid Stiker */}
        <div className="grid grid-cols-4 gap-x-2 gap-y-6 relative z-10">
          {theme.stickers.map((sticker) => {
            const isZoomed = zoomedId === sticker.filename;
            const isDimmed = zoomedId && !isZoomed;

            return (
              <div key={sticker.filename} className="flex flex-col items-center justify-center relative">
                <button
                  type="button"
                  // Logika Inline Scaling: Membesar tepat di tempatnya
                  className={`relative flex items-center justify-center transition-all duration-300 ease-out origin-center ${isZoomed
                    ? "z-50 scale-[2] drop-shadow-xl"
                    : isDimmed
                      ? "z-10 opacity-30"
                      : "z-10 opacity-100 hover:scale-110"
                    }`}
                  onClick={(e) => {
                    e.stopPropagation(); // Mencegah klik menembus ke container utama
                    setZoomedId(isZoomed ? null : sticker.filename);
                  }}
                >
                  <StickerImage
                    themeFolder={theme.assetFolder}
                    filename={sticker.filename}
                    alt={`${copy.title} - ${sticker.label[locale]}`}
                    size={72}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* UBAH DI SINI: PERMINTAAN USER 2 
        Ganti logo gambar copyright dengan teks "© Kopi kenangan".
        Diformat agar muted, centered, dan ikut meredup saat zoom.
      */}
      <div className={`flex justify-center border-t border-slate-100 p-10 pt-8 transition-opacity duration-300 ${zoomedId ? 'opacity-30' : 'opacity-100'}`}>
        <p className="text-sm font-medium tracking-tight text-slate-400">
          © Kopi kenangan
        </p>
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
    <img
      src={`/stickers/${themeFolder}/${filename}`}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      crossOrigin="anonymous"
      draggable={false}
      className="object-contain select-none"
    />
  );
}

async function ensurePreviewAssetsReady(node: HTMLElement) {
  const images = Array.from(node.querySelectorAll("img"));

  await Promise.all(
    images.map((img) => {
      if (img.complete && img.naturalWidth !== 0) {
        return Promise.resolve();
      }

      return new Promise<void>((resolve, reject) => {
        const handleLoad = () => {
          cleanup();
          resolve();
        };
        const handleError = () => {
          cleanup();
          reject(new Error(`Failed to load image: ${img.currentSrc || img.src}`));
        };
        const cleanup = () => {
          img.removeEventListener("load", handleLoad);
          img.removeEventListener("error", handleError);
        };
        img.addEventListener("load", handleLoad);
        img.addEventListener("error", handleError);
      });
    })
  );

  if ("fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {
      // font loading API tidak tersedia di semua browser
    }
  }
}

function disableAnimations() {
  const style = document.createElement("style");
  style.dataset.previewNoAnim = "true";
  style.textContent = "*{transition:none!important;animation:none!important}";
  document.head.appendChild(style);

  return () => {
    style.remove();
  };
}

function enforceSolidBackground(node: HTMLElement) {
  const forcedClass = "bg-white";
  const hadClass = node.classList.contains(forcedClass);
  if (!hadClass) {
    node.classList.add(forcedClass);
  }

  const previousBackground = node.style.backgroundColor;
  if (!node.style.backgroundColor) {
    node.style.backgroundColor = "#ffffff";
  }

  return () => {
    if (!hadClass) {
      node.classList.remove(forcedClass);
    }
    node.style.backgroundColor = previousBackground;
  };
}
