import { resources } from "@/data/resources";
import type { Resource, ResourceFile } from "@/types/resource";

export function getResourceBySlug(slug: string): Resource | undefined {
  return resources.find((resource) => resource.slug === slug);
}

export function getRelatedResources(resource: Resource, limit = 3): Resource[] {
  return resources
    .filter((item) => item.category === resource.category && item.slug !== resource.slug)
    .slice(0, limit);
}

export function getResourceFiles(resource: Resource): ResourceFile[] {
  if (resource.files && resource.files.length > 0) {
    return resource.files;
  }

  if (resource.downloadUrl) {
    return [
      {
        label: "Download",
        type: "FILE",
        url: resource.downloadUrl,
      },
    ];
  }

  return [];
}

export function getResourceRouteSlugs(): string[] {
  return resources.map((resource) => resource.slug);
}
