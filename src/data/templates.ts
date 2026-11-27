import type { Template, TemplateCategory } from "@/types/template";

const previewPath = (slug: string) => `/previews/${slug}.svg`;
const downloadPath = (slug: string) => `/downloads/${slug}.pdf`;

const makeTemplate = (
  id: string,
  title: string,
  slug: string,
  description: string,
  category: TemplateCategory,
  downloads: number,
  features: string[],
  useCases: string[],
): Template => ({
  id,
  title,
  slug,
  description,
  category,
  thumbnail: previewPath(slug),
  previewImage: previewPath(slug),
  downloadPath: downloadPath(slug),
  downloads,
  formats: ["Word", "Excel", "PDF"],
  features,
  useCases,
});

/** A finished Word template with a real .docx file and preview image. */
const makeWordTemplate = (
  editor: Template["editor"],
  ...args: Parameters<typeof makeTemplate>
): Template => {
  const template = makeTemplate(...args);
  const preview = `/previews/${template.slug}.png`;

  return {
    ...template,
    thumbnail: preview,
    previewImage: preview,
    downloadPath: `/downloads/${template.slug}.docx`,
    formats: ["Word"],
    featured: true,
    ready: true,
    editor,
  };
};

/** A locked Google Docs original that visitors copy and edit. */
const makeGoogleDocTemplate = (
  googleDocId: string,
  ...args: Parameters<typeof makeTemplate>
): Template => {
  const template = makeTemplate(...args);
  const preview = `/previews/${template.slug}.png`;

  return {
    ...template,
    thumbnail: preview,
    previewImage: preview,
    downloadPath: `https://docs.google.com/document/d/${googleDocId}/copy`,
    formats: ["Google Docs"],
    featured: true,
    ready: true,
    googleDocId,
  };
};

/** A video that visitors edit and export in the browser. */
const makeVideoTemplate = (...args: Parameters<typeof makeTemplate>): Template => {
  const template = makeTemplate(...args);
  const preview = `/previews/${template.slug}.jpg`;

  return {
    ...template,
    thumbnail: preview,
    previewImage: preview,
    previewVideo: `/previews/${template.slug}.mp4`,
    downloadPath: "",
    formats: ["MP4 video"],
    featured: true,
    ready: true,
    editor: "wedding-video",
  };
};

const invoiceFeatures = ["Editable billing, tax, and itemized service sections", "Professional layout for client-facing invoices", "Print-ready structure with clear totals and payment notes"];
const receiptFeatures = ["Clean payment confirmation layout", "Fields for payer, date, amount, and purpose", "Compact format suitable for print or digital sharing"];
const resumeFeatures = ["Recruiter-friendly section hierarchy", "Editable skills, education, and experience blocks", "ATS-conscious structure with clean typography"];
const letterheadFeatures = ["Business-ready header and footer placement", "Space for contact, address, logo, and document reference", "Polished layout for official communication"];
const certificateFeatures = ["Formal award layout with signature areas", "Editable recipient, date, issuer, and program details", "Presentation-ready design for print and PDF export"];

