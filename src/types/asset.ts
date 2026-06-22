export type AssetFile = {
  label: string;
  type: string;
  url: string;
};

export type Asset = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  previewImage: string;
  files?: AssetFile[];
  downloadUrl?: string;
};
