"use client";

/* eslint-disable @next/next/no-img-element */

import { type CSSProperties, useMemo, useState, useRef, useEffect } from "react";
import { toPng } from "html-to-image";
import html2canvas from "html2canvas";
import { converter, parse as parseColor } from "culori";

import {
  Locale,
  languageOptions,
  localeDisplayName,
  stickerThemes,
  uiCopy,
  LINE_GREEN,
  // globalAssets dihapus
} from "@/data/stickerLab";

const PREVIEW_EXPORT_WIDTH = 1500;
const PREVIEW_ASPECT_RATIO = 3200 / 1500;
const PREVIEW_DISPLAY_WIDTH = 520;
const PREVIEW_DISPLAY_HEIGHT = Math.round(PREVIEW_DISPLAY_WIDTH * PREVIEW_ASPECT_RATIO);

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
  const previewWrapperRef = useRef<HTMLDivElement | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewHeight, setPreviewHeight] = useState(PREVIEW_DISPLAY_HEIGHT);

  const activeTheme = useMemo(
    () => stickerThemes.find((theme) => theme.id === activeThemeId)!,
    [activeThemeId]
  );

  const activeCopy = uiCopy[locale];

  useEffect(() => {
    if (!previewWrapperRef.current) {
      return;
    }

    const node = previewWrapperRef.current;

    const updateScale = () => {
      const width = node.clientWidth;
      if (!width) return;

      // ✅ Biarkan nge-scale menyesuaikan lebar container
      const nextScale = width / PREVIEW_DISPLAY_WIDTH;
      setPreviewScale(Number(nextScale.toFixed(4)));
    };

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(node);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!previewRefState) {
      setPreviewHeight(PREVIEW_DISPLAY_HEIGHT);
      return;
    }

    const node = previewRefState;

    const updateHeight = () => {
      setPreviewHeight(node.offsetHeight || PREVIEW_DISPLAY_HEIGHT);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(() => {
      updateHeight();
    });

    resizeObserver.observe(node);

    return () => {
      resizeObserver.disconnect();
    };
  }, [previewRefState]);

  // Fungsi untuk mengunduh preview sebagai gambar PNG
  const handleDownloadPreview = async () => {
    if (!previewRefState || !isDesktopEnvironment()) {
      alert("Download PNG hanya tersedia di browser desktop.");
      return;
    }

    const cleanupAnimations = disableAnimations();
    const cleanupBackground = enforceSolidBackground(previewRefState);

    try {
      await ensurePreviewAssetsReady(previewRefState);

      const dataUrl = shouldUseHtml2CanvasFallback()
        ? await renderWithHtml2Canvas(previewRefState)
        : await renderWithHtmlToImage(previewRefState);

      triggerDownload(
        dataUrl,
        `${activeCopy.downloadFilename}-${activeTheme.id}-${locale}.png`
      );
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
      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-4 py-16">
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

        {/* WRAPPER PREVIEW */}
        <section className="mx-auto flex w-full max-w-[1120px] flex-col gap-6">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">
              {activeCopy.previewTitle}
            </p>
            <p className="mt-2 text-sm text-slate-500">{activeCopy.previewSubtitle}</p>
          </div>

          {/* KOMPONEN PREVIEW STORE */}
          <div className="flex w-full justify-center">
            <div
              ref={previewWrapperRef}
              className="preview-scale-wrapper"
              style={{
                "--preview-scale": `${previewScale}`,
                "--preview-target-width": `${PREVIEW_DISPLAY_WIDTH}px`,
                "--preview-target-height": `${previewHeight}px`,
              } as CSSProperties}
            >
              <div className="preview-scale-inner">
                <ThemePreview
                  locale={locale}
                  theme={activeTheme}
                  setPreviewRef={setPreviewRefState}
                />
              </div>
            </div>
          </div>

          <div className="download-button-shell" aria-live="polite">
            <p className="download-button-note">PNG export (desktop only)</p>
            <button
              type="button"
              onClick={handleDownloadPreview}
              disabled={!previewRefState}
              className="download-button flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
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
    <div className="grid gap-4 md:grid-cols-2 md:items-stretch">
      {stickerThemes.map((theme) => {
        const isActive = activeId === theme.id;
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => onSelect(theme.id)}
            className={`${isActive
              ? "rounded-3xl border-2 border-lime-400 bg-lime-50 shadow-lg"
              : "rounded-3xl border border-slate-200 bg-white hover:border-slate-400"
              } h-full px-6 py-6 text-left transition`}
          >
            <div className="grid h-full grid-rows-[auto_auto_1fr] gap-4">
              <div className="flex items-center justify-between">
                <span className="text-3xl" aria-hidden>
                  {theme.heroEmoji}
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                  {theme.heroBadge}
                </span>
              </div>
              <h2 className="text-2xl font-semibold leading-snug text-slate-900">
                {theme.copy.en.title}
              </h2>
              <p className="text-sm text-slate-500">
                {theme.previewTagline.en}
              </p>
            </div>
          </button>
        );
      })}
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
      data-preview-root="true"
      className="preview-card rounded-[36px] border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.08)] cursor-default"
      // Klik di sembarang area kosong akan me-reset zoom stiker
      onClick={() => setZoomedId(null)}
    >
      <div className="flex items-center justify-between border-b border-slate-100 p-5 pb-2 text-sm uppercase tracking-[0.35em] text-slate-500">
        <span>LINE STORE</span>
        <div className="flex items-center gap-4 text-base text-slate-400">
          <span>↑</span>
          <span>✕</span>
        </div>
      </div>

      <div className="flex flex-col items-center px-12 pb-10 pt-5 text-center">
        <div className="flex h-44 w-44 items-center justify-center rounded-[36px] border border-slate-200 bg-slate-50 overflow-hidden">
          <div className="h-full w-full">
            <img
              src={theme.logo}
              alt={logoAlt}
              className="h-full w-full object-cover select-none"
              draggable={false}
            />
          </div>
        </div>
        <span className="mt-8 rounded-full border border-slate-200 bg-slate-50 px-6 py-2 text-sm text-slate-500">
          {copy.brandTag}
        </span>
        <h3 className="mt-5 text-[32px] font-semibold leading-tight">{copy.title}</h3>
        <p className="text-base text-slate-500">{copy.validity}</p>
      </div>

      <div className="space-y-6 px-12 pb-8">
        <div className="rounded-3xl border border-slate-100 bg-slate-50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base font-semibold">{copy.accountTitle}</p>
              <p className="text-sm text-slate-500">{copy.sponsorTagline}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white">
              <img
                src="/stickers/kopikenangan.png"
                alt="Kopi Kenangan logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                loading="lazy"
                decoding="async"
                crossOrigin="anonymous"
                draggable={false}
              />
            </div>
          </div>
          <button
            type="button"
            className="mt-5 w-full flex items-center justify-center gap-2 rounded-2xl px-5 py-4 text-base font-bold whitespace-nowrap transition hover:brightness-105 active:scale-[0.98]"
            style={{ backgroundColor: LINE_GREEN, color: "#ffffff" }}
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>

            <span>{copy.buttonLabel}</span>
          </button>
        </div>

        {/* Teks Deskripsi akan memudar jika ada stiker yang di-zoom */}
        <p className={`text-[15px] leading-relaxed text-slate-500 transition-opacity duration-300 ${zoomedId ? 'opacity-30' : 'opacity-100'}`}>
          {copy.description}
        </p>
      </div>

      {/* Area Grid Stiker */}
      <div className="relative px-6 pb-8 pt-2">
        {/* UBAH DI SINI: PERMINTAAN USER 1 
          "Decorating (photos/profile) supported" ganti jadi "Decorating (photos/profile) not supported"
        */}
        <div className={`mb-8 ml-2 flex items-center gap-2 text-sm text-slate-400 transition-opacity duration-300 ${zoomedId ? 'opacity-30' : 'opacity-100'}`}>
          <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-400 text-[10px]">i</span>
          Decorating (photos/profile) not supported
        </div>

        {/* Grid Stiker */}
        <div className="grid grid-cols-4 gap-x-4 gap-y-8 relative z-10">
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
                    size={84}
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
      <div className={`flex justify-center border-t border-slate-100 p-4 pt-4 transition-opacity duration-300 ${zoomedId ? 'opacity-30' : 'opacity-100'}`}>
        <p className="text-base font-medium tracking-tight text-slate-400">
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

