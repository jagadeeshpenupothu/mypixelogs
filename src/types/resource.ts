export type ResourceFile = {
  label: string;
  type: string;
  url: string;
};

export type Resource = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  previewImage: string;
  files?: ResourceFile[];
  downloadUrl?: string;
};
