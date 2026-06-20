import fs from "node:fs";

const templateGroups = {
  invoice: [
    "Hotel Invoice Template",
    "Restaurant Invoice Template",
    "GST Invoice Template",
    "Freelancer Invoice Template",
    "Retail Invoice Template",
    "Medical Invoice Template",
    "Taxi Invoice Template",
    "Consulting Invoice Template",
    "Construction Invoice Template",
    "Service Invoice Template",
    "Proforma Invoice Template",
    "Commercial Invoice Template",
    "Photography Invoice Template",
    "Interior Design Invoice Template",
    "Travel Agency Invoice Template",
    "Car Rental Invoice Template",
    "Event Planner Invoice Template",
    "Graphic Design Invoice Template",
    "Software Development Invoice Template",
    "Maintenance Invoice Template",
    "Courier Invoice Template",
    "Wholesale Invoice Template",
    "Sales Invoice Template",
    "Agency Invoice Template",
    "Contractor Invoice Template",
  ],
  receipt: [
    "Rent Receipt Template",
    "Payment Receipt Template",
    "Cash Receipt Template",
    "School Fee Receipt Template",
    "Hotel Receipt Template",
    "Donation Receipt Template",
    "Medical Receipt Template",
    "Taxi Receipt Template",
    "Restaurant Receipt Template",
    "Retail Receipt Template",
    "Service Receipt Template",
    "Security Deposit Receipt Template",
    "Advance Payment Receipt Template",
    "Tuition Fee Receipt Template",
    "Membership Receipt Template",
    "Delivery Receipt Template",
    "Workshop Receipt Template",
    "Event Receipt Template",
    "Parking Receipt Template",
    "Consultation Receipt Template",
  ],
  resume: [
    "Fresher Resume Template",
    "Banking Resume Template",
    "Teacher Resume Template",
    "Software Engineer Resume Template",
    "Accountant Resume Template",
    "UI UX Resume Template",
    "Mechanical Engineer Resume Template",
    "Bank PO Resume Template",
    "Marketing Resume Template",
    "Sales Executive Resume Template",
    "HR Manager Resume Template",
    "Data Analyst Resume Template",
    "Civil Engineer Resume Template",
    "Graphic Designer Resume Template",
    "Digital Marketing Resume Template",
    "Nurse Resume Template",
    "Administrative Assistant Resume Template",
    "Project Manager Resume Template",
    "Customer Service Resume Template",
    "Business Analyst Resume Template",
    "Operations Manager Resume Template",
    "MBA Resume Template",
    "Internship Resume Template",
    "Executive Resume Template",
    "Simple Professional Resume Template",
  ],
  certificate: [
    "Participation Certificate Template",
    "Internship Certificate Template",
    "Appreciation Certificate Template",
    "Training Certificate Template",
    "Achievement Certificate Template",
    "Sports Certificate Template",
    "Completion Certificate Template",
    "Excellence Certificate Template",
    "Employee Certificate Template",
    "Workshop Certificate Template",
    "Course Certificate Template",
    "Volunteer Certificate Template",
    "School Certificate Template",
    "Competition Certificate Template",
    "Seminar Certificate Template",
    "Award Certificate Template",
    "Membership Certificate Template",
    "Recognition Certificate Template",
    "Leadership Certificate Template",
    "Safety Training Certificate Template",
  ],
  letterhead: [
    "Corporate Letterhead Template",
    "School Letterhead Template",
    "Hospital Letterhead Template",
    "Construction Letterhead Template",
    "Legal Letterhead Template",
    "Consultancy Letterhead Template",
    "Real Estate Letterhead Template",
    "Accounting Firm Letterhead Template",
    "Clinic Letterhead Template",
    "NGO Letterhead Template",
    "Startup Letterhead Template",
    "Architecture Letterhead Template",
    "Travel Agency Letterhead Template",
    "Restaurant Letterhead Template",
    "Hotel Letterhead Template",
    "Education Institute Letterhead Template",
    "Logistics Letterhead Template",
    "Marketing Agency Letterhead Template",
    "Event Company Letterhead Template",
    "IT Company Letterhead Template",
  ],
};

