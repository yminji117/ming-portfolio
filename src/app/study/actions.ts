"use server";

import { getStudiesPage } from "@/lib/data";
import { LIST_PAGE_SIZE } from "@/lib/constants";
import type { Study } from "@/lib/types";

export async function loadMoreStudies(
  offset: number,
): Promise<{ items: Study[]; total: number }> {
  return getStudiesPage(offset, LIST_PAGE_SIZE);
}