async function renderWithHtmlToImage(node: HTMLElement) {
  const { clone, cleanup, exportWidth, exportHeight, displayWidth, displayHeight, exportScale } =
    prepareNodeForExport(node);
  try {
    return await toPng(clone, {
      cacheBust: true,
      backgroundColor: "#ffffff",
      pixelRatio: Math.max(window.devicePixelRatio || 1, 2),
      width: exportWidth,
      height: exportHeight,
      style: {
        transform: `scale(${exportScale})`,
        transformOrigin: "top left",
        width: `${displayWidth}px`,
        height: `${displayHeight}px`,
      },
    });
  } finally {
    cleanup();
  }
}

async function renderWithHtml2Canvas(node: HTMLElement) {
  const { clone, cleanup, exportWidth, exportHeight, displayWidth, displayHeight, exportScale } =
    prepareNodeForExport(node);
  try {
    const canvas = await html2canvas(clone, {
      scale: Math.max(window.devicePixelRatio || 1, 2),
      useCORS: true,
      allowTaint: false,
      width: exportWidth,
      height: exportHeight,
      backgroundColor: "#ffffff",
      logging: false,
      removeContainer: true,
      onclone: (clonedDoc) => {
        const clonedPreview = clonedDoc.querySelector<HTMLElement>("[data-preview-root='true']");
        if (clonedPreview) {
          clonedPreview.style.transform = `scale(${exportScale})`;
          clonedPreview.style.transformOrigin = "top left";
          clonedPreview.style.width = `${displayWidth}px`;
          clonedPreview.style.height = `${displayHeight}px`;
          normalizeColorsForCanvas(clonedPreview);
        }
      },
    });

    return canvas.toDataURL("image/png");
  } finally {
    cleanup();
  }
}

