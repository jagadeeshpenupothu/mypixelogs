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
      className="group rounded-lg border border-border bg-card p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft"
    >
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-blue-50 text-primary transition group-hover:bg-primary group-hover:text-white">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{category.name}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Explore ready-to-edit files for fast business workflows.
      </p>
    </Link>
  );
}
