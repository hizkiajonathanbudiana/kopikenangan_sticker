declare module "culori" {
  export interface CuloriColor {
    [key: string]: unknown;
  }

  export interface CuloriRgbColor {
    mode: "rgb";
    r?: number;
    g?: number;
    b?: number;
    alpha?: number;
    [key: string]: unknown;
  }

  export type CuloriConverter = (color: CuloriColor) => CuloriRgbColor | null;

  export function parse(color: string): CuloriColor | undefined;
  export function converter(mode: "rgb"): CuloriConverter;
}
