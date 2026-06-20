# mypixelogs

A production-ready foundation for a modern SaaS-style resource platform offering free templates, PDF tools, design assets, and business document resources.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- ESLint
- shadcn/ui-compatible component setup
- Lucide React icons

## Project Tree

```text
public/
  downloads/
    *.pdf
  previews/
    *.svg
scripts/
  generate-template-assets.mjs
src/
  app/
    api/
      README.md
    blog/
      page.tsx
    resources/
      page.tsx
    templates/
      [slug]/
        page.tsx
      page.tsx
    tools/
      page.tsx
    globals.css
    layout.tsx
    page.tsx
  components/
    cards/
      CategoryCard.tsx
      ResourceCard.tsx
      TemplateCard.tsx
      ToolCard.tsx
    homepage/
      CTASection.tsx
      CategoriesSection.tsx
      HeroSection.tsx
      LatestTemplatesSection.tsx
      PopularTemplatesSection.tsx
      ResourcesSection.tsx
      StatsSection.tsx
      ToolsSection.tsx
    layout/
      Footer.tsx
      Navbar.tsx
    templates/
      Breadcrumbs.tsx
      RelatedTemplates.tsx
      TemplateActions.tsx
      TemplateHero.tsx
      TemplatePreview.tsx
    ui/
      badge.tsx
      button.tsx
      input.tsx
  constants/
    site.ts
  data/
    categories.ts
    template-categories.ts
    resources.ts
    templates.ts
    tools.ts
  hooks/
  lib/
    utils.ts
  types/
    category.ts
    resource.ts
    template.ts
    tool.ts
```

## Routes

- `/templates`
- `/templates/invoice`
- `/templates/receipt`
- `/templates/resume`
- `/templates/letterhead`
- `/templates/certificate`
- `/templates/hotel-invoice-template`
- `/templates/freelancer-invoice-template`
- `/templates/software-engineer-resume-template`

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run lint
npm run build
npm run start
```

## Generate Placeholder Assets

```bash
npm run generate:assets
```

## Deploy On Vercel

```bash
npm install -g vercel
vercel
vercel --prod
```

## Phase 3 Roadmap

1. Add full-text search, filters, sorting, and pagination for template collections.
2. Connect templates and download files to Supabase or a headless CMS.
3. Add real download analytics, event tracking, and popular-resource scoring.
4. Build template detail pages for tools and resources.
5. Add structured data, sitemap generation, and programmatic SEO collections.
6. Add admin publishing workflows with draft, review, and scheduled publish states.
