/**
 * The "how to" steps and common questions shown under each tool.
 * Written in plain words for people new to these tasks; also read by search engines.
 */
export type ToolGuide = {
  /** The task as people search for it, e.g. "merge PDF files". Used in "How to …". */
  task: string;
  steps: string[];
  faqs: Array<{ q: string; a: string }>;
};

const private_ = {
  q: "Are my files uploaded anywhere?",
  a: "No. The tool runs inside your web browser, so your files stay on your own phone or computer. Nothing is sent to our servers.",
};

const free = {
  q: "Is it really free?",
  a: "Yes. There is no sign-up, no watermark and no limit on how many times you use it.",
};

const phone = (thing: string) => ({
  q: "Does it work on a phone?",
  a: `Yes. It works in Chrome, Safari and other modern browsers on Android phones, iPhones, tablets and computers. Very large ${thing} work best on a computer.`,
});

const videoPrivate = {
  q: "Is my video uploaded?",
  a: "No. The video is processed inside your browser, on your own device. Nothing is uploaded, so even private videos stay private.",
};

const videoSpeed = {
  q: "Why does it take a while?",
  a: "Your own device does the work, so speed depends on its power and the video's length. A short phone clip usually takes seconds; a long 4K video can take minutes. Keep the tab open until it finishes.",
};

