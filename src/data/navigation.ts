import type { ToolCategory } from "@/types/tool";

/** The main menu: the same words everywhere on the site. */
export const mainNav = [
  { href: "/tools/video-tools", label: "Video" },
  { href: "/tools/image-tools", label: "Image" },
  { href: "/tools/pdf-tools", label: "PDF" },
  { href: "/tools/calculator-tools", label: "Calculators" },
  { href: "/templates", label: "Templates" },
  { href: "/ai", label: "AI prompts" },
];

/** One colour per kind of tool, so people can recognise a group before reading it. */
export const categoryLooks: Record<ToolCategory, { short: string; icon: string; tone: string }> = {
  "Video Tools": { short: "Video", icon: "Clapperboard", tone: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  "Image Tools": { short: "Image", icon: "ImageDown", tone: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  "PDF Tools": { short: "PDF", icon: "FileText", tone: "bg-rose-500/10 text-rose-700 dark:text-rose-300" },
  "Calculator Tools": { short: "Calculators", icon: "Calculator", tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  "Text & Language Tools": { short: "Text", icon: "Languages", tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  "Developer Tools": { short: "Developer", icon: "Braces", tone: "bg-slate-500/10 text-slate-700 dark:text-slate-300" },
  "Business Tools": { short: "Business", icon: "ReceiptText", tone: "bg-teal-500/10 text-teal-700 dark:text-teal-300" },
  "Design Tools": { short: "Design", icon: "Palette", tone: "bg-pink-500/10 text-pink-700 dark:text-pink-300" },
  "Utility Tools": { short: "QR & more", icon: "QrCode", tone: "bg-orange-500/10 text-orange-700 dark:text-orange-300" },
};

/** What each tool does, in the words a beginner would use. */
export const toolTasks: Record<string, string> = {
  "video-trimmer": "Cut out just the part you want",
  "video-cropper": "Remove the edges or change the shape",
  "video-resizer": "Change to 1080p, 720p or any size",
  "video-flipper": "Mirror a video left or right",
  "video-converter": "Change to MP4, WebM, MOV or GIF",
  "video-to-gif": "Turn a short clip into a GIF",
  "gif-to-video": "Turn a GIF into an MP4 video",
  "video-compressor": "Make a video file smaller",
  "video-rotator": "Turn a sideways video the right way",
  converter: "Change a file to another format",
  "image-compressor": "Make a photo file smaller",
  "image-resizer": "Change a photo's width and height",
  "image-cropper": "Cut a photo to the part you want",
  "rotate-pdf": "Turn PDF pages the right way up",
  "extract-pdf-pages": "Save only the pages you need",
  "merge-pdf": "Join several PDFs into one",
  "split-pdf": "Cut one PDF into separate files",
  "compress-pdf": "Make a PDF file smaller",
  "jpg-to-pdf": "Turn photos into a PDF",
  "pdf-to-jpg": "Save PDF pages as pictures",
  "delete-pdf-pages": "Remove pages you don't need",
  "json-validator": "Find mistakes in JSON code",
  "emi-calculator": "Work out your monthly loan payment",
  "gst-calculator": "Add or remove GST from a price",
  "sip-calculator": "See how monthly investing can grow",
  "fd-calculator": "See what a fixed deposit will pay",
  "age-calculator": "Find your exact age in years and days",
  "english-to-telugu": "Type in English, get Telugu letters",
  "qr-generator": "Make a QR code for a link or text",
  "speed-test": "Check how fast your internet is",
};

/** The jobs most people come for, shown first on the home page. */
export const popularTasks: { href: string; title: string; note: string; icon: string; category: ToolCategory }[] = [
  { href: "/tools/video-compressor", title: "Make a video smaller", note: "For WhatsApp or email", icon: "Archive", category: "Video Tools" },
  { href: "/tools/video-trimmer", title: "Trim a video", note: "Cut the start or end", icon: "Scissors", category: "Video Tools" },
  { href: "/tools/image-compressor", title: "Make a photo smaller", note: "Keep it looking good", icon: "ImageDown", category: "Image Tools" },
  { href: "/tools/merge-pdf", title: "Join PDF files", note: "Combine several into one", icon: "Files", category: "PDF Tools" },
  { href: "/tools/compress-pdf", title: "Make a PDF smaller", note: "For email or upload forms", icon: "Archive", category: "PDF Tools" },
  { href: "/tools/jpg-to-pdf", title: "Photos to PDF", note: "Scan documents with your phone", icon: "ImagePlus", category: "PDF Tools" },
  { href: "/templates/gst-invoice-template/edit", title: "Make a GST invoice", note: "Download Word or PDF", icon: "ReceiptText", category: "Business Tools" },
  { href: "/tools/qr-generator", title: "Make a QR code", note: "For a link, text or Wi-Fi", icon: "QrCode", category: "Utility Tools" },
  { href: "/tools/emi-calculator", title: "Work out a loan EMI", note: "See the monthly payment", icon: "Calculator", category: "Calculator Tools" },
];

export const searchExamples = ["make video smaller", "wedding invitation", "loan EMI", "photo size"];
