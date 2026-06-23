import type { BaseContentItem, ContentItem } from "@/content/types";

type ValidationResult = {
  valid: boolean;
  errors: string[];
};

const requiredStringFields: (keyof BaseContentItem)[] = [
  "title",
  "slug",
  "description",
  "category",
  "coverImage",
  "publishedAt",
];

export function validateBaseContentItem(item: BaseContentItem): ValidationResult {
  const errors: string[] = [];

  requiredStringFields.forEach((field) => {
    if (typeof item[field] !== "string" || item[field].trim().length === 0) {
      errors.push(`${String(field)} is required`);
    }
  });

  if (!Array.isArray(item.tags)) {
    errors.push("tags must be an array");
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) {
    errors.push("slug must be lowercase kebab-case");
  }

  if (Number.isNaN(Date.parse(item.publishedAt))) {
    errors.push("publishedAt must be a valid date string");
  }

  return { valid: errors.length === 0, errors };
}

export function validateContentItems(items: ContentItem[]) {
  const errors = items.flatMap((item) => {
    const result = validateBaseContentItem(item);
    return result.errors.map((error) => `${item.slug}: ${error}`);
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
