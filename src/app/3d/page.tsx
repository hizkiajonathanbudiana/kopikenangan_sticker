"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, {
    type ChangeEvent,
    type DragEvent,
    type HTMLAttributes,
    Suspense,
    useEffect,
    forwardRef,
    useMemo,
    useRef,
    useState,
} from "react";

const HERO_BADGE = "數位文創應用 | Digital & Cultural";
const HERO_TITLE = "Kopi Kenangan × Batik LINE Stickers";
const HERO_SUBTITLE =
    "Showcasing local Indonesian heritage through digital creativity — now with a dedicated 3D figurine preview inspired by the Mega Mendung universe.";
const HERO_NOTE =
    "(For now only the Mega-Miu 3D preview is available. Drop your own GLB to replace it.)";
const DEFAULT_MODEL_PATH = "/3dmodel.glb";

type ViewerStatus = "idle" | "loading" | "ready" | "error";

type ViewerControls = {
    autoRotate: boolean;
    showShadow: boolean;
    exposure: number;
    rotateSpeed: number;
};

type ModelViewerElement = HTMLElement & {
    resetTurntableRotation?: () => void;
};

type ModelViewerProps = HTMLAttributes<ModelViewerElement> & {
    src?: string;
    alt?: string;
    ar?: boolean | string;
    autoplay?: boolean | string;
    "touch-action"?: string;
    "camera-controls"?: boolean | string;
    "auto-rotate"?: boolean | string;
    "auto-rotate-delay"?: string | number;
    "interaction-prompt"?: string;
    "rotation-per-second"?: string;
    exposure?: number;
    "shadow-intensity"?: string;
    "shadow-softness"?: string;
    "environment-image"?: string;
};

const ModelViewer = forwardRef<ModelViewerElement, ModelViewerProps>((props, ref) => {
    return React.createElement("model-viewer" as any, {
        ...props,
        ref,
    });
});

ModelViewer.displayName = "ModelViewer";

