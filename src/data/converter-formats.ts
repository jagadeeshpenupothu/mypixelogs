export type ConverterFormat =
  | "png"
  | "jpg"
  | "jpeg"
  | "webp"
  | "svg"
  | "pdf"
  | "ico"
  | "avif"
  | "bmp"
  | "tiff";

export const converterFormats: Record<ConverterFormat, ConverterFormat[]> = {
  png: ["jpg", "jpeg", "webp", "pdf", "avif", "ico", "bmp", "tiff"],
  jpg: ["png", "webp", "pdf", "avif", "ico", "bmp", "tiff"],
  jpeg: ["png", "webp", "pdf", "avif", "ico", "bmp", "tiff"],
  webp: ["png", "jpg", "pdf", "avif", "bmp"],
  svg: ["png", "jpg", "webp", "pdf", "ico"],
  pdf: ["png", "jpg", "webp"],
  ico: ["png", "jpg", "webp"],
  avif: ["png", "jpg", "jpeg", "webp"],
  bmp: ["png", "jpg", "jpeg", "webp"],
  tiff: ["png", "jpg", "jpeg", "webp"],
};

export const converterFormatLabels: Record<ConverterFormat, string> = {
  png: "PNG",
  jpg: "JPG",
  jpeg: "JPEG",
  webp: "WEBP",
  svg: "SVG",
  pdf: "PDF",
  ico: "ICO",
  avif: "AVIF",
  bmp: "BMP",
  tiff: "TIFF",
};

export const uploadFormats = Object.keys(converterFormats) as ConverterFormat[];

export function isConverterFormat(value: string): value is ConverterFormat {
  return uploadFormats.includes(value.toLowerCase() as ConverterFormat);
}

export function getAvailableOutputFormats(format: ConverterFormat): ConverterFormat[] {
  return converterFormats[format] ?? [];
}
