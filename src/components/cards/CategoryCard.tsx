import Link from "next/link";
import { Award, FileText, FileUser, Receipt, ReceiptText } from "lucide-react";

import type { Category } from "@/types/category";

const icons = {
  Award,
  FileText,
  FileUser,
  Receipt,
  ReceiptText,
};

type CategoryCardProps = {
  category: Category;
};

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = icons[category.icon as keyof typeof icons] ?? FileText;

  return (
    <Link
      href={`/templates/${category.slug}`}
      className="group rounded-lg border border-border bg-card p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft dark:hover:border-neutral-500 dark:hover:shadow-soft"
    >
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-primary shadow-sm transition duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_12px_28px_rgba(37,99,235,0.18)] dark:bg-[#171717] dark:shadow-none dark:group-hover:bg-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold tracking-tight text-foreground">{category.name}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Explore ready-to-edit files for fast business workflows.
      </p>
    </Link>
  );
}