const templateDetails = {
  invoice: {
    features: [
      "Editable billing, tax, and itemized service sections",
      "Professional layout for client-facing invoices",
      "Print-ready structure with clear totals and payment notes",
    ],
    useCases: ["Client billing", "Business records", "Payment documentation"],
  },
  receipt: {
    features: [
      "Clean payment confirmation layout",
      "Fields for payer, date, amount, and purpose",
      "Compact format suitable for print or digital sharing",
    ],
    useCases: ["Payment confirmation", "Office records", "Customer documentation"],
  },
  resume: {
    features: [
      "Recruiter-friendly section hierarchy",
      "Editable skills, education, and experience blocks",
      "ATS-conscious structure with clean typography",
    ],
    useCases: ["Job applications", "Career profiles", "Interview preparation"],
  },
  certificate: {
    features: [
      "Formal award layout with signature areas",
      "Editable recipient, date, issuer, and program details",
      "Presentation-ready design for print and PDF export",
    ],
    useCases: ["Awards", "Training programs", "Recognition events"],
  },
  letterhead: {
    features: [
      "Business-ready header and footer placement",
      "Space for contact, address, logo, and document reference",
      "Polished layout for official communication",
    ],
    useCases: ["Official letters", "Business notices", "Proposal documents"],
  },
};

const resourceGroups = {
  PSD: [
    "Business Card PSD",
    "Mypixelogs Promise PSD",
    "Restaurant Menu PSD",
    "Flyer PSD",
    "Invoice PSD",
    "Resume PSD",
    "Certificate PSD",
    "Social Media Banner PSD",
    "Product Flyer PSD",
    "Corporate Brochure PSD",
    "Event Poster PSD",
    "Real Estate Flyer PSD",
    "Salon Price List PSD",
    "Hotel Promotion PSD",
    "Education Poster PSD",
  ],
  Canva: [
    "Canva Social Media Pack",
    "Instagram Post Canva Template",
    "LinkedIn Banner Canva Template",
    "YouTube Thumbnail Canva Template",
    "Resume Canva Template",
    "Business Proposal Canva Template",
    "Presentation Canva Template",
    "Flyer Canva Template",
    "Invoice Canva Template",
    "Certificate Canva Template",
    "Restaurant Menu Canva Template",
    "Real Estate Canva Post",
    "Event Invitation Canva Template",
  ],
  Logos: [
    "Logo Starter Kit",
    "Technology Logo Template",
    "Hotel Logo Template",
    "Restaurant Logo Template",
    "Education Logo Template",
    "Finance Logo Template",
    "Medical Logo Template",
    "Real Estate Logo Template",
    "Construction Logo Template",
    "Consulting Logo Template",
    "Travel Logo Template",
    "Fitness Logo Template",
  ],
  Icons: [
    "Icons Collection",
    "Business Icons Pack",
    "Finance Icons Pack",
    "Education Icons Pack",
    "Healthcare Icons Pack",
    "Technology Icons Pack",
    "Marketing Icons Pack",
    "Real Estate Icons Pack",
    "Travel Icons Pack",
    "Food Icons Pack",
    "Document Icons Pack",
    "Interface Icons Pack",
  ],
};

