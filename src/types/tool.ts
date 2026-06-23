export type ToolCategory =
  | "Image Tools"
  | "PDF Tools"
  | "Developer Tools"
  | "Calculator Tools"
  | "Text & Language Tools"
  | "Business Tools"
  | "Design Tools"
  | "Utility Tools";

export type Tool = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  icon: string;
  category: ToolCategory;
  tags: string[];
  secondaryCategories?: ToolCategory[];
  subcategory?: string;
  featured?: boolean;
  comingSoon?: boolean;
};
