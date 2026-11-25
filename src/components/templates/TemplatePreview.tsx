import Image from "next/image";

import type { Template } from "@/types/template";

type TemplatePreviewProps = {
  template: Template;
};

export function TemplatePreview({ template }: TemplatePreviewProps) {
  return (
    <section className="rounded-lg border border-border bg-slate-50 p-4 shadow-sm sm:p-6">
      <div className="overflow-hidden rounded-lg border border-border bg-white">
        {template.previewVideo ? (
          <video
            src={template.previewVideo}
            poster={template.previewImage}
            controls
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={`${template.title} preview`}
            className="h-auto w-full"
          />
        ) : (
        <Image
          src={template.previewImage}
          alt={`${template.title} preview`}
          width={1200}
          height={850}
          className="h-auto w-full"
          priority
        />
        )}
      </div>
    </section>
  );
}
