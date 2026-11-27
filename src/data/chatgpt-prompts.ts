/**
 * ChatGPT prompts. Blanks are written as [Label: example]; the prompt page turns each blank into a box,
 * fills the prompt as people type, and copies it or opens it in ChatGPT.
 */
export type ChatGptPrompt = {
  slug: string;
  title: string;
  category: string;
  /** One line: when to use it. */
  summary: string;
  prompt: string;
};

export const PROMPT_CATEGORIES = ["Job & career", "Office & HR", "Clients & sales", "Customer support", "College & students", "Personal & everyday"] as const;

/** Every email prompt ends with the same clear output rules, so answers are consistent. */
const email = (task: string, details: string[], rules: { tone: string; words: number; extra?: string }) =>
  `${task}

Details:
${details.map((d) => `- ${d}`).join("\n")}

Write it in a ${rules.tone} tone, in simple and clear English. Keep it under ${rules.words} words.${rules.extra ? ` ${rules.extra}` : ""}
Give me: 1) a short subject line, 2) the email body with a greeting and sign-off. Don't invent facts I haven't given; use [brackets] for anything missing.`;

const p = (slug: string, title: string, category: (typeof PROMPT_CATEGORIES)[number], summary: string, prompt: string): ChatGptPrompt => ({ slug, title, category, summary, prompt });