function prepareNodeForExport(node: HTMLElement) {
  const root = getPreviewRoot(node);
  if (!root) {
    return {
      clone: node,
      cleanup: () => { },
      displayWidth: PREVIEW_DISPLAY_WIDTH,
      displayHeight: PREVIEW_DISPLAY_HEIGHT,
      exportWidth: PREVIEW_EXPORT_WIDTH,
      exportHeight: Math.round(PREVIEW_DISPLAY_HEIGHT * (PREVIEW_EXPORT_WIDTH / PREVIEW_DISPLAY_WIDTH)),
      exportScale: PREVIEW_EXPORT_WIDTH / PREVIEW_DISPLAY_WIDTH,
    };
  }

  const rect = root.getBoundingClientRect();
  const displayWidth = rect.width || PREVIEW_DISPLAY_WIDTH;
  const displayHeight = rect.height || PREVIEW_DISPLAY_HEIGHT;
  const exportWidth = PREVIEW_EXPORT_WIDTH;
  const exportScale = exportWidth / displayWidth;
  const exportHeight = Math.round(displayHeight * exportScale);

  const clone = root.cloneNode(true) as HTMLElement;
  clone.style.transform = "none";
  clone.style.position = "absolute";
  clone.style.top = "0";
  clone.style.left = "0";
  clone.style.width = `${displayWidth}px`;
  clone.style.height = `${displayHeight}px`;
  clone.style.backgroundColor = "#ffffff";
  clone.style.boxShadow = "none";
  clone.classList.add("download-clone");

  root.appendChild(clone);

  return {
    clone,
    cleanup: () => {
      clone.remove();
    },
    displayWidth,
    displayHeight,
    exportWidth,
    exportHeight,
    exportScale,
  };
}

function getPreviewRoot(node: HTMLElement) {
  if (node.matches('[data-preview-root="true"]')) {
    return node;
  }
  return node.querySelector<HTMLElement>('[data-preview-root="true"]');
}

function triggerDownload(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function shouldUseHtml2CanvasFallback() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent || "";
  const isIOS = /iP(ad|hone|od)/i.test(ua);
  const isMacSafari =
    /Macintosh/.test(ua) && /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS|EdgiOS/i.test(ua);

  return isIOS || isMacSafari;
}

function isDesktopEnvironment() {
  if (typeof navigator === "undefined") return true;
  const ua = navigator.userAgent || "";
  const isMobile = /Mobi|Android|iP(ad|hone|od)/i.test(ua);
  return !isMobile;
}

const COLOR_PROPS: Array<[keyof CSSStyleDeclaration, string]> = [
  ["color", "color"],
  ["backgroundColor", "background-color"],
  ["borderTopColor", "border-top-color"],
  ["borderRightColor", "border-right-color"],
  ["borderBottomColor", "border-bottom-color"],
  ["borderLeftColor", "border-left-color"],
  ["outlineColor", "outline-color"],
  ["textDecorationColor", "text-decoration-color"],
  ["columnRuleColor", "column-rule-color"],
  ["caretColor", "caret-color"],
  ["fill", "fill"],
  ["stroke", "stroke"],
];

const MODERN_COLOR_PATTERN = /(oklch|oklab|lch|lab|color\(|var\()/i;
const toRgb = converter("rgb");

function normalizeColorsForCanvas(root: HTMLElement) {
  const doc = root.ownerDocument;
  const view = doc.defaultView;
  if (!view) return;

  const elements: HTMLElement[] = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];

  for (const element of elements) {
    const computed = view.getComputedStyle(element);
    for (const [, cssProp] of COLOR_PROPS) {
      const value = computed.getPropertyValue(cssProp);
      if (!value || !MODERN_COLOR_PATTERN.test(value)) continue;
      const normalized = convertModernColor(value.trim());
      if (normalized) {
        element.style.setProperty(cssProp, normalized, "important");
      }
    }
  }
}

function convertModernColor(value: string) {
  const parsed = parseColor(value);
  if (!parsed) {
    return null;
  }

  const rgbColor = toRgb(parsed);
  if (!rgbColor) {
    return null;
  }

  const clamp = (channel: number) => Math.max(0, Math.min(255, Math.round(channel * 255)));

  const alpha = typeof rgbColor.alpha === "number" ? rgbColor.alpha : 1;
  const r = clamp(rgbColor.r ?? 0);
  const g = clamp(rgbColor.g ?? 0);
  const b = clamp(rgbColor.b ?? 0);

  if (alpha >= 1) {
    return `rgb(${r}, ${g}, ${b})`;
  }

  const normalizedAlpha = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${Number(normalizedAlpha.toFixed(4))})`;
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
