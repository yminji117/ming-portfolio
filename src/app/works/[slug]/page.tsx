import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon, ExpandCircleRightIcon } from "@/components/icons";
import { ContentBlocks } from "@/components/content-blocks";
import { ContentProtect } from "@/components/content-protect";
import { Footer } from "@/components/footer";
import { Gnb } from "@/components/gnb";
import { ProjectGallery } from "@/components/project-gallery";
import { Tag } from "@/components/tag";
import { getAbout, getAdjacentProjects, getProjectBySlug } from "@/lib/data";
import { formatCareerRange } from "@/lib/format";

export async function generateMetadata(
  props: PageProps<"/works/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Work | MINJI" };

  const image = project.cover_url ?? project.thumbnail_url ?? undefined;
  return {
    title: `${project.title} | MINJI`,
    description: project.summary,
    openGraph: {
      title: project.title,
      description: project.summary,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProjectDetailPage(
  props: PageProps<"/works/[slug]">,
) {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const [{ prev, next }, about] = await Promise.all([
    getAdjacentProjects(project.category, project.slug),
    getAbout(),
  ]);

  const period = formatCareerRange(project.start_date, project.end_date);

  return (
    <>
      <Gnb />
      {/* Study 상세 페이지와 동일하게 고정 GNB만큼 클리어한다(모바일 h-16 / 데스크톱 60px). */}
      <main className="flex-1 pt-16 lg:pt-[60px]">
        {/* Figma '최종' node 229:142(desktop)/246:162(mobile) — 목록 버튼은 GNB 바로 아래
            16px만 띄우고 붙는다(모바일/데스크톱 동일), 하단은 기존 유지. */}
        <ContentProtect className="container-app flex flex-col gap-10 pt-4 pb-10 lg:gap-16 lg:pb-16">
          <div className="flex flex-col gap-4">
            <Link
              href={`/works?tab=${project.category}`}
              className="inline-flex w-fit items-center rounded-[6px] border border-[var(--color-line)] px-4 py-1 text-[length:var(--fs-body)] transition-colors duration-[var(--dur-fast)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              목록
            </Link>

            <div className="flex flex-col gap-10">
            <div className="relative h-[140px] w-full overflow-hidden rounded-[var(--radius)] border border-solid border-[var(--color-line)] bg-[var(--color-ink)] sm:h-[180px] lg:h-[200px]">
              {project.cover_url && (
                <Image
                  src={project.cover_url}
                  alt=""
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <h1
                className="font-[family-name:var(--font-display)] font-extrabold leading-tight tracking-tight text-[var(--color-text)]"
                style={{ fontSize: "var(--fs-display-lg)" }}
              >
                {project.title}
              </h1>
              {project.external_url && (
                <a
                  href={project.external_url}
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
                {project.company && (
                  <MetaRow label="소속">
                    <span>{project.company}</span>
                  </MetaRow>
                )}
                {period && (
                  <MetaRow label="기간">
                    <span>{period}</span>
                  </MetaRow>
                )}
                {project.role_note && (
                  <MetaRow label="역할">
                    <p className="whitespace-pre-line leading-relaxed">{project.role_note}</p>
                  </MetaRow>
                )}
                {project.contribution_percent != null && (
                  <MetaRow label={`기여도 (${project.contribution_percent}%)`}>
                    <div className="h-1 w-full max-w-[240px] rounded-full bg-[var(--color-line)]">
                      <div
                        className="h-1 rounded-full bg-[var(--color-accent)]"
                        style={{ width: `${project.contribution_percent}%` }}
                      />
                    </div>
                  </MetaRow>
                )}
                {project.team && (
                  <MetaRow label="팀 구성">
                    <span>{project.team}</span>
                  </MetaRow>
                )}
                {project.tools.length > 0 && (
                  <MetaRow label="TOOL">
                    <div className="flex flex-wrap gap-1.5">
                      {project.tools.map((tool) => (
                        <Tag key={tool}>{tool}</Tag>
                      ))}
                    </div>
                  </MetaRow>
                )}
              </dl>

              <div className="flex flex-col gap-14 lg:gap-16">
                {project.overview && (
                  <DetailSection heading="Overview">
                    <p className="whitespace-pre-line text-[length:var(--fs-body)] leading-relaxed">
                      {project.overview}
                    </p>
                  </DetailSection>
                )}

                {project.main_tasks && project.main_tasks.length > 0 && (
                  <DetailSection heading="주요 업무">
                    <ul className="flex list-disc flex-col gap-1 pl-6 text-[length:var(--fs-body)] leading-relaxed">
                      {project.main_tasks.map((task, i) => (
                        <li key={i}>{task}</li>
                      ))}
                    </ul>
                  </DetailSection>
                )}

                {project.body && project.body.length > 0 && (
                  <ContentBlocks blocks={project.body} />
                )}

                {project.result && (
                  <DetailSection heading="성과 및 결과">
                    <ul className="flex list-disc flex-col gap-1 pl-6 text-[length:var(--fs-body)] leading-relaxed">
                      {project.result
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean)
                        .map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                    </ul>
                  </DetailSection>
                )}

                {project.retrospective && (
                  <DetailSection heading="회고">
                    <p className="whitespace-pre-line text-[length:var(--fs-body)] leading-relaxed">
                      {project.retrospective}
                    </p>
                  </DetailSection>
                )}

                {project.gallery_urls && project.gallery_urls.length > 0 && (
                  <ProjectGallery urls={project.gallery_urls} desktopLayout="stack-collapsible" />
                )}
              </div>
            </div>
            </div>
          </div>

          <nav
            aria-label="프로젝트 이동"
            className="flex items-center justify-between gap-4 border-t border-[var(--color-line)] pt-5"
          >
            {prev ? (
              <Link
                href={`/works/${prev.slug}`}
                className="group flex min-w-0 flex-1 items-center gap-2 text-[length:var(--fs-body)]"
              >
                <ArrowRightIcon className="size-6 shrink-0 rotate-180 transition-transform duration-[var(--dur-fast)] group-hover:-translate-x-1" />
                <span className="min-w-0">
                  <span className="block text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
                    이전 프로젝트
                  </span>
                  <span className="block truncate">{prev.title}</span>
                </span>
              </Link>
            ) : (
              <span aria-hidden="true" className="flex-1" />
            )}
            {next ? (
              <Link
                href={`/works/${next.slug}`}
                className="group flex min-w-0 flex-1 flex-row-reverse items-center gap-2 text-right text-[length:var(--fs-body)]"
              >
                <ArrowRightIcon className="size-6 shrink-0 transition-transform duration-[var(--dur-fast)] group-hover:translate-x-1" />
                <span className="min-w-0">
                  <span className="block text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
                    다음 프로젝트
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

function DetailSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[length:var(--fs-eyebrow)] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
        {heading}
      </h2>
      {children}
    </section>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">{label}</dt>
      <dd className="text-[length:var(--fs-body)]">{children}</dd>
    </div>
  );
}