const specialResourcePaths = {
  "Business Card PSD": {
    slug: "business-card-psd",
    path: "business-card",
    file: "business-card.psd",
  },
  "Mypixelogs Promise PSD": {
    slug: "mypixelogs-promise",
    path: "mypixelogs-promise",
    file: "mypixelogs_promise.psd",
    preview: "mypixelogs_promise.jpg",
  },
  "Canva Social Media Pack": {
    slug: "canva-social-pack",
    path: "canva-social-pack",
    file: "canva-social-pack.zip",
  },
  "Logo Starter Kit": {
    slug: "logo-starter-kit",
    path: "logo-starter-kit",
    file: "logo-starter-kit.zip",
  },
  "Icons Collection": {
    slug: "icon-pack",
    path: "icon-pack",
    file: "icon-pack.zip",
  },
};

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function resourceDescription(title, category) {
  const categoryDescriptions = {
    PSD: "editable Photoshop design resource",
    Canva: "customizable Canva-style design resource",
    Logos: "brand-ready logo resource",
    Icons: "clean icon resource pack",
  };
  return `Download a free ${title.toLowerCase()} as a ${categoryDescriptions[category]} for professional projects.`;
}

function templateDescription(title, category) {
  const descriptions = {
    invoice: "Download a free editable invoice template in Word, Excel and PDF formats for professional billing.",
    receipt: "Create a clear payment receipt with editable fields for amount, date, payer and purpose.",
    resume: "Build a polished resume with clean sections for skills, education and professional experience.",
    certificate: "Create a professional certificate with editable recipient, date, issuer and signature details.",
    letterhead: "Prepare official business communication with a polished editable letterhead layout.",
  };
  return `${title}: ${descriptions[category]}`;
}

function generateTemplateData() {
  const rows = [];
  for (const [category, titles] of Object.entries(templateGroups)) {
    for (const [index, title] of titles.entries()) {
      const slug = slugify(title);
      rows.push({
        id: slug.replace(/-template$/, ""),
        title,
        slug,
        description: templateDescription(title, category),
        category,
        downloads: 7200 + index * 731 + category.length * 419,
        features: templateDetails[category].features,
        useCases: templateDetails[category].useCases,
      });
    }
  }
  return rows;
}

function generateResourceData() {
  const rows = [];
  for (const [category, titles] of Object.entries(resourceGroups)) {
    for (const title of titles) {
      const special = specialResourcePaths[title];
      const slug = special?.slug ?? slugify(title);
      const folder = special?.path ?? slug;
      const previewFile = special?.preview ?? "preview.jpg";
      const downloadFile = special?.file ?? `${slug}.${category === "PSD" ? "psd" : "zip"}`;
      const downloadType = category === "PSD" ? "PSD" : "ZIP";
      rows.push({
        id: slug,
        slug,
        title,
        description: resourceDescription(title, category),
        category,
        thumbnail: `/resources/${folder}/${previewFile}`,
        previewImage: `/resources/${folder}/${previewFile}`,
        files: [
          {
            label: category === "PSD" ? "PSD Source File" : `${title} Pack`,
            type: downloadType,
            url: `/resources/${folder}/${downloadFile}`,
          },
          {
            label: "JPG Preview",
            type: "JPG",
            url: `/resources/${folder}/${previewFile}`,
          },
        ],
        folder,
        previewFile,
        downloadFile,
      });
    }
  }
  return rows;
}

