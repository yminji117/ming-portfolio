import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRightIcon } from "@/components/icons";
import { ContentBlocks } from "@/components/content-blocks";
import { Footer } from "@/components/footer";
import { Gnb } from "@/components/gnb";
import { Tag } from "@/components/tag";
import { getAbout, getAdjacentStudies, getStudyBySlug } from "@/lib/data";

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

  // PRD 6.3 — 외부 링크형 스터디는 상세 페이지를 만들지 않고 원문으로 바로 보낸다.
  if (study.external_url) redirect(study.external_url);

  const [{ prev, next }, about] = await Promise.all([
    getAdjacentStudies(study.slug),
    getAbout(),
  ]);

  const publishedDate = study.published_at.replaceAll("-", ".");

  return (
    <>
      <Gnb />
      <main className="flex-1 pt-16 lg:pt-[60px]">
        <div className="container-app py-10 lg:py-16">
          <h1
            className="font-[family-name:var(--font-display)] font-extrabold leading-none tracking-tight"
            style={{ fontSize: "var(--fs-display-xl)" }}
          >
            {study.title}
          </h1>

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr] lg:gap-16">
            <dl className="flex flex-col gap-5 lg:border-r lg:border-[var(--color-line)] lg:pr-10">
              <div className="flex flex-col gap-1.5">
                <dt className="text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">작성일</dt>
                <dd className="text-[length:var(--fs-body)]">{publishedDate}</dd>
              </div>
              {study.tags.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <dt className="text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">태그</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {study.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </dd>
                </div>
              )}
            </dl>

            <div className="flex flex-col gap-14 lg:gap-16">
              {study.summary && (
                <p className="whitespace-pre-line text-[length:var(--fs-body)] leading-relaxed text-[var(--color-text-muted)]">
                  {study.summary}
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

              {study.body?.blocks && study.body.blocks.length > 0 && (
                <ContentBlocks blocks={study.body.blocks} />
              )}
            </div>
          </div>

          <nav
            aria-label="스터디 이동"
            className="mt-16 flex flex-col gap-6 border-t border-[var(--color-line)] pt-10 lg:mt-20 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:gap-10">
              {prev && (
                <Link
                  href={`/study/${prev.slug}`}
                  className="group flex items-center gap-2 text-[length:var(--fs-body)]"
                >
                  <ArrowRightIcon className="size-6 rotate-180 transition-transform duration-[var(--dur-fast)] group-hover:-translate-x-1" />
                  <span>
                    <span className="block text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
                      이전 글
                    </span>
                    {prev.title}
                  </span>
                </Link>
              )}
              {next && (
                <Link
                  href={`/study/${next.slug}`}
                  className="group flex items-center gap-2 text-right text-[length:var(--fs-body)] lg:flex-row-reverse"
                >
                  <ArrowRightIcon className="size-6 transition-transform duration-[var(--dur-fast)] group-hover:translate-x-1" />
                  <span>
                    <span className="block text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
                      다음 글
                    </span>
                    {next.title}
                  </span>
                </Link>
              )}
            </div>
            <Link
              href="/study"
              className="text-[length:var(--fs-body)] text-[var(--color-text-muted)] underline underline-offset-4 hover:text-[var(--color-accent)]"
            >
              목록으로
            </Link>
          </nav>
        </div>
      </main>
      <Footer email={about?.email ?? null} />
    </>
  );
}
