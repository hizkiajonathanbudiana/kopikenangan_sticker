import type React from "react";

export interface ModelViewerElement extends HTMLElement {
  resetTurntableRotation?: () => void;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<ModelViewerElement>,
        ModelViewerElement
      > & {
        src?: string;
        alt?: string;
        poster?: string;
        "environment-image"?: string;
        "exposure"?: number | string;
        "shadow-intensity"?: number | string;
        "shadow-softness"?: number | string;
        "camera-controls"?: boolean | string;
        "auto-rotate"?: boolean | string;
        "auto-rotate-delay"?: number | string;
        "interaction-prompt"?: string;
        "interaction-prompt-threshold"?: number | string;
        "ar"?: boolean | string;
        "ar-modes"?: string;
        "touch-action"?: string;
        "field-of-view"?: string;
        "min-field-of-view"?: string;
        "max-field-of-view"?: string;
        "disable-zoom"?: boolean | string;
        "orbit-sensitivity"?: number | string;
        "camera-orbit"?: string;
        "camera-target"?: string;
        "tone-mapping"?: string;
        "skybox-image"?: string;
      };
    }
  }
}

export {};
