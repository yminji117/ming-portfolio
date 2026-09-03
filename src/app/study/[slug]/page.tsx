import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, ExpandCircleRightIcon } from "@/components/icons";
import { ContentBlocks } from "@/components/content-blocks";
import { ContentProtect } from "@/components/content-protect";
import { Footer } from "@/components/footer";
import { Gnb } from "@/components/gnb";
import { ProjectGallery } from "@/components/project-gallery";
import { Tag } from "@/components/tag";
import { getAbout, getAdjacentStudies, getCategories, getStudyBySlug } from "@/lib/data";
import { formatCareerRange, sortStudyTagsForDisplay } from "@/lib/format";

export async function generateMetadata(
  props: PageProps<"/study/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const study = await getStudyBySlug(slug);
  if (!study) return { title: "Study | MINJI" };

  return {
    title: `${study.title} | MINJI`,
    description: study.summary ?? undefined,
    openGraph: {
      title: study.title,
      description: study.summary ?? undefined,
      images: study.thumbnail_url ? [study.thumbnail_url] : undefined,
    },
  };
}

export default async function StudyDetailPage(
  props: PageProps<"/study/[slug]">,
) {
  const { slug } = await props.params;
  const study = await getStudyBySlug(slug);
  if (!study) notFound();

  const [{ prev, next }, about, allCategories] = await Promise.all([
    getAdjacentStudies(study.slug),
    getAbout(),
    getCategories(),
  ]);

  const period = formatCareerRange(study.start_date, study.end_date);
  const categoryOrder = allCategories.filter((c) => c.scope === "study").map((c) => c.name);
  const galleryUrls = study.gallery_urls ?? [];

  return (
    <>
      <Gnb />
      <main className="flex-1 pt-16 lg:pt-[60px]">
        <ContentProtect className="container-app flex flex-col gap-10 pt-4 pb-10 lg:gap-16 lg:pb-16">
          <div className="flex flex-col gap-10">
            <div className="flex items-center justify-between gap-4">
              <h1
                className="font-[family-name:var(--font-display)] font-extrabold leading-tight tracking-tight text-[var(--color-text)]"
                style={{ fontSize: "var(--fs-display-lg)" }}
              >
                {study.title}
              </h1>
              {study.external_url && (
                <a
                  href={study.external_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="외부 링크로 이동"
                  className="arrow-btn arrow-btn-lg shrink-0 text-[var(--color-text)]"
                >
                  <ExpandCircleRightIcon className="size-full" />
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[360px_1fr] lg:gap-10">
              <dl className="flex flex-col gap-5 lg:border-r lg:border-[var(--color-line)] lg:pr-8">
                {study.org_name && (
                  <div className="flex flex-col gap-1.5">
                    <dt className="text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">소속</dt>
                    <dd className="text-[length:var(--fs-body)]">
                      {study.related_url ? (
                        <a
                          href={study.related_url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="underline underline-offset-2 transition-colors duration-[var(--dur-fast)] hover:text-[var(--color-accent)]"
                        >
                          {study.org_name}
                        </a>
                      ) : (
                        study.org_name
                      )}
                    </dd>
                  </div>
                )}
                {period && (
                  <div className="flex flex-col gap-1.5">
                    <dt className="text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">기간</dt>
                    <dd className="text-[length:var(--fs-body)]">{period}</dd>
                  </div>
                )}
                {study.tags.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <dt className="text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">카테고리</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {sortStudyTagsForDisplay(study.tags, categoryOrder).map((tag) => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>

              <div className="flex flex-col gap-14 lg:gap-16">
                {(study.overview ?? study.summary) && (
                  <p className="whitespace-pre-line text-[length:var(--fs-body)] leading-relaxed text-[var(--color-text-muted)]">
                    {study.overview ?? study.summary}
                  </p>
                )}

                {study.body?.steps && study.body.steps.length > 0 && (
                  <section className="flex flex-col gap-4">
                    <h2 className="text-[length:var(--fs-eyebrow)] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                      Roadmap
                    </h2>
                    <ol className="flex flex-col gap-3">
                      {study.body.steps.map((step) => (
                        <li key={step.label} className="flex flex-wrap items-baseline gap-2">
                          <span className="font-medium">{step.label}</span>
                          <span className="text-[var(--color-text-muted)]">{step.text}</span>
                        </li>
                      ))}
                    </ol>
                  </section>
                )}

                {galleryUrls.length > 0 && (
                  <ProjectGallery urls={galleryUrls} desktopLayout="stack" />
                )}

                {study.body?.blocks && study.body.blocks.length > 0 && (
                  <ContentBlocks blocks={study.body.blocks} />
                )}
              </div>
            </div>
          </div>

          <nav
            aria-label="스터디 이동"
            className="flex items-center justify-between gap-4 border-t border-[var(--color-line)] pt-5"
          >
            {prev ? (
              <Link
                href={`/study/${prev.slug}`}
                className="group flex min-w-0 flex-1 items-center gap-2 text-[length:var(--fs-body)]"
              >
                <ArrowRightIcon className="size-6 shrink-0 rotate-180 transition-transform duration-[var(--dur-fast)] group-hover:-translate-x-1" />
                <span className="min-w-0">
                  <span className="block text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
                    이전 글
                  </span>
                  <span className="block truncate">{prev.title}</span>
                </span>
              </Link>
            ) : (
              <span aria-hidden="true" className="flex-1" />
            )}
            <Link
              href="/study"
              className="inline-flex w-fit shrink-0 items-center rounded-[6px] border border-[var(--color-line)] px-4 py-1 text-[length:var(--fs-body)] transition-colors duration-[var(--dur-fast)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              목록
            </Link>
            {next ? (
              <Link
                href={`/study/${next.slug}`}
                className="group flex min-w-0 flex-1 flex-row-reverse items-center gap-2 text-right text-[length:var(--fs-body)]"
              >
                <ArrowRightIcon className="size-6 shrink-0 transition-transform duration-[var(--dur-fast)] group-hover:translate-x-1" />
                <span className="min-w-0">
                  <span className="block text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
                    다음 글
                  </span>
                  <span className="block truncate">{next.title}</span>
                </span>
              </Link>
            ) : (
              <span aria-hidden="true" className="flex-1" />
            )}
          </nav>
        </ContentProtect>
      </main>
      <Footer email={about?.email ?? null} />
    </>
  );
}
