"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Are all templates free?",
    answer: "Yes. The templates listed on MyPixelogs are free to browse and download.",
  },
  {
    question: "Can I use templates commercially?",
    answer:
      "Templates are designed for professional business use. Always review any included file notes before publishing final work.",
  },
  {
    question: "Do I need an account?",
    answer: "No account is required to use the current templates, resources, or browser tools.",
  },
  {
    question: "Are the online tools free?",
    answer: "Yes. Tools such as the converter, image compressor, and QR generator run in your browser for free.",
  },
  {
    question: "How often are resources updated?",
    answer:
      "The library is structured for ongoing updates as new templates, design resources, and tools are added.",
  },
];

export function FAQSection() {
  const [openQuestion, setOpenQuestion] = useState(faqs[0].question);

  return (
    <section className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">FAQ</p>
          <h2 className="mt-3 text-3xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-card shadow-sm">
          {faqs.map((faq) => {
            const isOpen = openQuestion === faq.question;

            return (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() => setOpenQuestion(isOpen ? "" : faq.question)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-semibold text-foreground">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-muted-foreground transition duration-200",
                      isOpen ? "rotate-180 text-primary" : "",
                    )}
                  />
                </button>
                {isOpen ? (
                  <p className="px-5 pb-5 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
