import Image from "next/image";
import Link from "next/link";
import { Play, Wrench } from "lucide-react";

import { toolIcons } from "@/components/cards/ToolCard";
import { categoryLooks, toolTasks } from "@/data/navigation";
import type { Tool } from "@/types/tool";

const frame =
  "group rounded-xl border border-border bg-card transition-[border-color,box-shadow] duration-200 hover:border-primary/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70";

export function IconBadge({ icon, tone }: { icon: string; tone: string }) {
  const Icon = toolIcons[icon as keyof typeof toolIcons] ?? Wrench;
  return (
    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}>
      <Icon className="h-6 w-6" aria-hidden="true" />
    </span>
  );
}

/** One job: a coloured icon, a short name and what it does. */
export function TaskCard({ href, title, note, icon, tone }: { href: string; title: string; note: string; icon: string; tone: string }) {
  return (
    <Link prefetch={false} href={href} className={`${frame} flex min-h-20 items-center gap-4 p-4`}>
      <IconBadge icon={icon} tone={tone} />
      <span className="min-w-0">
        <span className="block text-base font-semibold leading-6 text-foreground">{title}</span>
        <span className="block text-sm leading-5 text-muted-foreground">{note}</span>
      </span>
    </Link>
  );
}

export function ToolTaskCard({ tool }: { tool: Tool }) {
  return (
    <TaskCard
      href={`/tools/${tool.slug}`}
      title={tool.name}
      note={toolTasks[tool.slug] ?? tool.description}
      icon={tool.icon}
      tone={categoryLooks[tool.category].tone}
    />
  );
}

/** A template or download, shown by its picture. */
export function PictureCard({ href, title, note, image, video = false }: { href: string; title: string; note: string; image: string; video?: boolean }) {
  return (
    <Link prefetch={false} href={href} className={`${frame} flex flex-col overflow-hidden`}>
      <span className="relative block aspect-[4/3] overflow-hidden border-b border-border bg-muted">
        <Image
          src={image}
          alt=""
          width={640}
          height={480}
          className="h-full w-full object-cover object-top transition-transform duration-200 group-hover:scale-[1.02]"
        />
        {video ? (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-[#fff]">
              <Play className="h-5 w-5 translate-x-0.5" aria-hidden="true" />
            </span>
          </span>
        ) : null}
      </span>
      <span className="block p-4">
        <span className="block text-base font-semibold leading-6 text-foreground">{title}</span>
        <span className="mt-0.5 block text-sm leading-5 text-muted-foreground">{note}</span>
      </span>
    </Link>
  );
}