export const chatGptPrompts: ChatGptPrompt[] = [
  // ---------------- Job & career ----------------
  p("job-application-email", "Job application email", "Job & career", "Send your resume for an open position.",
    email("Write an email applying for a job, with my resume attached.", [
      "Position: [Job title: Junior Data Analyst]", "Company: [Company name: Infosys]", "Where I saw the job: [Job source: LinkedIn]",
      "My background: [Your experience or degree: B.Tech CSE 2025, 6-month internship in Python and SQL]", "Why I fit: [Two strengths: data cleaning, dashboards in Power BI]", "My name and phone: [Your name and phone: Ravi Kumar, +91 98765 43210]",
    ], { tone: "confident but polite", words: 170, extra: "Mention that the resume is attached." })),
  p("interview-follow-up-email", "Follow-up after interview", "Job & career", "Check on the status a week after an interview.",
    email("Write a follow-up email asking about the status of my job application after an interview.", [
      "Interviewer: [Interviewer name: Ms. Priya Sharma]", "Role: [Job title: Marketing Executive]", "Interview date: [Date: 12 November]",
      "Something we discussed: [Topic from the interview: the festive campaign plan]", "My name: [Your name: Anjali Reddy]",
    ], { tone: "polite and positive", words: 130 })),
  p("thank-you-after-interview", "Thank-you email after interview", "Job & career", "Thank the interviewer the same day.",
    email("Write a thank-you email to send on the same day as my job interview.", [
      "Interviewer: [Interviewer name: Mr. Arjun Mehta]", "Role: [Job title: Software Engineer]", "What I enjoyed learning: [Point from the interview: how the team ships weekly releases]",
      "One skill to remind them of: [Your key skill: React and Node.js]", "My name: [Your name: Kiran Rao]",
    ], { tone: "warm and professional", words: 140 })),
  p("accept-job-offer-email", "Accept a job offer", "Job & career", "Accept an offer and confirm the joining date.",
    email("Write an email accepting a job offer.", [
      "Company: [Company name: TCS]", "Role: [Job title: Associate Consultant]", "Salary as offered: [CTC: ₹6.5 LPA]",
      "Joining date: [Joining date: 2 January 2026]", "Documents I will bring: [Documents: degree certificate, ID proof, relieving letter]", "My name: [Your name: Sneha Iyer]",
    ], { tone: "grateful and professional", words: 140 })),
  p("decline-job-offer-email", "Decline a job offer politely", "Job & career", "Say no without burning the bridge.",
    email("Write an email politely declining a job offer.", [
      "Company: [Company name: Wipro]", "Role: [Job title: Business Analyst]", "Reason (keep it short): [Reason: accepted another offer closer to my career goals]",
      "Hiring contact: [Recruiter name: Mr. Rahul Verma]", "My name: [Your name: Meera Nair]",
    ], { tone: "respectful and grateful", words: 120, extra: "Leave the door open for the future." })),
  p("salary-negotiation-email", "Negotiate a salary offer", "Job & career", "Ask for a better package with reasons.",
    email("Write an email negotiating the salary in a job offer I received.", [
      "Company and role: [Company and role: Zoho, Product Designer]", "Offered salary: [Offered CTC: ₹8 LPA]", "What I am asking for: [Expected CTC: ₹9.5 LPA]",
      "Why: [Your reasons: 3 years of experience, market rate for this role, a competing offer]", "My name: [Your name: Aditya Joshi]",
    ], { tone: "confident, polite and collaborative", words: 170, extra: "Show I'm keen on the role." })),
  p("resignation-email", "Resignation email", "Job & career", "Resign formally with your last working day.",
    email("Write a resignation email to my manager.", [
      "Manager: [Manager name: Mr. Suresh Babu]", "My role: [Your designation: Senior Accountant]", "Last working day: [Last day: 31 December 2026]",
      "Notice period: [Notice period: 30 days]", "Handover plan: [Handover: train Ramesh on GST filings and month-end closing]", "My name: [Your name: Lakshmi Prasad]",
    ], { tone: "grateful and professional", words: 160 })),
  p("referral-request-email", "Ask for a job referral", "Job & career", "Request a referral from a contact at the company.",
    email("Write an email asking a contact to refer me for a job at their company.", [
      "Contact: [Contact name and how you know them: Vikram, my college senior]", "Company and role: [Company and job: Amazon, SDE-1, job ID 12345]",
      "Why I fit: [Your fit: 2 years in Java backend, AWS certified]", "What I'm attaching: [Attachments: resume]", "My name: [Your name: Harsha Vardhan]",
    ], { tone: "friendly and respectful", words: 150, extra: "Make it easy for them to say yes or no." })),
  p("internship-request-email", "Ask for an internship", "Job & career", "Cold email a company for an internship.",
    email("Write a cold email asking for an internship.", [
      "Company: [Company name: a digital marketing agency in Hyderabad]", "Area of interest: [Field: social media marketing]", "Duration and dates: [Duration: 2 months, May–June]",
      "My course: [Your course: BBA 2nd year, Osmania University]", "What I can do: [Skills: Canva, Instagram content, basic copywriting]", "My name: [Your name: Divya Teja]",
    ], { tone: "eager and professional", words: 160 })),

  // ---------------- Office & HR ----------------
  p("sick-leave-email", "Sick leave email", "Office & HR", "Tell your manager you're unwell and taking leave.",
    email("Write a sick leave email to my manager.", [
      "Manager: [Manager name: Ms. Kavya]", "Dates: [Leave dates: today and tomorrow, 27–28 November]", "Reason: [Illness: fever, doctor advised rest]",
      "Work cover: [Who covers your work: Sandeep will handle client calls]", "Reachable for urgent issues: [Availability: on WhatsApp in the evening]", "My name: [Your name: Naveen]",
    ], { tone: "polite and brief", words: 110 })),
  p("vacation-leave-request", "Vacation leave request", "Office & HR", "Request planned leave in advance.",
    email("Write an email requesting planned leave.", [
      "Manager: [Manager name: Mr. Ajay]", "Dates: [Leave dates: 20–27 December]", "Reason: [Reason: family function in my hometown]",
      "Work plan: [Before you leave: finish the Q3 report by 18 December]", "Backup person: [Backup: Pooja]", "My name: [Your name: Sravani]",
    ], { tone: "polite and professional", words: 130 })),
  p("work-from-home-request", "Work-from-home request", "Office & HR", "Ask to work from home for a few days.",
    email("Write an email asking my manager to let me work from home.", [
      "Manager: [Manager name: Ms. Neha]", "Dates: [Dates: 2–6 December]", "Reason: [Reason: home renovation needs me to be present]",
      "How work continues: [Commitment: online 9:30–6:30, all meetings on Teams]", "My name: [Your name: Rohit]",
    ], { tone: "polite and reassuring", words: 120 })),
  p("meeting-request-email", "Request a meeting", "Office & HR", "Ask a colleague or senior for a short meeting.",
    email("Write an email requesting a meeting.", [
      "With: [Person and role: Mr. Prakash, Head of Operations]", "Purpose: [Topic: plan the vendor onboarding process]", "Length: [Duration: 30 minutes]",
      "Time options: [Suggested slots: Tue 11 am, Wed 3 pm or Thu 10 am]", "Mode: [Mode: Google Meet or his office]", "My name: [Your name: Swathi, Procurement]",
    ], { tone: "professional and concise", words: 120 })),
  p("meeting-minutes-follow-up", "Meeting follow-up with action items", "Office & HR", "Share decisions and who does what after a meeting.",
    email("Write a follow-up email after a meeting that summarises decisions and action items.", [
      "Meeting: [Meeting name and date: Website relaunch review, 26 Nov]", "Decisions: [Decisions made: launch on 15 Dec, new pricing page approved]",
      "Action items with owners and dates: [Action items: Ravi – final copy by 5 Dec; Asha – design QA by 8 Dec; me – go-live checklist by 10 Dec]", "Next meeting: [Next meeting: 9 Dec, 4 pm]", "My name: [Your name: Manoj]",
    ], { tone: "clear and professional", words: 180, extra: "Put the action items in a bulleted list." })),
  p("project-status-update", "Weekly project status update", "Office & HR", "Update your manager or client on progress.",
    email("Write a weekly project status update email.", [
      "Project: [Project name: Mobile app for ABC Clinics]", "Done this week: [Completed: login, appointment booking screens]", "Next week: [Planned: payment integration, testing]",
      "Risks or blockers: [Blockers: waiting for payment gateway keys from client]", "Overall status: [Status: on track]", "My name: [Your name: Teja, Project Lead]",
    ], { tone: "clear and confident", words: 170, extra: "Use short headings: Done, Next, Blockers." })),
  p("appraisal-raise-request", "Ask for a raise or appraisal review", "Office & HR", "Make a fact-based case for a salary increase.",
    email("Write an email to my manager asking for a salary review.", [
      "Manager: [Manager name: Ms. Deepa]", "Time in role: [Tenure: 2 years as Sales Executive]",
      "Achievements with numbers: [Achievements: grew my region's sales 35%, closed 12 new dealers, trained 3 juniors]", "What I'm asking for: [Request: a meeting to discuss a 15% raise]", "My name: [Your name: Venkatesh]",
    ], { tone: "confident and respectful", words: 170 })),
  p("missed-deadline-apology", "Apology for a missed deadline", "Office & HR", "Own a delay and give a new date.",
    email("Write an email apologising to my manager for missing a deadline.", [
      "Manager: [Manager name: Mr. Kishore]", "Task: [Task: monthly sales report]", "Original deadline: [Deadline: yesterday]",
      "Reason (short, no excuses): [Reason: data from two branches arrived late]", "New date and fix: [New date and fix: by 3 pm today; I'll ask branches for data 2 days earlier]", "My name: [Your name: Bhavana]",
    ], { tone: "honest and responsible", words: 130 })),
  p("welcome-new-team-member", "Welcome a new team member", "Office & HR", "Introduce a new joiner to the team.",
    email("Write an email welcoming a new team member and introducing them to the team.", [
      "New member: [Name and role: Farhan, UI Designer]", "Joining date: [Date: Monday, 1 December]", "Background: [Background: 3 years at a fintech startup]",
      "Buddy for the first week: [Buddy: Nikhil]", "Fun fact: [Fun fact: loves cricket and sketching]", "From: [Your name and role: Shalini, Design Manager]",
    ], { tone: "warm and friendly", words: 140 })),
  p("internal-announcement-email", "Office announcement to all staff", "Office & HR", "Announce a holiday, policy or event to everyone.",
    email("Write an announcement email to all employees.", [
      "Announcement: [What: office closed for Sankranti]", "Dates: [Dates: 14–15 January]", "What staff should do: [Action: finish pending approvals by 13 January]",
      "Contact for questions: [Contact: HR, hr@company.com]", "From: [Your name and role: Anitha, HR Manager]",
    ], { tone: "friendly and clear", words: 120 })),

  // ---------------- Clients & sales ----------------
  p("cold-outreach-client", "Cold email to a new client", "Clients & sales", "Pitch your service to a business you haven't met.",
    email("Write a short cold email to a potential client.", [
      "Prospect: [Their business: a chain of 4 restaurants in Vijayawada]", "Their likely problem: [Problem: few online orders, outdated Instagram]",
      "My service: [Your service: social media management and Swiggy/Zomato listing optimisation]", "Proof: [Proof: helped a café grow online orders 40% in 3 months]", "Call to action: [Ask: a 15-minute call this week]", "My name and company: [Your name and company: Sai, PixelGrow Media]",
    ], { tone: "friendly, confident and to the point", words: 140, extra: "No hype words; make the first line about them." })),
  p("send-quotation-email", "Send a quotation", "Clients & sales", "Email a quote with a short summary.",
    email("Write an email sending a quotation to a client.", [
      "Client: [Client name: Mr. Ravi, Kumar Textiles]", "What the quote covers: [Scope: office IT setup for 10 workstations]", "Total: [Amount: ₹9,22,760 including GST]",
      "Validity: [Validity: 30 days]", "Key terms: [Terms: 50% advance, delivery in 3–4 weeks]", "My name and company: [Your name and company: Sharma IT Solutions]",
    ], { tone: "professional and helpful", words: 140, extra: "Say the quotation PDF is attached and invite questions." })),
  p("payment-reminder-email", "Polite payment reminder", "Clients & sales", "Remind a client about an invoice that's due.",
    email("Write a polite payment reminder email for an unpaid invoice.", [
      "Client: [Client name: Accounts team, Sunrise Hotels]", "Invoice: [Invoice number and date: INV-2026-118, 1 November]", "Amount: [Amount: ₹48,000]",
      "Due date: [Due date: 15 November]", "Payment options: [How to pay: bank transfer or UPI sunrise@upi]", "My name: [Your name: Kavitha, Accounts]",
    ], { tone: "friendly and polite", words: 120, extra: "Assume it may be an oversight." })),
  p("overdue-payment-second-reminder", "Firm reminder for overdue payment", "Clients & sales", "Second reminder when payment is late.",
    email("Write a firm but professional second reminder for an overdue invoice.", [
      "Client: [Client name: Mr. Anil, Greenfield Builders]", "Invoice: [Invoice number: INV-2026-097]", "Amount and days overdue: [Amount and delay: ₹1,20,000, 30 days overdue]",
      "Earlier reminder: [Earlier reminder date: 10 November]", "Next step if unpaid: [Consequence: work on phase 2 will pause from 5 December]", "My name: [Your name: Rajesh, Finance]",
    ], { tone: "firm, calm and professional", words: 140 })),
  p("price-increase-announcement", "Price increase announcement", "Clients & sales", "Tell customers about a price change gracefully.",
    email("Write an email informing customers about a price increase.", [
      "Product or service: [What: monthly bookkeeping plans]", "Old and new price: [Prices: ₹2,999 to ₹3,499 per month]", "Effective date: [From: 1 January 2027]",
      "Reason: [Reason: higher compliance work and new GST e-invoicing support]", "Something extra they get: [Added value: quarterly review call included]", "From: [Your name and company: Neha, LedgerEase]",
    ], { tone: "transparent and appreciative", words: 160 })),
  p("client-thank-you-after-project", "Thank a client after a project", "Clients & sales", "Close a project warmly and invite future work.",
    email("Write a thank-you email to a client after finishing a project.", [
      "Client: [Client name: Ms. Fatima, Bloom Boutique]", "Project: [Project: new e-commerce website]", "Result so far: [Result: 120 orders in the first month]",
      "Next offer: [Offer: free 30-day support, or monthly maintenance plan]", "My name: [Your name: Arun, WebCraft Studio]",
    ], { tone: "warm and professional", words: 140 })),
  p("testimonial-request-email", "Ask a client for a review", "Clients & sales", "Request a Google review or testimonial.",
    email("Write an email asking a happy client for a short review.", [
      "Client: [Client name: Dr. Ramesh, Smile Dental Clinic]", "What we did: [Work done: clinic branding and website]", "Where to review: [Review link: Google review link]",
      "Make it easy: [Suggestion: 2–3 lines on what they liked]", "My name: [Your name: Pavani, Brandly]",
    ], { tone: "friendly and grateful", words: 110 })),
  p("partnership-proposal-email", "Partnership proposal", "Clients & sales", "Propose a collaboration with another business.",
    email("Write an email proposing a business partnership.", [
      "Partner: [Their business: a popular yoga studio in Bengaluru]", "My business: [Your business: healthy meal delivery]", "Idea: [Partnership idea: 10% off meals for their members, we promote their classes]",
      "Benefit for them: [Their benefit: extra value for members, new sign-ups from our 3,000 customers]", "Next step: [Ask: a coffee meeting next week]", "My name: [Your name: Kiran, FitBowl]",
    ], { tone: "friendly and business-like", words: 160 })),
  p("reschedule-meeting-client", "Reschedule a client meeting", "Clients & sales", "Move a meeting without sounding careless.",
    email("Write an email to reschedule a meeting with a client.", [
      "Client: [Client name: Mr. Varun]", "Original meeting: [Original time: Thursday 4 pm]", "Reason (brief): [Reason: an urgent site visit]",
      "New options: [New slots: Friday 11 am or Monday 3 pm]", "My name: [Your name: Shreya]",
    ], { tone: "apologetic and professional", words: 100 })),

  // ---------------- Customer support ----------------
  p("reply-to-complaint", "Reply to a customer complaint", "Customer support", "Apologise and explain how you'll fix it.",
    email("Write a reply to an unhappy customer's complaint.", [
      "Customer: [Customer name: Mr. Satish]", "Complaint: [Issue: delivered mixer grinder had a broken jar]", "Order: [Order number: #45821]",
      "Our fix: [Solution: free replacement jar shipped within 48 hours, no return needed]", "Goodwill gesture: [Extra: ₹200 coupon on next order]", "From: [Your name and company: Anusha, KitchenKart Support]",
    ], { tone: "empathetic, apologetic and solution-focused", words: 150, extra: "Don't blame the customer or the courier." })),
  p("refund-confirmation-email", "Refund confirmation", "Customer support", "Confirm a refund and when it will arrive.",
    email("Write an email confirming a customer's refund.", [
      "Customer: [Customer name: Ms. Lavanya]", "Order: [Order number: #77310]", "Refund amount: [Amount: ₹1,499]",
      "Method and timeline: [Method and time: original payment method, 5–7 working days]", "From: [Your name and company: Support team, StyleHub]",
    ], { tone: "reassuring and friendly", words: 110 })),
  p("order-delay-notice", "Order delay notice", "Customer support", "Tell a customer their order will be late.",
    email("Write an email telling a customer that their order is delayed.", [
      "Customer: [Customer name: Mr. Imran]", "Order: [Order number: #90012]", "Reason: [Reason: heavy rains affecting courier routes]",
      "New delivery date: [New date: 3 December]", "Options: [Options: wait, or cancel for a full refund]", "From: [Your name and company: Care team, GadgetBay]",
    ], { tone: "apologetic and clear", words: 130 })),
  p("product-launch-announcement", "New product launch email", "Customer support", "Announce a new product to your customers.",
    email("Write an email announcing a new product to existing customers.", [
      "Product: [Product: cold-pressed groundnut oil, 1 L]", "Key benefits: [Benefits: wood-pressed, no chemicals, from local farms]", "Launch offer: [Offer: 20% off till Sunday with code FRESH20]",
      "Where to buy: [Link: our website]", "From: [Your brand: Annapurna Naturals]",
    ], { tone: "exciting but genuine", words: 140, extra: "Give 3 subject line options." })),
  p("feedback-request-email", "Ask customers for feedback", "Customer support", "Request a short survey after a purchase.",
    email("Write an email asking a customer for feedback after their purchase.", [
      "Customer: [Customer name: Ms. Harika]", "What they bought or used: [Purchase: home cleaning service]", "Survey: [Survey length and link: 2 minutes, survey link]",
      "Thank-you: [Incentive: ₹100 off the next booking]", "From: [Your brand: SparkleHome]",
    ], { tone: "friendly and short", words: 100 })),
  p("service-outage-notice", "Service outage notice", "Customer support", "Inform users about downtime or an issue.",
    email("Write an email informing customers about a service outage.", [
      "Service: [Service: online billing app]", "What happened: [Issue: login problems for some users]", "When: [Time: 10:15 am to 12:40 pm today]",
      "Status: [Status: fixed; no data was lost]", "What we're doing next: [Prevention: extra server monitoring]", "From: [Your name and company: Tech team, BillEasy]",
    ], { tone: "transparent, calm and apologetic", words: 140 })),
  p("welcome-new-customer", "Welcome email for new customers", "Customer support", "Greet a new sign-up and show the first steps.",
    email("Write a welcome email for a new customer who just signed up.", [
      "Customer: [Customer name: Raghav]", "Product: [Product: online tuition platform for class 10]", "First 3 steps: [Steps: complete profile, pick subjects, join the free demo class]",
      "Help contact: [Support: WhatsApp +91 90000 12345]", "From: [Your brand: LearnBright]",
    ], { tone: "warm and encouraging", words: 140 })),

  // ---------------- College & students ----------------
  p("assignment-extension-request", "Ask a professor for an extension", "College & students", "Request more time for an assignment.",
    email("Write an email to my professor asking for an assignment extension.", [
      "Professor: [Professor name: Dr. Srinivas]", "Course and assignment: [Course and assignment: Data Structures, Lab Record 3]", "Current deadline: [Deadline: Friday]",
      "Reason: [Reason: I was hospitalised for 3 days; medical certificate attached]", "New date requested: [New date: next Wednesday]", "My details: [Your name and roll number: Rahul, 22CS045]",
    ], { tone: "respectful and honest", words: 130 })),
  p("recommendation-letter-request", "Request a recommendation letter", "College & students", "Ask a professor for a letter of recommendation.",
    email("Write an email asking my professor for a recommendation letter.", [
      "Professor: [Professor name: Prof. Anuradha]", "What it's for: [Purpose: MS in Computer Science, USA]", "Deadline: [Deadline: 15 January]",
      "How they know me: [Connection: her Machine Learning course (A grade) and my final-year project under her]", "What I'll send: [Attachments: resume, SOP draft, list of universities]", "My name: [Your name and roll number: Sai Charan, 21IT032]",
    ], { tone: "respectful and grateful", words: 170 })),
  p("project-guidance-request", "Ask a professor to guide your project", "College & students", "Request a guide for a final-year project.",
    email("Write an email asking a professor to guide my final-year project.", [
      "Professor: [Professor name: Dr. Ramya]", "Project idea: [Idea: crop disease detection from leaf photos using deep learning]", "Team: [Team: 3 students, ECE final year]",
      "Why them: [Reason: her research in image processing]", "Ask: [Ask: a 15-minute meeting this week]", "My name: [Your name and roll number: Gopi, 21EC018]",
    ], { tone: "respectful and enthusiastic", words: 150 })),
  p("absence-explanation-email", "Explain an absence to a teacher", "College & students", "Inform about missed classes and catch up.",
    email("Write an email to my class teacher explaining my absence.", [
      "Teacher: [Teacher name: Mrs. Sunitha]", "Dates missed: [Dates: 24–26 November]", "Reason: [Reason: sister's wedding]",
      "Catch-up plan: [Plan: collect notes from Ravi and submit pending work by Monday]", "My name: [Your name, class and roll number: Teja, B.Com 2nd year, 45]",
    ], { tone: "respectful and brief", words: 110 })),
  p("bonafide-certificate-request", "Request a bonafide certificate", "College & students", "Ask the college office for a certificate.",
    email("Write an email to my college office requesting a bonafide certificate.", [
      "To: [Office: The Principal / Student Section]", "Purpose: [Purpose: scholarship application / bank education loan]", "Needed by: [Date needed: 5 December]",
      "My details: [Your name, course, year and roll number: Mounika, B.Sc 3rd year, 21BS077]", "Collection: [Collection: will collect from the office]",
    ], { tone: "formal and polite", words: 110 })),
  p("scholarship-enquiry-email", "Scholarship enquiry", "College & students", "Ask about eligibility and how to apply.",
    email("Write an email enquiring about a scholarship.", [
      "To: [Organisation: scholarship cell of XYZ Foundation]", "Scholarship: [Scholarship name: Merit-cum-Means Scholarship 2026]",
      "My profile: [Your profile: B.Tech 1st year, 92% in Intermediate, family income ₹2.4 lakh per year]", "Questions: [Questions: eligibility, documents needed, last date]", "My name: [Your name and phone: Akhila, 98480 12345]",
    ], { tone: "polite and clear", words: 140 })),

  // ---------------- Personal & everyday ----------------
  p("complaint-to-landlord", "Complaint to landlord or society", "Personal & everyday", "Report a repair or maintenance problem.",
    email("Write an email to my landlord (or housing society) asking for a repair.", [
      "To: [Recipient: Mr. Rao, house owner]", "Problem: [Issue: water leakage from the bathroom ceiling]", "Since when: [Since: last 10 days]",
      "Impact: [Impact: damp walls, risk to electrical wiring]", "Request: [Request: send a plumber by this weekend]", "My details: [Your name and flat: Priya, Flat 302]",
    ], { tone: "polite but firm", words: 130 })),
  p("bank-complaint-email", "Complaint to a bank", "Personal & everyday", "Report a failed transaction or wrong charge.",
    email("Write a complaint email to my bank.", [
      "Bank: [Bank and branch: SBI, Ameerpet branch]", "Problem: [Issue: ₹5,000 debited but ATM didn't give cash]", "Transaction details: [Details: 25 Nov, 7:42 pm, ATM ID if known, reference number]",
      "Account: [Account: last 4 digits 4321]", "Request: [Request: reverse the amount within the RBI timeline]", "My name and phone: [Your name and phone: Srinivas, 98490 00000]",
    ], { tone: "formal, clear and firm", words: 150, extra: "Do not include the full account number." })),
  p("cancel-subscription-email", "Cancel a subscription", "Personal & everyday", "Stop a plan and confirm no more charges.",
    email("Write an email cancelling a subscription.", [
      "Service: [Service: gym membership / OTT / software plan]", "Account: [Account ID or registered phone: 98765 43210]", "Cancel from: [Effective date: end of current billing cycle]",
      "Request: [Request: stop auto-debit and confirm in writing]", "My name: [Your name: Raju]",
    ], { tone: "polite and clear", words: 100 })),
  p("wedding-invitation-email", "Wedding invitation email", "Personal & everyday", "Invite friends or colleagues to a wedding.",
    email("Write a wedding invitation email.", [
      "Couple: [Names: Arjun & Sneha]", "Date and muhurtham: [Date and time: 12 February 2027, 10:30 am]", "Venue: [Venue: Sri Convention Hall, Guntur]",
      "Other events: [Other events: reception 11 Feb, 7 pm]", "Who it's from: [From: the bride/groom or family, e.g. Arjun]", "RSVP: [RSVP: reply by 1 February]",
    ], { tone: "warm and joyful", words: 140 })),
  p("condolence-email", "Condolence message", "Personal & everyday", "Express sympathy to a colleague or friend.",
    email("Write a condolence email.", [
      "To: [Recipient and relation to you: my colleague Ramesh]", "Loss: [Who passed away: his father]", "A memory or quality (optional): [Memory: he always spoke proudly of his father's teaching career]",
      "Offer of help: [Offer: we'll cover his work; take all the time he needs]", "My name: [Your name: Sunil]",
    ], { tone: "gentle, sincere and short", words: 100, extra: "Avoid clichés." })),
  p("congratulations-promotion-email", "Congratulate on a promotion", "Personal & everyday", "Celebrate someone's new role.",
    email("Write an email congratulating someone on their promotion.", [
      "To: [Name: Madhavi]", "New role: [New role: Assistant General Manager]", "Why it's deserved: [Reason: led the plant expansion on time]",
      "Personal touch: [Personal note: I learned a lot working with her on the audit]", "My name: [Your name: Kalyan]",
    ], { tone: "warm and sincere", words: 100 })),
  p("insurance-claim-follow-up", "Insurance claim follow-up", "Personal & everyday", "Chase the status of a pending claim.",
    email("Write an email following up on a pending insurance claim.", [
      "Insurer: [Insurance company: Star Health]", "Claim number: [Claim number: CLM-4567890]", "Policy holder: [Policy holder and policy number: my mother, policy ending 9087]",
      "Submitted on: [Submitted: 2 November, all documents attached]", "Request: [Request: current status and expected settlement date]", "My name and phone: [Your name and phone: Harish, 99887 66554]",
    ], { tone: "polite and firm", words: 130 })),
  p("child-leave-letter-school", "Leave email to child's school", "Personal & everyday", "Inform the class teacher about your child's leave.",
    email("Write an email from a parent to the class teacher about the child's leave.", [
      "Teacher: [Teacher name: Mrs. Revathi]", "Child: [Child's name and class: Aarav, Class 4B]", "Dates: [Dates: 28–29 November]",
      "Reason: [Reason: fever]", "Request: [Request: share homework so he can catch up]", "Parent: [Your name and phone: Kiran (father), 98490 11223]",
    ], { tone: "polite and brief", words: 100 })),
  p("government-office-request", "Request to a government office", "Personal & everyday", "Formal request or follow-up with a department.",
    email("Write a formal email to a government office.", [
      "To: [Office: Municipal Commissioner, GHMC Circle 12]", "Subject of request: [Request: repair of streetlights on our lane]", "Location: [Location: Lane 4, Kukatpally]",
      "Since when / reference: [Details: dark for 3 weeks; complaint no. 556677 filed on 5 Nov]", "Impact: [Impact: safety risk for women and children at night]", "From: [Your name, address and phone: Ramesh, Plot 22, Lane 4, 98480 55443]",
    ], { tone: "formal and respectful", words: 150 })),
];
