/**
 * How-to guides: short, practical articles that answer what people search for,
 * each linked to the matching template, prompt or tool on the site.
 */
export type GuideSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  /** A sample letter or format, shown in a box with a copy button. */
  sample?: string;
};

export type Guide = {
  slug: string;
  title: string;
  /** For search results: under 155 characters. */
  description: string;
  category: string;
  updated: string;
  intro: string;
  sections: GuideSection[];
  faqs: { q: string; a: string }[];
  templates: string[];
  prompts: string[];
  sources?: { label: string; url: string }[];
};

export const guides: Guide[] = [
  {
    slug: "how-to-write-a-leave-application",
    title: "How to Write a Leave Application (with Samples)",
    description: "How to write a leave application for office or school: format, what to include, and ready samples for sick leave, casual leave and planned leave.",
    category: "Letters",
    updated: "2026-11-28",
    intro:
      "A leave application is a short, polite request to be away from work or school for a set time. Managers and teachers read many of them, so the best ones are brief, give exact dates, and explain how your work or studies will be covered.",
    sections: [
      {
        heading: "What every leave application should include",
        list: [
          "The date you are writing, and who it is to (name and designation).",
          "A clear subject line, for example: Leave application for 2 days (27–28 November).",
          "The exact dates and number of days, and the type of leave (sick, casual, earned, maternity).",
          "A short, honest reason. One sentence is enough; you don't have to share private medical details.",
          "How your work is covered: who will handle it, or what you will finish before you go.",
          "How to reach you for urgent matters, if you can be reached.",
          "A polite closing, your name, and your employee ID or class and roll number.",
        ],
      },
      {
        heading: "Format",
        paragraphs: [
          "For an office, an email is usually enough; a printed letter is common in schools, colleges and government offices. Keep the same order either way: date and address, subject, greeting, the request with dates, the reason, the work plan, thanks, and your name.",
        ],
      },
      {
        heading: "Sample: sick leave application (office)",
        sample: `Date: 27 November 2026

To
Ms. Kavya Rao
Team Lead, Accounts
ABC Pvt. Ltd., Hyderabad

Subject: Sick leave for 2 days (27–28 November 2026)

Dear Ms. Rao,

I am down with a high fever and the doctor has advised two days of rest. I request sick leave for 27 and 28 November 2026.

Sandeep has agreed to handle the vendor payments during this time, and I have shared the pending list with him. I will be reachable on WhatsApp in the evening for anything urgent.

I will rejoin on 1 December 2026. Thank you for understanding.

Yours sincerely,
Naveen Kumar
Employee ID: ACC-1042`,
      },
      {
        heading: "Sample: leave letter to a school (from a parent)",
        sample: `Date: 27 November 2026

To
The Class Teacher
Class 4B, Sri Chaitanya School, Vijayawada

Subject: Leave for my son Aarav, 28–29 November

Respected Madam,

My son Aarav of Class 4B has fever and will not be able to attend school on 28 and 29 November 2026. Kindly grant him leave for these two days.

Please share the homework so he can catch up. He will return on 1 December.

Thanking you,
Kiran Kumar (father)
Phone: 98490 11223`,
      },
      {
        heading: "Tips that get leave approved faster",
        list: [
          "Ask early for planned leave: at least one or two weeks ahead, and before booking travel.",
          "For sick leave, inform your manager on the same morning, then send the written application.",
          "Mention a doctor's certificate if your workplace needs one for longer sick leave.",
          "Keep the tone polite and confident; don't over-explain or apologise repeatedly.",
          "Check your leave balance first so the request matches the leave type you have.",
        ],
      },
    ],
    faqs: [
      { q: "How long should a leave application be?", a: "Usually 80 to 150 words. Give the dates, a one-line reason, and how your work is covered." },
      { q: "Do I have to give the exact reason for sick leave?", a: "No. 'Unwell, advised rest by the doctor' is enough. You don't need to share private medical details." },
      { q: "Should a leave application be an email or a letter?", a: "Follow your workplace or school's practice. Offices mostly accept email; schools and government offices often ask for a signed letter." },
    ],
    templates: ["leave-application-template"],
    prompts: ["sick-leave-email", "vacation-leave-request", "child-leave-letter-school", "absence-explanation-email"],
  },
  {
    slug: "gst-invoice-format",
    title: "GST Invoice Format: What a Tax Invoice Must Include",
    description: "GST invoice format explained: the details every tax invoice in India must show, invoice numbering rules, HSN codes, CGST/SGST vs IGST, and e-invoicing.",
    category: "Business",
    updated: "2026-11-28",
    intro:
      "If you are registered under GST and sell taxable goods or services, you have to issue a tax invoice that shows certain details set out in Rule 46 of the CGST Rules. Missing details can create problems for your buyer's input tax credit, so it's worth getting the format right once and reusing it.",
    sections: [
      {
        heading: "Details every GST tax invoice must show",
        list: [
          "Your name, address and GSTIN (the supplier).",
          "A unique invoice number in one continuous series for the financial year, up to 16 characters. Letters, numbers, hyphens and slashes are allowed, for example INV/2026-27/0142.",
          "The date of issue.",
          "The buyer's name and address, and their GSTIN if they are registered.",
          "The HSN code for goods or SAC code for services. The number of digits depends on your turnover; smaller businesses use fewer digits.",
          "A description of the goods or services, the quantity and the unit.",
          "The total value, the taxable value after any discount, and the tax rate.",
          "The tax amount split as CGST + SGST (sale within your state) or IGST (sale to another state).",
          "The place of supply with the state name, for sales to another state.",
          "Whether tax is payable under reverse charge.",
          "Your signature or digital signature (or that of an authorised person).",
        ],
      },
      {
        heading: "CGST + SGST or IGST?",
        paragraphs: [
          "If you and your buyer are in the same state, charge CGST and SGST, each at half the GST rate (for 18% GST: 9% + 9%). If the buyer is in another state, charge IGST at the full rate (18%). The place of supply decides which one applies.",
        ],
      },
      {
        heading: "Invoice numbering",
        paragraphs: [
          "Use one series per financial year (April to March) and don't skip or reuse numbers. A prefix with the year, like INV/2026-27/0001, makes it easy to start a new series every April. Credit notes and debit notes can have their own series.",
        ],
      },
      {
        heading: "Do I need e-invoicing?",
        paragraphs: [
          "E-invoicing (generating an IRN on the government portal) applies to B2B invoices of businesses whose aggregate turnover under the same PAN has exceeded ₹5 crore in any financial year since 2017-18. Smaller businesses can keep issuing normal GST invoices. Thresholds can change, so check the GST portal for the latest notification.",
        ],
      },
      {
        heading: "Common mistakes to avoid",
        list: [
          "Charging CGST + SGST on a sale to another state (it should be IGST).",
          "Missing or wrong buyer GSTIN, which stops the buyer from claiming input tax credit.",
          "Repeating or skipping invoice numbers.",
          "Leaving out the HSN/SAC code.",
          "Not writing the total amount in words on high-value invoices, which buyers often ask for.",
        ],
      },
    ],
    faqs: [
      { q: "Can I make a GST invoice in Word or Excel?", a: "Yes. A GST invoice doesn't need special software, as long as it shows all the required details and the numbering is continuous. Larger businesses that must use e-invoicing also generate an IRN on the portal." },
      { q: "What is the maximum length of a GST invoice number?", a: "16 characters, unique for the financial year. Letters, numbers, hyphens and slashes are allowed." },
      { q: "Do I need the buyer's GSTIN?", a: "If the buyer is registered under GST, yes: their GSTIN must be on the invoice so they can claim input tax credit. For unregistered buyers, the name and address are enough (with the state, for sales to another state above the set limit)." },
    ],
    templates: ["gst-invoice-template", "quotation-template", "indigo-invoice-template"],
    prompts: ["payment-reminder-email", "send-quotation-email"],
    sources: [
      { label: "CBIC: Rule 46, Tax invoice", url: "https://taxinformation.cbic.gov.in/content/html/tax_repository/gst/rules/cgst_rules/active/chapter6/rule46_v1.00.html" },
      { label: "CBIC: GST invoice rules", url: "https://cbic-gst.gov.in/gst-invoice-rules.html" },
      { label: "GST Council: Tax invoice (flyer)", url: "https://www.gstcouncil.gov.in/sites/default/files/e-version-gst-flyers/Tax_Invoice_and_other_new.pdf" },
    ],
  },
  {
    slug: "how-to-write-a-resignation-letter",
    title: "How to Write a Resignation Letter (Format and Sample)",
    description: "How to write a professional resignation letter: what to include, notice period, handover, a ready sample, and mistakes to avoid when leaving a job.",
    category: "Letters",
    updated: "2026-11-28",
    intro:
      "A resignation letter is the formal record that you are leaving your job. It should be short, polite and clear about your last working day. The goal is to leave on good terms: your manager may give references, and industries are smaller than they look.",
    sections: [
      {
        heading: "What to include",
        list: [
          "The date, and your manager's name and designation.",
          "A clear statement that you are resigning from your position (name the role).",
          "Your last working day, based on the notice period in your offer letter or contract.",
          "A short thank-you for the opportunity. You don't need to give a reason for leaving.",
          "How you will hand over your work: documents, training a colleague, finishing open tasks.",
          "Your name, employee ID and signature.",
        ],
      },
      {
        heading: "Before you send it",
        list: [
          "Check your notice period (often 30, 60 or 90 days in India) and whether it can be bought out or shortened.",
          "Tell your manager in person or on a call first; then send the letter by email as the formal record.",
          "Keep a copy, and ask HR to confirm the last working day in writing.",
          "Plan the exit formalities: handover, company assets, full and final settlement, relieving and experience letters.",
        ],
      },
      {
        heading: "Sample resignation letter",
        sample: `Date: 1 December 2026

To
Mr. Suresh Babu
Finance Manager
XYZ Industries Ltd., Chennai

Subject: Resignation – Lakshmi Prasad, Senior Accountant

Dear Mr. Babu,

Please accept this letter as formal notice of my resignation from the position of Senior Accountant. As per my 30-day notice period, my last working day will be 31 December 2026.

Thank you for the support and the opportunities to grow over the past three years. I have learned a great deal from you and the team.

Before I leave, I will complete the November closing and train Ramesh on GST filings and month-end reports, so the handover is smooth.

I would be grateful for my relieving letter and experience certificate on my last day.

Yours sincerely,
Lakshmi Prasad
Employee ID: FIN-0317`,
      },
      {
        heading: "Mistakes to avoid",
        list: [
          "Criticising your manager, colleagues or the company in writing.",
          "Leaving out the last working day.",
          "Resigning only by WhatsApp or a message without a formal email or letter.",
          "Promising a handover you can't complete in the notice period.",
        ],
      },
    ],
    faqs: [
      { q: "Do I have to give a reason for resigning?", a: "No. A simple thank-you is enough. If you want to give a reason, keep it short and positive, for example 'to take up a new opportunity'." },
      { q: "Can I resign by email?", a: "Yes, an email is accepted by most companies as a formal resignation. Keep the confirmation from HR." },
      { q: "What if I want to leave before my notice period ends?", a: "Ask your manager or HR about shortening the notice period or a notice buyout. Mention the date you'd prefer in the letter, but confirm what your contract allows." },
    ],
    templates: ["resignation-letter-template", "experience-certificate-template"],
    prompts: ["resignation-email"],
  },
  {
    slug: "rent-receipt-for-hra",
    title: "Rent Receipt for HRA: Format, Rules and What to Include",
    description: "How to make a rent receipt for HRA exemption: what it must show, when the landlord's PAN is needed, revenue stamp rules, and common questions.",
    category: "Personal finance",
    updated: "2026-11-28",
    intro:
      "If you live in a rented house and get House Rent Allowance (HRA) in your salary, your employer usually asks for rent receipts to give you the tax exemption on HRA. A rent receipt is a simple signed note from your landlord confirming the rent paid for a period.",
    sections: [
      {
        heading: "What a rent receipt should include",
        list: [
          "The tenant's name and the landlord's name.",
          "The address of the rented property.",
          "The rent amount and the period it covers (for example, November 2026).",
          "The date of payment and the mode of payment (bank transfer, UPI, cheque or cash).",
          "The landlord's PAN, if the total rent for the year is more than ₹1,00,000.",
          "A revenue stamp, if the rent was paid in cash and the amount is more than ₹5,000.",
          "The landlord's signature.",
        ],
      },
      {
        heading: "When is the landlord's PAN required?",
        paragraphs: [
          "If the rent you pay in a year is more than ₹1,00,000 (more than about ₹8,333 a month), you need to give your employer the landlord's PAN. If the landlord doesn't have a PAN, a signed declaration from the landlord with their name and address is usually accepted instead.",
        ],
      },
      {
        heading: "Monthly or quarterly receipts?",
        paragraphs: [
          "Either works. Many employers accept one receipt per month or per quarter. Paying rent by bank transfer or UPI also gives you a clear payment record to show along with the receipts.",
        ],
      },
      {
        heading: "Things to keep in mind",
        list: [
          "The HRA exemption is generally available only under the old tax regime, not under the new regime. Check which regime you've chosen with your employer.",
          "Rent receipts must be genuine. Paying rent to parents is allowed if they own the house and actually receive the rent (they then show it as income).",
          "Keep receipts and the rental agreement safely; the Income Tax Department can ask for proof later.",
          "Rules change from time to time. Confirm the latest requirements with your employer's HR or a tax adviser.",
        ],
      },
    ],
    faqs: [
      { q: "Is a revenue stamp required on every rent receipt?", a: "Only when the rent is paid in cash and the amount is more than ₹5,000. It isn't needed for payments by cheque, bank transfer or UPI." },
      { q: "Can I pay rent to my parents and claim HRA?", a: "Yes, if your parent owns the house, you really pay the rent, and they declare it as income in their tax return." },
      { q: "Can I claim HRA under the new tax regime?", a: "Generally no. The HRA exemption is part of the old tax regime. Check your chosen regime with your employer." },
    ],
    templates: ["rent-receipt-template"],
    prompts: [],
    sources: [
      { label: "ClearTax: Landlord's PAN for HRA", url: "https://cleartax.in/s/landlord-pan-card-mandatory-for-hra-exemption" },
      { label: "Housing.com: Rent receipt for HRA", url: "https://housing.com/news/rent-receipt-why-is-it-needed-for-hra-exemption" },
    ],
  },
  {
    slug: "how-to-write-a-quotation",
    title: "How to Write a Quotation (Format with GST)",
    description: "How to write a professional quotation for customers: what to include, GST, validity, payment terms, and a format that helps you win the order.",
    category: "Business",
    updated: "2026-11-28",
    intro:
      "A quotation tells a customer exactly what you will supply and at what price, before they place an order. A clear quotation builds trust and saves back-and-forth; a vague one loses the deal to a competitor who explained things better.",
    sections: [
      {
        heading: "What a good quotation includes",
        list: [
          "Your business name, address, phone, email and GSTIN.",
          "A quotation number and date, so you can refer to it later.",
          "The customer's name, company and contact person.",
          "An itemised list: description, quantity, unit price, HSN/SAC code, and amount for each line.",
          "Subtotal, GST (CGST + SGST or IGST) and the grand total, plus the total in words.",
          "Validity: how long the price holds (7 to 30 days is common).",
          "Payment terms (for example 50% advance, balance on delivery), delivery time and warranty.",
          "What is not included, to avoid disputes later.",
          "A line for the customer to accept, and your authorised signature.",
        ],
      },
      {
        heading: "Tips that help you win the order",
        list: [
          "Send it quickly, ideally the same day as the enquiry.",
          "Describe items in the customer's words, not only model numbers.",
          "Offer options (basic and recommended) when the customer's need isn't fixed.",
          "Follow up politely after two or three days if you haven't heard back.",
        ],
      },
      {
        heading: "Quotation vs invoice",
        paragraphs: [
          "A quotation is an offer before the sale; it isn't a tax document and doesn't need a tax invoice number. Once the customer accepts and you supply, you issue a GST invoice with the agreed prices.",
        ],
      },
    ],
    faqs: [
      { q: "Should I include GST in a quotation?", a: "Yes. Show the tax rate and amount separately, so the customer sees the final cost and can plan their input tax credit." },
      { q: "How long should a quotation be valid?", a: "Usually 7 to 30 days, depending on how often your costs change. Write the validity date clearly." },
      { q: "Is a quotation legally binding?", a: "Once the customer accepts it in writing, it works as an agreement on the stated terms. That's why clear terms and exclusions matter." },
    ],
    templates: ["quotation-template", "gst-invoice-template"],
    prompts: ["send-quotation-email", "cold-outreach-client"],
  },
  {
    slug: "how-to-write-a-fresher-resume",
    title: "How to Write a Resume as a Fresher (One-Page Format)",
    description: "How to write a fresher resume with no work experience: what to put first, skills and projects, internships, a one-page format, and mistakes to avoid.",
    category: "Career",
    updated: "2026-11-28",
    intro:
      "As a fresher, your resume has one job: get you shortlisted for an interview. Recruiters spend only seconds on each resume, and many companies use applicant tracking systems (ATS) that read it first. A clean, one-page resume with your education, skills and projects works best.",
    sections: [
      {
        heading: "What to put on a fresher resume (in this order)",
        list: [
          "Name and contact: phone, email, city, and a LinkedIn or GitHub link if you have one.",
          "A 2–3 line summary: who you are and the role you want.",
          "Education: degree, college, year, and CGPA or percentage (most recent first).",
          "Skills: grouped (for example Technical, Software, Languages). List only what you can talk about in an interview.",
          "Projects: 2–3 projects with what you built, the tools used, and a result with a number if possible.",
          "Internships or training, with what you did.",
          "Certifications, achievements and activities that show initiative.",
        ],
      },
      {
        heading: "Writing tips",
        list: [
          "Keep it to one page. Freshers rarely need two.",
          "Start bullet points with action words: built, designed, analysed, led, improved.",
          "Add numbers where you can: 'reduced load time by 30%', 'team of 4', '200+ users'.",
          "Match keywords from the job description so ATS software finds your resume.",
          "Use a simple layout with plain text; avoid tables, photos and graphics if applying online.",
          "Save and send as PDF unless the employer asks for Word.",
        ],
      },
      {
        heading: "Mistakes to avoid",
        list: [
          "Spelling mistakes and an unprofessional email address.",
          "Listing skills you can't explain in an interview.",
          "Long paragraphs instead of short bullet points.",
          "Personal details recruiters don't need (father's name, religion, marital status) unless the employer asks.",
        ],
      },
    ],
    faqs: [
      { q: "What if I have no work experience at all?", a: "Lead with education, skills and projects. College projects, internships, freelance work, volunteering and certifications all count as evidence of what you can do." },
      { q: "Should I add a photo to my resume?", a: "For most private-sector jobs in India and abroad, no. Add one only if the employer asks." },
      { q: "PDF or Word?", a: "PDF keeps the layout the same everywhere. Send Word only if the job posting asks for it." },
    ],
    templates: ["fresher-resume-template", "software-engineer-resume-template"],
    prompts: ["job-application-email", "internship-request-email", "referral-request-email"],
  },
];

export const getGuide = (slug: string) => guides.find((g) => g.slug === slug);