export const allTemplates: Template[] = [
  makeVideoTemplate("watercolor-wedding-video", "Watercolor Wedding Invitation Video", "watercolor-wedding-invitation-video", "Free wedding invitation video with watercolor flowers and gold lettering. Add your names, photos and music in the browser and download an MP4.", "video", 0, ["Change every line of text in Telugu or English", "Add three photos with zoom, move, turn and brightness", "Two colour styles, 50 seconds, with your own music"], ["Wedding invitations", "WhatsApp sharing", "Screens at the venue"]),
  makeGoogleDocTemplate("1uOhsZf21PtejXSGra1pRPBsm0T2xjB9QaBA9Z9BjZoc", "indigo-invoice", "Indigo Invoice Template", "indigo-invoice-template", "Free Google Docs invoice template in indigo, with item descriptions, tax, discount and payment details on one A4 page.", "invoice", 0, ["Opens as your own copy in Google Docs", "One-page A4 layout with clear placeholders", "Space for logo, bank or UPI details and terms"], ["Product sales", "Small businesses", "Freelance work"]),
  makeGoogleDocTemplate("10LTQaRqkbsXL-ceyDfrUWGdFyFTAE72Kb7GUgAo1uB0", "crimson-invoice", "Crimson Invoice Template", "crimson-invoice-template", "Free Google Docs invoice template with a centred logo space, numbered items and a bold red total on one A4 page.", "invoice", 0, ["Opens as your own copy in Google Docs", "One-page A4 layout with clear placeholders", "Space for logo, bank or UPI details and terms"], ["Design studios", "Service billing", "Freelance work"]),
  makeGoogleDocTemplate("15Qpq_D-9ADYRE_TY1C2_lldlf2UMqZuiDV_6qEh6kk8", "teal-split-invoice", "Teal Split Invoice Template", "teal-split-invoice-template", "Free Google Docs invoice template with a two-colour header, payment method and signature line on one A4 page.", "invoice", 0, ["Opens as your own copy in Google Docs", "One-page A4 layout with clear placeholders", "Space for logo, bank or UPI details and terms"], ["Agencies", "Project billing", "Freelance work"]),
  makeGoogleDocTemplate("1O2v1DC-kcV5x8aJdzKGgp4oRM5HF4Lxoh4yp-Na5fL0", "charcoal-invoice", "Charcoal Invoice Template", "charcoal-invoice-template", "Free Google Docs invoice template with a dark header and the total due at the top, on one A4 page.", "invoice", 0, ["Opens as your own copy in Google Docs", "One-page A4 layout with clear placeholders", "Space for logo, bank or UPI details and terms"], ["Consultants", "Monthly billing", "Freelance work"]),
  makeTemplate("hotel-invoice", "Hotel Invoice Template", "hotel-invoice-template", "Hotel Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 10133, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeTemplate("restaurant-invoice", "Restaurant Invoice Template", "restaurant-invoice-template", "Restaurant Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 10864, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeWordTemplate("gst", "gst-invoice", "GST Invoice Template", "gst-invoice-template", "Free GST tax invoice template for Microsoft Word. Editable A4 layout with GSTIN, HSN/SAC, place of supply, CGST, SGST and IGST fields.", "invoice", 0, ["Fields for GSTIN, HSN/SAC, place of supply and reverse charge", "Separate CGST, SGST/UTGST and IGST totals", "One-page A4 layout with bank, UPI and signature areas"], ["Sales by GST-registered businesses", "Service billing", "Sales within or between states"]),
  makeWordTemplate("freelancer", "freelancer-invoice", "Freelancer Invoice Template", "freelancer-invoice-template", "Free freelancer invoice template for Microsoft Word. Clean, editable A4 layout with project, hours, advance paid and UPI or bank details.", "invoice", 0, ["Project, hours, rate and amount columns", "Discount, tax and advance paid lines", "Bank, UPI and payment terms sections"], ["Design and development work", "Hourly or fixed-price projects", "Indian and international clients"]),
  makeTemplate("retail-invoice", "Retail Invoice Template", "retail-invoice-template", "Retail Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 13057, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeTemplate("medical-invoice", "Medical Invoice Template", "medical-invoice-template", "Medical Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 13788, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeTemplate("taxi-invoice", "Taxi Invoice Template", "taxi-invoice-template", "Taxi Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 14519, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeTemplate("consulting-invoice", "Consulting Invoice Template", "consulting-invoice-template", "Consulting Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 15250, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeTemplate("construction-invoice", "Construction Invoice Template", "construction-invoice-template", "Construction Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 15981, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeTemplate("service-invoice", "Service Invoice Template", "service-invoice-template", "Service Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 16712, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeTemplate("proforma-invoice", "Proforma Invoice Template", "proforma-invoice-template", "Proforma Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 17443, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeTemplate("commercial-invoice", "Commercial Invoice Template", "commercial-invoice-template", "Commercial Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 18174, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeTemplate("photography-invoice", "Photography Invoice Template", "photography-invoice-template", "Photography Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 18905, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeTemplate("interior-design-invoice", "Interior Design Invoice Template", "interior-design-invoice-template", "Interior Design Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 19636, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeTemplate("travel-agency-invoice", "Travel Agency Invoice Template", "travel-agency-invoice-template", "Travel Agency Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 20367, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeTemplate("car-rental-invoice", "Car Rental Invoice Template", "car-rental-invoice-template", "Car Rental Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 21098, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeTemplate("event-planner-invoice", "Event Planner Invoice Template", "event-planner-invoice-template", "Event Planner Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 21829, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeTemplate("graphic-design-invoice", "Graphic Design Invoice Template", "graphic-design-invoice-template", "Graphic Design Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 22560, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeTemplate("software-development-invoice", "Software Development Invoice Template", "software-development-invoice-template", "Software Development Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 23291, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeTemplate("maintenance-invoice", "Maintenance Invoice Template", "maintenance-invoice-template", "Maintenance Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 24022, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeTemplate("courier-invoice", "Courier Invoice Template", "courier-invoice-template", "Courier Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 24753, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeTemplate("wholesale-invoice", "Wholesale Invoice Template", "wholesale-invoice-template", "Wholesale Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 25484, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeTemplate("sales-invoice", "Sales Invoice Template", "sales-invoice-template", "Sales Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 26215, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeTemplate("agency-invoice", "Agency Invoice Template", "agency-invoice-template", "Agency Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 26946, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeTemplate("contractor-invoice", "Contractor Invoice Template", "contractor-invoice-template", "Contractor Invoice Template: Download a free editable invoice template in Word, Excel and PDF formats for professional billing.", "invoice", 27677, invoiceFeatures, ["Client billing","Business records","Payment documentation"]),
  makeTemplate("rent-receipt", "Rent Receipt Template", "rent-receipt-template", "Rent Receipt Template: Create a clear payment receipt with editable fields for amount, date, payer and purpose.", "receipt", 10133, receiptFeatures, ["Payment confirmation","Office records","Customer documentation"]),
  makeTemplate("payment-receipt", "Payment Receipt Template", "payment-receipt-template", "Payment Receipt Template: Create a clear payment receipt with editable fields for amount, date, payer and purpose.", "receipt", 10864, receiptFeatures, ["Payment confirmation","Office records","Customer documentation"]),
  makeTemplate("cash-receipt", "Cash Receipt Template", "cash-receipt-template", "Cash Receipt Template: Create a clear payment receipt with editable fields for amount, date, payer and purpose.", "receipt", 11595, receiptFeatures, ["Payment confirmation","Office records","Customer documentation"]),
  makeTemplate("school-fee-receipt", "School Fee Receipt Template", "school-fee-receipt-template", "School Fee Receipt Template: Create a clear payment receipt with editable fields for amount, date, payer and purpose.", "receipt", 12326, receiptFeatures, ["Payment confirmation","Office records","Customer documentation"]),
  makeTemplate("hotel-receipt", "Hotel Receipt Template", "hotel-receipt-template", "Hotel Receipt Template: Create a clear payment receipt with editable fields for amount, date, payer and purpose.", "receipt", 13057, receiptFeatures, ["Payment confirmation","Office records","Customer documentation"]),
  makeTemplate("donation-receipt", "Donation Receipt Template", "donation-receipt-template", "Donation Receipt Template: Create a clear payment receipt with editable fields for amount, date, payer and purpose.", "receipt", 13788, receiptFeatures, ["Payment confirmation","Office records","Customer documentation"]),
  makeTemplate("medical-receipt", "Medical Receipt Template", "medical-receipt-template", "Medical Receipt Template: Create a clear payment receipt with editable fields for amount, date, payer and purpose.", "receipt", 14519, receiptFeatures, ["Payment confirmation","Office records","Customer documentation"]),
  makeTemplate("taxi-receipt", "Taxi Receipt Template", "taxi-receipt-template", "Taxi Receipt Template: Create a clear payment receipt with editable fields for amount, date, payer and purpose.", "receipt", 15250, receiptFeatures, ["Payment confirmation","Office records","Customer documentation"]),
  makeTemplate("restaurant-receipt", "Restaurant Receipt Template", "restaurant-receipt-template", "Restaurant Receipt Template: Create a clear payment receipt with editable fields for amount, date, payer and purpose.", "receipt", 15981, receiptFeatures, ["Payment confirmation","Office records","Customer documentation"]),
  makeTemplate("retail-receipt", "Retail Receipt Template", "retail-receipt-template", "Retail Receipt Template: Create a clear payment receipt with editable fields for amount, date, payer and purpose.", "receipt", 16712, receiptFeatures, ["Payment confirmation","Office records","Customer documentation"]),
  makeTemplate("service-receipt", "Service Receipt Template", "service-receipt-template", "Service Receipt Template: Create a clear payment receipt with editable fields for amount, date, payer and purpose.", "receipt", 17443, receiptFeatures, ["Payment confirmation","Office records","Customer documentation"]),
  makeTemplate("security-deposit-receipt", "Security Deposit Receipt Template", "security-deposit-receipt-template", "Security Deposit Receipt Template: Create a clear payment receipt with editable fields for amount, date, payer and purpose.", "receipt", 18174, receiptFeatures, ["Payment confirmation","Office records","Customer documentation"]),
  makeTemplate("advance-payment-receipt", "Advance Payment Receipt Template", "advance-payment-receipt-template", "Advance Payment Receipt Template: Create a clear payment receipt with editable fields for amount, date, payer and purpose.", "receipt", 18905, receiptFeatures, ["Payment confirmation","Office records","Customer documentation"]),
  makeTemplate("tuition-fee-receipt", "Tuition Fee Receipt Template", "tuition-fee-receipt-template", "Tuition Fee Receipt Template: Create a clear payment receipt with editable fields for amount, date, payer and purpose.", "receipt", 19636, receiptFeatures, ["Payment confirmation","Office records","Customer documentation"]),
  makeTemplate("membership-receipt", "Membership Receipt Template", "membership-receipt-template", "Membership Receipt Template: Create a clear payment receipt with editable fields for amount, date, payer and purpose.", "receipt", 20367, receiptFeatures, ["Payment confirmation","Office records","Customer documentation"]),
  makeTemplate("delivery-receipt", "Delivery Receipt Template", "delivery-receipt-template", "Delivery Receipt Template: Create a clear payment receipt with editable fields for amount, date, payer and purpose.", "receipt", 21098, receiptFeatures, ["Payment confirmation","Office records","Customer documentation"]),
  makeTemplate("workshop-receipt", "Workshop Receipt Template", "workshop-receipt-template", "Workshop Receipt Template: Create a clear payment receipt with editable fields for amount, date, payer and purpose.", "receipt", 21829, receiptFeatures, ["Payment confirmation","Office records","Customer documentation"]),
  makeTemplate("event-receipt", "Event Receipt Template", "event-receipt-template", "Event Receipt Template: Create a clear payment receipt with editable fields for amount, date, payer and purpose.", "receipt", 22560, receiptFeatures, ["Payment confirmation","Office records","Customer documentation"]),
  makeTemplate("parking-receipt", "Parking Receipt Template", "parking-receipt-template", "Parking Receipt Template: Create a clear payment receipt with editable fields for amount, date, payer and purpose.", "receipt", 23291, receiptFeatures, ["Payment confirmation","Office records","Customer documentation"]),
  makeTemplate("consultation-receipt", "Consultation Receipt Template", "consultation-receipt-template", "Consultation Receipt Template: Create a clear payment receipt with editable fields for amount, date, payer and purpose.", "receipt", 24022, receiptFeatures, ["Payment confirmation","Office records","Customer documentation"]),
  makeWordTemplate("resume", "fresher-resume", "Fresher Resume Template", "fresher-resume-template", "Free one-page resume template for freshers and graduates, in Microsoft Word. Clean A4 layout with education, skills, projects and internship sections that applicant tracking systems can read.", "resume", 0, ["One A4 page with education, skills, projects and internship", "Plain, selectable text that applicant tracking systems (ATS) can read", "Built with Word styles, so fonts and colours change in one place"], ["Campus placements", "First job applications", "Internship applications"]),
  makeTemplate("banking-resume", "Banking Resume Template", "banking-resume-template", "Banking Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 10445, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("teacher-resume", "Teacher Resume Template", "teacher-resume-template", "Teacher Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 11176, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("software-engineer-resume", "Software Engineer Resume Template", "software-engineer-resume-template", "Software Engineer Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 11907, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("accountant-resume", "Accountant Resume Template", "accountant-resume-template", "Accountant Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 12638, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("ui-ux-resume", "UI UX Resume Template", "ui-ux-resume-template", "UI UX Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 13369, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("mechanical-engineer-resume", "Mechanical Engineer Resume Template", "mechanical-engineer-resume-template", "Mechanical Engineer Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 14100, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("bank-po-resume", "Bank PO Resume Template", "bank-po-resume-template", "Bank PO Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 14831, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("marketing-resume", "Marketing Resume Template", "marketing-resume-template", "Marketing Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 15562, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("sales-executive-resume", "Sales Executive Resume Template", "sales-executive-resume-template", "Sales Executive Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 16293, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("hr-manager-resume", "HR Manager Resume Template", "hr-manager-resume-template", "HR Manager Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 17024, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("data-analyst-resume", "Data Analyst Resume Template", "data-analyst-resume-template", "Data Analyst Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 17755, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("civil-engineer-resume", "Civil Engineer Resume Template", "civil-engineer-resume-template", "Civil Engineer Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 18486, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("graphic-designer-resume", "Graphic Designer Resume Template", "graphic-designer-resume-template", "Graphic Designer Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 19217, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("digital-marketing-resume", "Digital Marketing Resume Template", "digital-marketing-resume-template", "Digital Marketing Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 19948, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("nurse-resume", "Nurse Resume Template", "nurse-resume-template", "Nurse Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 20679, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("administrative-assistant-resume", "Administrative Assistant Resume Template", "administrative-assistant-resume-template", "Administrative Assistant Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 21410, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("project-manager-resume", "Project Manager Resume Template", "project-manager-resume-template", "Project Manager Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 22141, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("customer-service-resume", "Customer Service Resume Template", "customer-service-resume-template", "Customer Service Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 22872, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("business-analyst-resume", "Business Analyst Resume Template", "business-analyst-resume-template", "Business Analyst Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 23603, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("operations-manager-resume", "Operations Manager Resume Template", "operations-manager-resume-template", "Operations Manager Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 24334, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("mba-resume", "MBA Resume Template", "mba-resume-template", "MBA Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 25065, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("internship-resume", "Internship Resume Template", "internship-resume-template", "Internship Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 25796, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("executive-resume", "Executive Resume Template", "executive-resume-template", "Executive Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 26527, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("simple-professional-resume", "Simple Professional Resume Template", "simple-professional-resume-template", "Simple Professional Resume Template: Build a polished resume with clean sections for skills, education and professional experience.", "resume", 27258, resumeFeatures, ["Job applications","Career profiles","Interview preparation"]),
  makeTemplate("participation-certificate", "Participation Certificate Template", "participation-certificate-template", "Participation Certificate Template: Create a professional certificate with editable recipient, date, issuer and signature details.", "certificate", 11809, certificateFeatures, ["Awards","Training programs","Recognition events"]),
  makeTemplate("internship-certificate", "Internship Certificate Template", "internship-certificate-template", "Internship Certificate Template: Create a professional certificate with editable recipient, date, issuer and signature details.", "certificate", 12540, certificateFeatures, ["Awards","Training programs","Recognition events"]),
  makeTemplate("appreciation-certificate", "Appreciation Certificate Template", "appreciation-certificate-template", "Appreciation Certificate Template: Create a professional certificate with editable recipient, date, issuer and signature details.", "certificate", 13271, certificateFeatures, ["Awards","Training programs","Recognition events"]),
  makeTemplate("training-certificate", "Training Certificate Template", "training-certificate-template", "Training Certificate Template: Create a professional certificate with editable recipient, date, issuer and signature details.", "certificate", 14002, certificateFeatures, ["Awards","Training programs","Recognition events"]),
  makeTemplate("achievement-certificate", "Achievement Certificate Template", "achievement-certificate-template", "Achievement Certificate Template: Create a professional certificate with editable recipient, date, issuer and signature details.", "certificate", 14733, certificateFeatures, ["Awards","Training programs","Recognition events"]),
  makeTemplate("sports-certificate", "Sports Certificate Template", "sports-certificate-template", "Sports Certificate Template: Create a professional certificate with editable recipient, date, issuer and signature details.", "certificate", 15464, certificateFeatures, ["Awards","Training programs","Recognition events"]),
  makeTemplate("completion-certificate", "Completion Certificate Template", "completion-certificate-template", "Completion Certificate Template: Create a professional certificate with editable recipient, date, issuer and signature details.", "certificate", 16195, certificateFeatures, ["Awards","Training programs","Recognition events"]),
  makeTemplate("excellence-certificate", "Excellence Certificate Template", "excellence-certificate-template", "Excellence Certificate Template: Create a professional certificate with editable recipient, date, issuer and signature details.", "certificate", 16926, certificateFeatures, ["Awards","Training programs","Recognition events"]),
  makeTemplate("employee-certificate", "Employee Certificate Template", "employee-certificate-template", "Employee Certificate Template: Create a professional certificate with editable recipient, date, issuer and signature details.", "certificate", 17657, certificateFeatures, ["Awards","Training programs","Recognition events"]),
  makeTemplate("workshop-certificate", "Workshop Certificate Template", "workshop-certificate-template", "Workshop Certificate Template: Create a professional certificate with editable recipient, date, issuer and signature details.", "certificate", 18388, certificateFeatures, ["Awards","Training programs","Recognition events"]),
  makeTemplate("course-certificate", "Course Certificate Template", "course-certificate-template", "Course Certificate Template: Create a professional certificate with editable recipient, date, issuer and signature details.", "certificate", 19119, certificateFeatures, ["Awards","Training programs","Recognition events"]),
  makeTemplate("volunteer-certificate", "Volunteer Certificate Template", "volunteer-certificate-template", "Volunteer Certificate Template: Create a professional certificate with editable recipient, date, issuer and signature details.", "certificate", 19850, certificateFeatures, ["Awards","Training programs","Recognition events"]),
  makeTemplate("school-certificate", "School Certificate Template", "school-certificate-template", "School Certificate Template: Create a professional certificate with editable recipient, date, issuer and signature details.", "certificate", 20581, certificateFeatures, ["Awards","Training programs","Recognition events"]),
  makeTemplate("competition-certificate", "Competition Certificate Template", "competition-certificate-template", "Competition Certificate Template: Create a professional certificate with editable recipient, date, issuer and signature details.", "certificate", 21312, certificateFeatures, ["Awards","Training programs","Recognition events"]),
  makeTemplate("seminar-certificate", "Seminar Certificate Template", "seminar-certificate-template", "Seminar Certificate Template: Create a professional certificate with editable recipient, date, issuer and signature details.", "certificate", 22043, certificateFeatures, ["Awards","Training programs","Recognition events"]),
  makeTemplate("award-certificate", "Award Certificate Template", "award-certificate-template", "Award Certificate Template: Create a professional certificate with editable recipient, date, issuer and signature details.", "certificate", 22774, certificateFeatures, ["Awards","Training programs","Recognition events"]),
  makeTemplate("membership-certificate", "Membership Certificate Template", "membership-certificate-template", "Membership Certificate Template: Create a professional certificate with editable recipient, date, issuer and signature details.", "certificate", 23505, certificateFeatures, ["Awards","Training programs","Recognition events"]),
  makeTemplate("recognition-certificate", "Recognition Certificate Template", "recognition-certificate-template", "Recognition Certificate Template: Create a professional certificate with editable recipient, date, issuer and signature details.", "certificate", 24236, certificateFeatures, ["Awards","Training programs","Recognition events"]),
  makeTemplate("leadership-certificate", "Leadership Certificate Template", "leadership-certificate-template", "Leadership Certificate Template: Create a professional certificate with editable recipient, date, issuer and signature details.", "certificate", 24967, certificateFeatures, ["Awards","Training programs","Recognition events"]),
  makeTemplate("safety-training-certificate", "Safety Training Certificate Template", "safety-training-certificate-template", "Safety Training Certificate Template: Create a professional certificate with editable recipient, date, issuer and signature details.", "certificate", 25698, certificateFeatures, ["Awards","Training programs","Recognition events"]),
  makeTemplate("corporate-letterhead", "Corporate Letterhead Template", "corporate-letterhead-template", "Corporate Letterhead Template: Prepare official business communication with a polished editable letterhead layout.", "letterhead", 11390, letterheadFeatures, ["Official letters","Business notices","Proposal documents"]),
  makeTemplate("school-letterhead", "School Letterhead Template", "school-letterhead-template", "School Letterhead Template: Prepare official business communication with a polished editable letterhead layout.", "letterhead", 12121, letterheadFeatures, ["Official letters","Business notices","Proposal documents"]),
  makeTemplate("hospital-letterhead", "Hospital Letterhead Template", "hospital-letterhead-template", "Hospital Letterhead Template: Prepare official business communication with a polished editable letterhead layout.", "letterhead", 12852, letterheadFeatures, ["Official letters","Business notices","Proposal documents"]),
  makeTemplate("construction-letterhead", "Construction Letterhead Template", "construction-letterhead-template", "Construction Letterhead Template: Prepare official business communication with a polished editable letterhead layout.", "letterhead", 13583, letterheadFeatures, ["Official letters","Business notices","Proposal documents"]),
  makeTemplate("legal-letterhead", "Legal Letterhead Template", "legal-letterhead-template", "Legal Letterhead Template: Prepare official business communication with a polished editable letterhead layout.", "letterhead", 14314, letterheadFeatures, ["Official letters","Business notices","Proposal documents"]),
  makeTemplate("consultancy-letterhead", "Consultancy Letterhead Template", "consultancy-letterhead-template", "Consultancy Letterhead Template: Prepare official business communication with a polished editable letterhead layout.", "letterhead", 15045, letterheadFeatures, ["Official letters","Business notices","Proposal documents"]),
  makeTemplate("real-estate-letterhead", "Real Estate Letterhead Template", "real-estate-letterhead-template", "Real Estate Letterhead Template: Prepare official business communication with a polished editable letterhead layout.", "letterhead", 15776, letterheadFeatures, ["Official letters","Business notices","Proposal documents"]),
  makeTemplate("accounting-firm-letterhead", "Accounting Firm Letterhead Template", "accounting-firm-letterhead-template", "Accounting Firm Letterhead Template: Prepare official business communication with a polished editable letterhead layout.", "letterhead", 16507, letterheadFeatures, ["Official letters","Business notices","Proposal documents"]),
  makeTemplate("clinic-letterhead", "Clinic Letterhead Template", "clinic-letterhead-template", "Clinic Letterhead Template: Prepare official business communication with a polished editable letterhead layout.", "letterhead", 17238, letterheadFeatures, ["Official letters","Business notices","Proposal documents"]),
  makeTemplate("ngo-letterhead", "NGO Letterhead Template", "ngo-letterhead-template", "NGO Letterhead Template: Prepare official business communication with a polished editable letterhead layout.", "letterhead", 17969, letterheadFeatures, ["Official letters","Business notices","Proposal documents"]),
  makeTemplate("startup-letterhead", "Startup Letterhead Template", "startup-letterhead-template", "Startup Letterhead Template: Prepare official business communication with a polished editable letterhead layout.", "letterhead", 18700, letterheadFeatures, ["Official letters","Business notices","Proposal documents"]),
  makeTemplate("architecture-letterhead", "Architecture Letterhead Template", "architecture-letterhead-template", "Architecture Letterhead Template: Prepare official business communication with a polished editable letterhead layout.", "letterhead", 19431, letterheadFeatures, ["Official letters","Business notices","Proposal documents"]),
  makeTemplate("travel-agency-letterhead", "Travel Agency Letterhead Template", "travel-agency-letterhead-template", "Travel Agency Letterhead Template: Prepare official business communication with a polished editable letterhead layout.", "letterhead", 20162, letterheadFeatures, ["Official letters","Business notices","Proposal documents"]),
  makeTemplate("restaurant-letterhead", "Restaurant Letterhead Template", "restaurant-letterhead-template", "Restaurant Letterhead Template: Prepare official business communication with a polished editable letterhead layout.", "letterhead", 20893, letterheadFeatures, ["Official letters","Business notices","Proposal documents"]),
  makeTemplate("hotel-letterhead", "Hotel Letterhead Template", "hotel-letterhead-template", "Hotel Letterhead Template: Prepare official business communication with a polished editable letterhead layout.", "letterhead", 21624, letterheadFeatures, ["Official letters","Business notices","Proposal documents"]),
  makeTemplate("education-institute-letterhead", "Education Institute Letterhead Template", "education-institute-letterhead-template", "Education Institute Letterhead Template: Prepare official business communication with a polished editable letterhead layout.", "letterhead", 22355, letterheadFeatures, ["Official letters","Business notices","Proposal documents"]),
  makeTemplate("logistics-letterhead", "Logistics Letterhead Template", "logistics-letterhead-template", "Logistics Letterhead Template: Prepare official business communication with a polished editable letterhead layout.", "letterhead", 23086, letterheadFeatures, ["Official letters","Business notices","Proposal documents"]),
  makeTemplate("marketing-agency-letterhead", "Marketing Agency Letterhead Template", "marketing-agency-letterhead-template", "Marketing Agency Letterhead Template: Prepare official business communication with a polished editable letterhead layout.", "letterhead", 23817, letterheadFeatures, ["Official letters","Business notices","Proposal documents"]),
  makeTemplate("event-company-letterhead", "Event Company Letterhead Template", "event-company-letterhead-template", "Event Company Letterhead Template: Prepare official business communication with a polished editable letterhead layout.", "letterhead", 24548, letterheadFeatures, ["Official letters","Business notices","Proposal documents"]),
  makeTemplate("it-company-letterhead", "IT Company Letterhead Template", "it-company-letterhead-template", "IT Company Letterhead Template: Prepare official business communication with a polished editable letterhead layout.", "letterhead", 25279, letterheadFeatures, ["Official letters","Business notices","Proposal documents"]),
];

/** Unfinished templates stay in allTemplates and are hidden until they are ready. */
export const templates: Template[] = allTemplates.filter((template) => template.ready);