function writeTemplates(templates) {
  const lines = [
    'import type { Template, TemplateCategory } from "@/types/template";',
    "",
    'const previewPath = (slug: string) => `/previews/${slug}.svg`;',
    'const downloadPath = (slug: string) => `/downloads/${slug}.pdf`;',
    "",
    "const makeTemplate = (",
    "  id: string,",
    "  title: string,",
    "  slug: string,",
    "  description: string,",
    "  category: TemplateCategory,",
    "  downloads: number,",
    "  features: string[],",
    "  useCases: string[],",
    "): Template => ({",
    "  id,",
    "  title,",
    "  slug,",
    "  description,",
    "  category,",
    "  thumbnail: previewPath(slug),",
    "  previewImage: previewPath(slug),",
    "  downloadPath: downloadPath(slug),",
    "  downloads,",
    '  formats: ["Word", "Excel", "PDF"],',
    "  features,",
    "  useCases,",
    "});",
    "",
    'const invoiceFeatures = ["Editable billing, tax, and itemized service sections", "Professional layout for client-facing invoices", "Print-ready structure with clear totals and payment notes"];',
    'const receiptFeatures = ["Clean payment confirmation layout", "Fields for payer, date, amount, and purpose", "Compact format suitable for print or digital sharing"];',
    'const resumeFeatures = ["Recruiter-friendly section hierarchy", "Editable skills, education, and experience blocks", "ATS-conscious structure with clean typography"];',
    'const letterheadFeatures = ["Business-ready header and footer placement", "Space for contact, address, logo, and document reference", "Polished layout for official communication"];',
    'const certificateFeatures = ["Formal award layout with signature areas", "Editable recipient, date, issuer, and program details", "Presentation-ready design for print and PDF export"];',
    "",
    "export const templates: Template[] = [",
  ];

  const featureMap = {
    invoice: "invoiceFeatures",
    receipt: "receiptFeatures",
    resume: "resumeFeatures",
    certificate: "certificateFeatures",
    letterhead: "letterheadFeatures",
  };

  for (const template of templates) {
    lines.push(
      `  makeTemplate(${JSON.stringify(template.id)}, ${JSON.stringify(template.title)}, ${JSON.stringify(
        template.slug,
      )}, ${JSON.stringify(template.description)}, ${JSON.stringify(template.category)}, ${
        template.downloads
      }, ${featureMap[template.category]}, ${JSON.stringify(template.useCases)}),`,
    );
  }

  lines.push("];", "");
  fs.writeFileSync("src/data/templates.ts", lines.join("\n"));
}

function writeResources(resources) {
  const output = resources.map((resource) => ({
    id: resource.id,
    slug: resource.slug,
    title: resource.title,
    description: resource.description,
    category: resource.category,
    thumbnail: resource.thumbnail,
    previewImage: resource.previewImage,
    files: resource.files,
  }));
  const source = `import type { Resource } from "@/types/resource";\n\nexport const resources: Resource[] = ${JSON.stringify(
    output,
    null,
    2,
  )};\n`;
  fs.writeFileSync("src/data/resources.ts", source);
}

function writeTemplateAssets(templates) {
  fs.mkdirSync("public/previews", { recursive: true });
  fs.mkdirSync("public/downloads", { recursive: true });
  for (const template of templates) {
    const escapedTitle = template.title.replace(/&/g, "&amp;").replace(/</g, "&lt;");
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
    fs.writeFileSync(`public/previews/${template.slug}.svg`, svg);
    fs.writeFileSync(
      `public/downloads/${template.slug}.pdf`,
      `%PDF-1.4\n1 0 obj<< /Type /Catalog >>endobj\n2 0 obj<< /Length 80 >>stream\nBT /F1 24 Tf 72 720 Td (${template.title.replace(
        /[()\\]/g,
        "",
      )}) Tj ET\nendstream\nendobj\ntrailer<< /Root 1 0 R >>\n%%EOF\n`,
    );
  }
}

function writeResourceAssets(resources) {
  const jpg =
    "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/ASP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/ASP/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Amf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IV//2gAMAwEAAgADAAAAEP/EFBQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EFBQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EFBABAQAAAAAAAAAAAAAAAAAAARD/2gAIAQEAAT8QH//Z";
  for (const resource of resources) {
    const dir = `public/resources/${resource.folder}`;
    fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(`${dir}/${resource.previewFile}`)) {
      fs.writeFileSync(`${dir}/${resource.previewFile}`, Buffer.from(jpg, "base64"));
    }
    if (!fs.existsSync(`${dir}/${resource.downloadFile}`)) {
      fs.writeFileSync(
        `${dir}/${resource.downloadFile}`,
        `${resource.title}\nPlaceholder download file for mypixelogs content expansion.\n`,
      );
    }
  }
}

const templates = generateTemplateData();
const resources = generateResourceData();
writeTemplates(templates);
writeResources(resources);
writeTemplateAssets(templates);
writeResourceAssets(resources);

console.log(`Expanded templates to ${templates.length}.`);
console.log(`Expanded resources to ${resources.length}.`);
