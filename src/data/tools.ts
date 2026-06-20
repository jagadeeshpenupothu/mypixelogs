import type { Tool } from "@/types/tool";

export const tools: Tool[] = [
  {
    id: "merge-pdf",
    name: "Merge PDF",
    slug: "merge-pdf",
    description: "Combine multiple PDF files into one organized document.",
    icon: "Files",
  },
  {
    id: "split-pdf",
    name: "Split PDF",
    slug: "split-pdf",
    description: "Extract pages or separate large documents into smaller PDFs.",
    icon: "SplitSquareHorizontal",
  },
  {
    id: "compress-pdf",
    name: "Compress PDF",
    slug: "compress-pdf",
    description: "Reduce PDF file size while preserving quality for sharing.",
    icon: "Archive",
  },
  {
    id: "jpg-to-pdf",
    name: "JPG to PDF",
    slug: "jpg-to-pdf",
    description: "Turn JPG images into a clean, portable PDF file.",
    icon: "ImagePlus",
  },
  {
    id: "pdf-to-jpg",
    name: "PDF to JPG",
    slug: "pdf-to-jpg",
    description: "Export PDF pages as high-quality JPG images.",
    icon: "FileImage",
  },
];
