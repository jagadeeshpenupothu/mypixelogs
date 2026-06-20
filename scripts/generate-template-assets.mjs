import fs from "node:fs";

const templates = [
  ["hotel-invoice-template", "Hotel Invoice Template"],
  ["restaurant-invoice-template", "Restaurant Invoice Template"],
  ["gst-invoice-template", "GST Invoice Template"],
  ["freelancer-invoice-template", "Freelancer Invoice Template"],
  ["retail-invoice-template", "Retail Invoice Template"],
  ["rent-receipt-template", "Rent Receipt"],
  ["payment-receipt-template", "Payment Receipt"],
  ["cash-receipt-template", "Cash Receipt"],
  ["school-fee-receipt-template", "School Fee Receipt"],
  ["fresher-resume-template", "Fresher Resume"],
  ["banking-resume-template", "Banking Resume"],
  ["teacher-resume-template", "Teacher Resume"],
  ["software-engineer-resume-template", "Software Engineer Resume"],
  ["accountant-resume-template", "Accountant Resume"],
  ["corporate-letterhead-template", "Corporate Letterhead"],
  ["school-letterhead-template", "School Letterhead"],
  ["hospital-letterhead-template", "Hospital Letterhead"],
  ["construction-letterhead-template", "Construction Letterhead"],
  ["participation-certificate-template", "Participation Certificate"],
  ["internship-certificate-template", "Internship Certificate"],
  ["appreciation-certificate-template", "Appreciation Certificate"],
  ["training-certificate-template", "Training Certificate"],
];

fs.mkdirSync("public/previews", { recursive: true });
fs.mkdirSync("public/downloads", { recursive: true });

for (const [slug, title] of templates) {
  const escapedTitle = title.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="850" viewBox="0 0 1200 850">
  <rect width="1200" height="850" fill="#eff6ff"/>
  <rect x="120" y="80" width="960" height="690" rx="18" fill="#ffffff" stroke="#dbeafe" stroke-width="3"/>
  <rect x="180" y="145" width="180" height="18" rx="9" fill="#2563eb"/>
  <rect x="180" y="205" width="600" height="24" rx="12" fill="#cbd5e1"/>
  <rect x="180" y="250" width="430" height="18" rx="9" fill="#e2e8f0"/>
  <rect x="180" y="330" width="840" height="2" fill="#e5e7eb"/>
  <rect x="180" y="380" width="240" height="120" rx="10" fill="#dbeafe"/>
  <rect x="480" y="380" width="240" height="120" rx="10" fill="#bfdbfe"/>
  <rect x="780" y="380" width="240" height="120" rx="10" fill="#e0f2fe"/>
  <rect x="180" y="570" width="840" height="20" rx="10" fill="#e2e8f0"/>
  <rect x="180" y="615" width="620" height="20" rx="10" fill="#e2e8f0"/>
  <text x="180" y="705" fill="#111827" font-family="Arial, sans-serif" font-size="44" font-weight="700">${escapedTitle}</text>
  <text x="180" y="745" fill="#2563eb" font-family="Arial, sans-serif" font-size="24" font-weight="700">mypixelogs preview</text>
</svg>`;

  fs.writeFileSync(`public/previews/${slug}.svg`, svg);

  const safeTitle = title.replace(/[()\\]/g, "");
  const pdf = `%PDF-1.4
1 0 obj<< /Type /Catalog >>endobj
2 0 obj<< /Length 80 >>stream
BT /F1 24 Tf 72 720 Td (${safeTitle}) Tj ET
endstream
endobj
trailer<< /Root 1 0 R >>
%%EOF
`;

  fs.writeFileSync(`public/downloads/${slug}.pdf`, pdf);
}

console.log(`Generated ${templates.length} preview images and placeholder downloads.`);
