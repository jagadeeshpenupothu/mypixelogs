import Image from "next/image";
import Link from "next/link";

import { CopyPromptButton } from "@/components/content/CopyPromptButton";
import { Breadcrumbs } from "@/components/templates/Breadcrumbs";
import type { AiPrompt, ContentItem } from "@/content/types";

type AiPromptDetailPageProps = {
  item: AiPrompt;
  relatedItems: ContentItem[];
};

export function AiPromptDetailPage({ item, relatedItems }: AiPromptDetailPageProps) {
  const relatedPrompts = relatedItems.filter((related): related is AiPrompt => related.kind === "ai-prompt");

  return (
    <article className="bg-white py-3 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "AI Hub", href: "/ai" },
            { label: "AI Prompts", href: "/ai/prompts" },
            { label: item.title },
          ]}
        />

        <section className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-center">
          <div className="overflow-hidden rounded-xl border border-border bg-slate-50 p-2 dark:bg-[#111111]">
            <Image
              src={item.coverImage}
              alt={`${item.title} preview`}
              width={960}
              height={720}
              priority
              className="h-auto w-full rounded-lg object-cover"
            />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-primary">{item.category}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{item.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{item.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Prompt</h2>
                <p className="mt-1 text-xs font-semibold text-muted-foreground">{item.prompt.length.toLocaleString()} characters</p>
              </div>
              <CopyPromptButton prompt={item.prompt} />
            </div>
            <p className="mt-4 rounded-lg border border-border bg-background p-4 text-sm leading-7 text-foreground">
              {item.prompt}
            </p>
          </div>

          <div className="space-y-5">
            <section className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-bold text-foreground">Best Use Cases</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {item.useCases.map((useCase) => (
                  <li key={useCase} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                    <span>{useCase}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-bold text-foreground">Tips</h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                {item.tips.map((tip) => (
                  <li key={tip} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-card p-4">
          <h2 className="text-lg font-bold text-foreground">Output Example</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-border bg-slate-50 p-2 dark:bg-[#111111]">
            <Image
              src={item.outputExampleImage}
              alt={`${item.title} output example`}
              width={960}
              height={640}
              loading="lazy"
              className="h-auto w-full rounded-md object-cover"
            />
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold text-foreground">Related Prompts</h2>
            <Link href="/ai/prompts" className="text-sm font-semibold text-primary hover:underline">
              Browse all
            </Link>
          </div>
          {relatedPrompts.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedPrompts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/ai/prompts/${related.slug}`}
                  className="group overflow-hidden rounded-lg border border-border bg-card transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/40"
                >
                  <div className="overflow-hidden bg-slate-50 p-1.5 dark:bg-[#111111]">
                    <Image
                      src={related.coverImage}
                      alt={`${related.title} preview`}
                      width={480}
                      height={360}
                      loading="lazy"
                      className="h-auto w-full rounded-sm object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-[11px] font-bold uppercase text-primary">{related.category}</p>
                    <h3 className="mt-2 line-clamp-2 text-sm font-bold text-foreground">{related.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-border bg-card px-4 py-8 text-center">
              <p className="text-sm font-semibold text-foreground">No related prompts yet</p>
            </div>
          )}
        </section>
      </div>
    </article>
  );
}
