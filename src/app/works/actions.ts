"use server";

import { getProjectsPage } from "@/lib/data";
import { LIST_PAGE_SIZE } from "@/lib/constants";
import type { Project, ProjectCategory } from "@/lib/types";

export async function loadMoreProjects(
  category: ProjectCategory,
  offset: number,
): Promise<{ items: Project[]; total: number }> {
  return getProjectsPage(category, offset, LIST_PAGE_SIZE);
}
