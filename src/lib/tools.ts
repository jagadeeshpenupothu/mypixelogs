import { toolCategories, tools } from "@/data/tools";
import type { Tool, ToolCategory } from "@/types/tool";

export function getToolBySlug(slug: string) {
  return tools.find((tool) => tool.slug === slug && !tool.comingSoon);
}

export function getToolCategoryBySlug(slug: string) {
  return toolCategories.find((category) => category.slug === slug);
}

export function isToolInCategory(tool: Tool, category: ToolCategory) {
  return tool.category === category || tool.secondaryCategories?.includes(category) === true;
}

export function getToolsByCategory(category: ToolCategory) {
  return tools.filter((tool) => isToolInCategory(tool, category));
}

export function getRelatedTools(tool: Tool, limit = 6) {
  const candidates = tools.filter((candidate) => candidate.id !== tool.id);
  const relatedTools = new Map<string, Tool>();

  const addTools = (nextTools: Tool[]) => {
    nextTools.forEach((candidate) => {
      if (relatedTools.size < limit) {
        relatedTools.set(candidate.id, candidate);
      }
    });
  };

  addTools(
    candidates
      .filter((candidate) => isToolInCategory(candidate, tool.category))
      .sort((firstTool, secondTool) => scoreToolMatch(secondTool, tool) - scoreToolMatch(firstTool, tool)),
  );

  addTools(
    candidates
      .filter((candidate) => hasSharedTag(candidate, tool))
      .sort((firstTool, secondTool) => scoreToolMatch(secondTool, tool) - scoreToolMatch(firstTool, tool)),
  );

  addTools(
    candidates
      .filter((candidate) => candidate.featured)
      .sort((firstTool, secondTool) => scoreToolMatch(secondTool, tool) - scoreToolMatch(firstTool, tool)),
  );

  return Array.from(relatedTools.values()).slice(0, limit);
}

function hasSharedTag(candidate: Tool, tool: Tool) {
  const candidateTags = new Set(candidate.tags);
  return tool.tags.some((tag) => candidateTags.has(tag));
}

function scoreToolMatch(candidate: Tool, tool: Tool) {
  const categoryScore = isToolInCategory(candidate, tool.category) ? 100 : 0;
  const sharedTagScore = candidate.tags.filter((tag) => tool.tags.includes(tag)).length * 10;
  const featuredScore = candidate.featured ? 5 : 0;
  const availableScore = candidate.comingSoon ? 0 : 2;

  return categoryScore + sharedTagScore + featuredScore + availableScore;
}