function ThreeDPageContent() {
    const searchParams = useSearchParams();
    const initialModel = searchParams.get("model");
    const sanitizedParam = initialModel && initialModel.trim().length > 0 ? initialModel : null;
    const defaultModel = sanitizedParam ?? DEFAULT_MODEL_PATH;

    const [modelSrc, setModelSrc] = useState<string | null>(defaultModel);
    const [objectUrl, setObjectUrl] = useState<string | null>(null);
    const [status, setStatus] = useState<ViewerStatus>(defaultModel ? "loading" : "idle");
    const [error, setError] = useState<string | null>(null);
    const [urlInput, setUrlInput] = useState(defaultModel ?? "");
    const [controls, setControls] = useState<ViewerControls>({
        autoRotate: true,
        showShadow: true,
        exposure: 1,
        rotateSpeed: 25,
    });

    const viewerRef = useRef<ModelViewerElement | null>(null);

    useEffect(() => {
        void import("@google/model-viewer");
    }, []);

    useEffect(() => {
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [objectUrl]);

    const hasModel = Boolean(modelSrc);

    const viewerStatusLabel = useMemo(() => {
        switch (status) {
            case "loading":
                return "Loading model…";
            case "ready":
                return "Viewer ready";
            case "error":
                return "Failed to load model";
            default:
                return "Awaiting model";
        }
    }, [status]);

    const handleFile = (file: File | undefined | null) => {
        if (!file) return;
        if (!/\.(glb|gltf)$/i.test(file.name)) {
            setError("Please choose a .glb or .gltf file.");
            return;
        }

        setError(null);
        setStatus("loading");

        const url = URL.createObjectURL(file);
        setObjectUrl((previous) => {
            if (previous) URL.revokeObjectURL(previous);
            return url;
        });
        setModelSrc(url);
        setUrlInput(file.name);
    };

    const onFileInput = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        handleFile(file);
    };

    const onDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files?.[0];
        handleFile(file);
    };

    const onDragOver = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
    };

    const onLoadFromUrl = () => {
        if (!urlInput.trim()) {
            setError("Provide a URL or drop a file.");
            return;
        }
        setError(null);
        setStatus("loading");
        setModelSrc(urlInput.trim());
    };

    const onViewerLoad = () => {
        setStatus("ready");
    };

    const onViewerError = () => {
        setStatus("error");
        setError("Model failed to load. Double-check the URL or file integrity.");
    };

    const updateControls = (patch: Partial<ViewerControls>) => {
        setControls((prev) => ({ ...prev, ...patch }));
    };

    return (
        <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
            <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-4 py-16">
                <header className="space-y-4 text-center">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-500">{HERO_BADGE}</p>
                    <h1 className="text-4xl font-semibold leading-tight">Kopi Kenangan × Batik 3D Figurine</h1>
                    <p className="mx-auto max-w-3xl text-base text-slate-500">{HERO_SUBTITLE}</p>
                    <p className="text-xs text-slate-400">{HERO_NOTE}</p>
                    <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs font-medium text-slate-500">
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                            3D figurine preview
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                            Camera orbit, zoom & pan
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                            Powered by &lt;model-viewer&gt;
                        </span>
                    </div>
                </header>

                <section className="grid gap-8 lg:grid-cols-[360px_1fr]">
                    <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                        <h2 className="text-xl font-semibold">3D Figurine Loader</h2>
                        <p className="mt-1 text-sm text-slate-500">
                            Drag in a GLB/GLTF from your desktop or load one from a public URL to replace Mega-Miu.
                        </p>

                        <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                            Default asset:
                            <code className="ml-2 text-[11px] text-slate-700">{DEFAULT_MODEL_PATH}</code>
                        </div>

                        <label
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                            className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition hover:border-lime-400"
                        >
                            <input
                                type="file"
                                accept=".glb,.gltf"
                                className="hidden"
                                onChange={onFileInput}
                            />
                            <span className="text-base font-medium">Drop model here</span>
                            <span className="mt-1 text-xs text-slate-500">or click to browse</span>
                        </label>

                        <div className="mt-5 space-y-3">
                            <label className="text-sm font-medium text-slate-600" htmlFor="model-url">
                                Load via URL
                            </label>
                            <div className="flex gap-2">
                                <input
                                    id="model-url"
                                    type="text"
                                    placeholder="https://.../figurine.glb"
                                    value={urlInput}
                                    onChange={(event) => setUrlInput(event.target.value)}
                                    className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-lime-400 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={onLoadFromUrl}
                                    className="rounded-2xl bg-lime-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:brightness-110"
                                >
                                    Load
                                </button>
                            </div>
                            <p className="text-xs text-slate-500">
                                Works with assets placed in <code>/public</code> or any CORS-enabled URL.
                            </p>
                        </div>

                        <div className="mt-6 space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                                Viewer controls
                            </h3>
                            <div className="flex items-center justify-between text-sm">
                                <span>Auto rotate</span>
                                <input
                                    type="checkbox"
                                    checked={controls.autoRotate}
                                    onChange={(event) => updateControls({ autoRotate: event.target.checked })}
                                    className="h-4 w-4"
                                />
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span>Enable soft shadows</span>
                                <input
                                    type="checkbox"
                                    checked={controls.showShadow}
                                    onChange={(event) => updateControls({ showShadow: event.target.checked })}
                                    className="h-4 w-4"
                                />
                            </div>
                            <label className="flex flex-col gap-2 text-sm">
                                <span>Exposure {controls.exposure.toFixed(1)}</span>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="2.5"
                                    step="0.1"
                                    value={controls.exposure}
                                    onChange={(event) => updateControls({ exposure: Number(event.target.value) })}
                                />
                            </label>
                            <label className="flex flex-col gap-2 text-sm">
                                <span>Rotate speed {controls.rotateSpeed.toFixed(0)}°/s</span>
                                <input
                                    type="range"
                                    min="5"
                                    max="60"
                                    step="1"
                                    value={controls.rotateSpeed}
                                    onChange={(event) => updateControls({ rotateSpeed: Number(event.target.value) })}
                                    disabled={!controls.autoRotate}
                                />
                            </label>
                        </div>

                        <div className="mt-6 text-xs text-slate-500">
                            <p>
                                Tip: open in a modern browser (Chrome, Edge, Safari). Hold <kbd>Shift</kbd> while dragging to pan.
                            </p>
                        </div>

                        <div className="mt-8 text-xs">
                            <Link href="/" className="text-slate-500 underline hover:text-slate-900">
                                ← Back to LINE Sticker lab
                            </Link>
                        </div>
                    </aside>

                    <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.08)]">
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-6 py-4 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-lime-400" />
                                {viewerStatusLabel}
                            </div>
                            <p className="text-xs text-slate-400">Currently showing: Mega-Miu figurine</p>
                            {modelSrc && (
                                <button
                                    type="button"
                                    className="text-xs text-slate-500 underline-offset-4 hover:text-slate-900 hover:underline"
                                    onClick={() => {
                                        viewerRef.current?.resetTurntableRotation?.();
                                    }}
                                >
                                    Reset rotation
                                </button>
                            )}
                        </div>

                        <div className="relative h-[520px] w-full bg-[#e6ebf5]">
                                            {hasModel ? (
                                                <ModelViewer
                                                    ref={(node: ModelViewerElement | null) => {
                                                        viewerRef.current = node;
                                                    }}
                                                    src={modelSrc ?? undefined}
                                                    alt="3D model preview"
                                                    ar
                                                    autoplay
                                                    interaction-prompt="none"
                                                    touch-action="pan-y"
                                                    camera-controls=""
                                                    auto-rotate={controls.autoRotate ? "" : undefined}
                                                    auto-rotate-delay="0"
                                                    rotation-per-second={controls.autoRotate ? `${controls.rotateSpeed}deg` : undefined}
                                                    exposure={controls.exposure}
                                                    shadow-intensity={controls.showShadow ? "1" : "0"}
                                                    shadow-softness={controls.showShadow ? "0.8" : "0"}
                                                    environment-image="neutral"
                                                    style={{ width: "100%", height: "100%" }}
                                                    onLoad={onViewerLoad}
                                                    onError={onViewerError}
                                                />
                                            ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-center text-slate-500">
                                    <span className="text-4xl">🧊</span>
                                    <p className="max-w-sm text-base text-slate-500">
                                        Drop a GLB/GLTF to start exploring it in 3D.
                                    </p>
                                </div>
                            )}

                            {error && (
                                <div className="pointer-events-none absolute bottom-6 left-1/2 w-[90%] max-w-md -translate-x-1/2 rounded-2xl border border-rose-200 bg-white/90 px-4 py-2 text-center text-sm text-rose-500 shadow-lg">
                                    {error}
                                </div>
                            )}
                        </div>
                    </section>
                </section>
            </main>
        </div>
    );
}

export default function ThreeDPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb] text-slate-500">
                    Loading 3D viewer…
                </div>
            }
        >
            <ThreeDPageContent />
        </Suspense>
    );
}