export const toolGuides: Record<string, ToolGuide> = {
  "merge-pdf": {
    task: "merge PDF files",
    steps: [
      "Tap “Choose files” and pick two or more PDFs.",
      "Use the up and down arrows to put them in the right order.",
      "Tap “Join PDFs”, then download your single PDF.",
    ],
    faqs: [
      { q: "How many PDFs can I join?", a: "As many as your device can hold in memory. Dozens of normal documents are fine on most phones and computers." },
      { q: "Will the quality change?", a: "No. Pages are copied exactly as they are, so text, pictures and links look the same as before." },
      { q: "Can I join a password-protected PDF?", a: "Not yet. Remove the password first (you need to know it), then add the file again." },
      phone("PDFs"),
      private_,
    ],
  },
  "split-pdf": {
    task: "split a PDF",
    steps: [
      "Choose the PDF you want to split.",
      "Pick how to split it: by page ranges you type, every few pages, or one file per page.",
      "Tap “Split PDF”, then download each part or all of them in one ZIP file.",
    ],
    faqs: [
      { q: "How do I type page ranges?", a: "Separate parts with commas. For example, “1-3, 4-6, 7” makes three PDFs: pages 1 to 3, pages 4 to 6, and page 7." },
      { q: "How do I open the ZIP file?", a: "On Windows and Mac, double-click it. On Android, open it in the Files app. On iPhone, tap it in the Files app to unpack it." },
      { q: "Does splitting change my original PDF?", a: "No. Your original file is not changed; you get new copies of the parts." },
      private_,
    ],
  },
  "jpg-to-pdf": {
    task: "convert JPG to PDF",
    steps: [
      "Choose one or more photos (JPG, PNG or WebP).",
      "Put them in order with the arrows. Each photo becomes one page.",
      "Pick a page size and border, then tap “Make PDF”.",
    ],
    faqs: [
      { q: "My phone photo was sideways. Will the PDF be sideways too?", a: "No. The tool reads the photo's rotation the way your phone does and places it the right way up." },
      { q: "Which page size should I choose?", a: "Choose A4 for India, the UK, Europe and most of the world, and US Letter for the US and Canada. “Same as photo” makes each page exactly the size of its picture." },
      { q: "Will my photos lose quality?", a: "Upright JPG and PNG photos are placed in the PDF unchanged, so they keep their full quality." },
      phone("photo sets"),
      private_,
    ],
  },
  "pdf-to-jpg": {
    task: "convert PDF to JPG",
    steps: [
      "Choose your PDF.",
      "Pick JPG or PNG, a quality level, and all pages or just some.",
      "Tap “Save as JPG”, then download each picture or all of them as a ZIP.",
    ],
    faqs: [
      { q: "What does DPI mean?", a: "Dots per inch. Higher means a sharper, larger picture. 150 DPI is clear on any screen; choose 300 DPI if you will print the picture." },
      { q: "JPG or PNG?", a: "JPG makes smaller files and is best for photos. PNG keeps text and lines perfectly sharp, but the files are larger." },
      { q: "Can I convert just one page?", a: "Yes. Choose “Some pages” and type the page number, like 3, or a range like 2-4." },
      private_,
    ],
  },
  "rotate-pdf": {
    task: "rotate PDF pages",
    steps: [
      "Choose the PDF with the sideways or upside-down pages.",
      "Pick the turn: 90° right, 90° left or 180°.",
      "Turn every page, or only the pages you pick, then download.",
    ],
    faqs: [
      { q: "Can I rotate only one page?", a: "Yes. Choose “Selected Pages” and tap the page, or type its number in “Multiple Page Range”." },
      { q: "Does rotating reduce quality?", a: "No. Only the page direction changes; the content is not redrawn." },
      private_,
    ],
  },
  "extract-pdf-pages": {
    task: "extract pages from a PDF",
    steps: ["Choose your PDF.", "Pick the pages you want to keep, or type them, like 1-3, 7.", "Download a new PDF with only those pages."],
    faqs: [
      { q: "What is the difference between extract and split?", a: "Extract makes one new PDF from the pages you pick. Split cuts a PDF into several separate files." },
      { q: "Is my original PDF changed?", a: "No. You get a new file; the original stays as it was." },
      private_,
    ],
  },
  "delete-pdf-pages": {
    task: "delete pages from a PDF",
    steps: [
      "Choose your PDF. You will see a small picture of every page.",
      "Tap the pages you want to remove. They turn red.",
      "Tap “Download new PDF” to save the PDF without them.",
    ],
    faqs: [
      { q: "Can I type page numbers instead of tapping?", a: "Yes. Type them in the box, like “2, 5-7”, and the pages are marked for you." },
      { q: "I removed the wrong page. What now?", a: "Tap the page again to keep it. Nothing is changed until you download, and your original file is never changed." },
      private_,
    ],
  },
  "compress-pdf": {
    task: "compress a PDF",
    steps: [
      "Choose the PDF you want to make smaller.",
      "Pick how small: Light, Recommended, Strong or Smallest.",
      "Tap “Make PDF smaller”, check the new size, then download.",
    ],
    faqs: [
      { q: "How much smaller will my PDF get?", a: "PDFs with photos or scans often shrink by 50–90%. PDFs that are mostly typed text are already small, and the tool will tell you if it can't save much." },
      { q: "Will my text still be sharp?", a: "Yes, with Light, Recommended and Strong. Only photos inside the PDF are made lighter; text and lines are not touched and can still be selected and searched." },
      { q: "When should I use “Smallest”?", a: "For scanned documents and photo-heavy PDFs that must fit an upload limit. Each page becomes a picture, so text can no longer be selected." },
      { q: "How do I get a PDF under 1 MB or 200 KB for a form?", a: "Start with Recommended. If it is still too big, try Strong, then Smallest." },
      phone("PDFs"),
      private_,
    ],
  },

  "video-trimmer": {
    task: "trim a video",
    steps: ["Choose your video.", "Drag the start and end handles, or type exact times.", "Download the trimmed clip."],
    faqs: [
      { q: "Which video types work?", a: "MP4, MOV, WebM, MKV and AVI, including videos recorded on Android phones and iPhones." },
      { q: "Does trimming lower the quality?", a: "When possible the tool cuts without re-encoding, so the quality stays exactly the same." },
      videoPrivate,
      videoSpeed,
    ],
  },
  "video-cropper": {
    task: "crop a video",
    steps: ["Choose your video.", "Drag the box, or pick a shape like 9:16 for Reels or 1:1 for posts.", "Download the cropped video."],
    faqs: [
      { q: "Which shape should I use for Instagram Reels or YouTube Shorts?", a: "Use 9:16 (tall). For a square feed post use 1:1, and for YouTube use 16:9." },
      videoPrivate,
      videoSpeed,
    ],
  },
  "video-resizer": {
    task: "resize a video",
    steps: ["Choose your video.", "Pick a size like 1080p or 720p, or type your own width and height.", "Download the resized video."],
    faqs: [
      { q: "Will a smaller size make the file smaller?", a: "Usually yes. Going from 1080p to 720p often cuts the file size a lot. For the smallest file, use the Video Compressor." },
      videoPrivate,
      videoSpeed,
    ],
  },
  "video-flipper": {
    task: "flip a video",
    steps: ["Choose your video.", "Pick left–right (mirror) or upside-down.", "Download the flipped video."],
    faqs: [
      { q: "Why is my selfie video mirrored?", a: "Many front cameras save a mirror image. Flip it left–right to make writing read the right way." },
      { q: "Is flipping the same as rotating?", a: "No. Flipping makes a mirror image. To turn a sideways video upright, use the Video Rotator." },
      videoPrivate,
    ],
  },
  "video-rotator": {
    task: "rotate a video",
    steps: ["Choose the sideways video.", "Turn it 90° right, 90° left or 180°.", "Download the video the right way up."],
    faqs: [
      { q: "Does rotating lower the quality?", a: "No. The tool changes the video's direction setting without re-encoding, so quality stays exactly the same and it is very fast." },
      videoPrivate,
    ],
  },
  "video-converter": {
    task: "convert a video",
    steps: ["Choose your video.", "Pick the new format: MP4, WebM, MOV, MKV, AVI or GIF.", "Download the converted file."],
    faqs: [
      { q: "Which format should I choose?", a: "MP4 plays almost everywhere: phones, WhatsApp, YouTube and computers. Choose WebM for websites and MOV for Apple editing apps." },
      videoPrivate,
      videoSpeed,
    ],
  },
  "video-to-gif": {
    task: "make a GIF from a video",
    steps: ["Choose your video.", "Pick the part you want, up to a few seconds.", "Choose the width and frames per second, then download the GIF."],
    faqs: [
      { q: "Why is my GIF file big?", a: "GIFs store every frame as a picture. Shorter clips, a smaller width and fewer frames per second make much smaller files." },
      videoPrivate,
    ],
  },
  "gif-to-video": {
    task: "convert a GIF to video",
    steps: ["Choose your GIF.", "Pick MP4, WebM or MOV.", "Download the video."],
    faqs: [
      { q: "Why turn a GIF into a video?", a: "Videos are often 5–10 times smaller than GIFs and play smoothly on WhatsApp, Instagram and websites." },
      videoPrivate,
    ],
  },
  "video-compressor": {
    task: "compress a video",
    steps: ["Choose your video.", "Let the tool test it and find the smallest file that still looks like the original.", "Compare, then download."],
    faqs: [
      { q: "How do I make a video small enough for WhatsApp or email?", a: "Compress it here. Phone videos often shrink by half or more with no visible change." },
      { q: "Will the video look worse?", a: "The tool compares the picture against your original and keeps quality close to it, so most people see no difference." },
      videoPrivate,
      videoSpeed,
    ],
  },

  converter: {
    task: "convert a file",
    steps: ["Choose your file.", "Pick the format you want from the options shown.", "Download the converted file."],
    faqs: [
      { q: "Which formats are supported?", a: "Pictures such as JPG, PNG, WebP, AVIF, BMP, TIFF, ICO and SVG, and PDF. The tool only shows conversions that work for your file." },
      private_,
      free,
    ],
  },
  "image-compressor": {
    task: "compress an image",
    steps: ["Choose your photo (JPG, PNG or WebP).", "Move the quality slider and compare the preview.", "Download the smaller image."],
    faqs: [
      { q: "How do I reduce a photo to under 100 KB or 50 KB?", a: "Lower the quality slider and watch the new size. If it's still too big, make the picture smaller with the Image Resizer first." },
      { q: "Why doesn't my PNG get much smaller?", a: "PNG is a lossless format. For the biggest saving, save photos as JPG or WebP." },
      private_,
    ],
  },
  "image-resizer": {
    task: "resize an image",
    steps: ["Choose your picture.", "Type a new width and height, or pick a percentage.", "Download the resized image."],
    faqs: [
      { q: "How do I keep the picture from stretching?", a: "Keep the aspect ratio lock on. Then changing the width changes the height to match." },
      { q: "Which sizes do forms usually ask for?", a: "Passport photos and signatures in online forms often need exact pixel sizes, like 200 × 230. Type the size the form gives." },
      private_,
    ],
  },
  "image-cropper": {
    task: "crop an image",
    steps: ["Choose your picture.", "Drag the box, or pick a shape like 1:1 or 16:9.", "Download the cropped image."],
    faqs: [
      { q: "Which shape is best for social media?", a: "1:1 for Instagram posts and profile photos, 9:16 for Stories and Reels, and 16:9 for YouTube thumbnails." },
      private_,
    ],
  },

  "json-validator": {
    task: "validate JSON",
    steps: ["Paste your JSON, or choose a .json file.", "See any mistake with its line number.", "Fix it, format it neatly, and download or copy it."],
    faqs: [
      { q: "What are the most common JSON mistakes?", a: "A comma after the last item, single quotes instead of double quotes, and keys without quotes." },
      private_,
    ],
  },

  "emi-calculator": {
    task: "calculate loan EMI",
    steps: ["Type the loan amount.", "Type the yearly interest rate and the loan length.", "See your monthly EMI, total interest and total amount to pay."],
    faqs: [
      { q: "What is EMI?", a: "Equated Monthly Instalment: the fixed amount you pay every month until a loan is fully repaid. Part of it pays interest and part repays the loan." },
      { q: "How is EMI worked out?", a: "EMI = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), where P is the loan amount, r is the monthly interest rate and n is the number of months." },
      { q: "Does it work for home, car and personal loans?", a: "Yes. The formula is the same for any loan with a fixed interest rate." },
    ],
  },
  "gst-calculator": {
    task: "calculate GST",
    steps: ["Type the amount.", "Pick the GST rate, such as 5% or 18%.", "Choose to add GST or remove it, and see CGST and SGST."],
    faqs: [
      { q: "How do I add GST to a price?", a: "Multiply by (1 + rate). For 18% GST on ₹1,000: ₹1,000 × 1.18 = ₹1,180." },
      { q: "How do I remove GST from a price?", a: "Divide by (1 + rate). For a price of ₹1,180 including 18% GST: ₹1,180 ÷ 1.18 = ₹1,000 before GST." },
      { q: "What are CGST and SGST?", a: "For sales within one state, GST is split equally: half to the central government (CGST) and half to the state (SGST)." },
    ],
  },
  "sip-calculator": {
    task: "calculate SIP returns",
    steps: ["Type how much you will invest each month.", "Type the expected yearly return and the number of years.", "See how much you invest, the estimated gain and the final value."],
    faqs: [
      { q: "What is a SIP?", a: "A Systematic Investment Plan: investing a fixed amount in a mutual fund every month." },
      { q: "Are the results guaranteed?", a: "No. The result is an estimate based on the return you type. Real market returns go up and down." },
    ],
  },
  "fd-calculator": {
    task: "calculate FD interest",
    steps: ["Type the deposit amount.", "Type the interest rate, the length and how often interest is added.", "See the interest earned and the maturity amount."],
    faqs: [
      { q: "What does compounding mean?", a: "Interest is added to your deposit, and then earns interest itself. Most Indian banks add interest every quarter." },
      { q: "Is FD interest taxed?", a: "In India, FD interest is added to your income and taxed at your slab rate. Banks may deduct TDS." },
    ],
  },
  "age-calculator": {
    task: "calculate age",
    steps: ["Choose the date of birth.", "Optionally change the “age on” date.", "See the exact age in years, months and days, and the next birthday."],
    faqs: [
      { q: "How do I find my age on a specific date?", a: "Change the “age on” date, for example to an exam or job application cut-off date." },
      { q: "Does it handle leap years?", a: "Yes. It counts real calendar days, including 29 February." },
    ],
  },

  "english-to-telugu": {
    task: "type in Telugu",
    steps: ["Type Telugu words using English letters, like “namaskaram”.", "See the Telugu letters appear as you type.", "Copy the Telugu text and paste it anywhere."],
    faqs: [
      { q: "Is this a translator?", a: "It writes Telugu sounds in Telugu letters (transliteration). Type how the word sounds, not its English meaning." },
      { q: "Can I use the text in WhatsApp or Word?", a: "Yes. The text is normal Unicode Telugu, so it pastes correctly into WhatsApp, Word, Google Docs and social media." },
    ],
  },
  "qr-generator": {
    task: "make a QR code",
    steps: ["Pick what the QR code is for: website, text, Wi-Fi, WhatsApp, contact and more.", "Fill in the details.", "Download the QR code as PNG or SVG."],
    faqs: [
      { q: "Do the QR codes expire?", a: "No. The information is stored inside the QR code itself, so it works forever and doesn't depend on our website." },
      { q: "PNG or SVG?", a: "PNG works everywhere. SVG stays perfectly sharp at any size, so it is best for printing posters and banners." },
      free,
    ],
  },
  "speed-test": {
    task: "test internet speed",
    steps: ["Tap Start.", "Wait while download, upload, ping and jitter are measured.", "Read your results and connection quality."],
    faqs: [
      { q: "What is a good internet speed?", a: "For HD video calls and streaming, 10–25 Mbps download is usually enough. For 4K streaming or a busy home, 50 Mbps or more helps." },
      { q: "What are ping and jitter?", a: "Ping is how long data takes to make a round trip. Jitter is how much that time changes. Lower is better for calls and games." },
      { q: "Why are my results different each time?", a: "Speeds change with Wi-Fi signal, other devices using the network and how busy your provider is. Run the test a few times." },
    ],
  },
};
