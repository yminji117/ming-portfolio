import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRightIcon } from "@/components/icons";
import { ContentBlocks } from "@/components/content-blocks";
import { Footer } from "@/components/footer";
import { Gnb } from "@/components/gnb";
import { Tag } from "@/components/tag";
import { getAbout, getAdjacentProjects, getProjectBySlug } from "@/lib/data";
import { formatCareerRange } from "@/lib/format";

export async function generateMetadata(
  props: PageProps<"/works/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Works | MINJI" };

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
      <main className="flex-1">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--color-ink)] lg:aspect-[21/9]">
          {project.cover_url && (
            <Image
              src={project.cover_url}
              alt={project.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 flex items-end bg-black/20">
            <div className="container-app pb-8 lg:pb-12">
              <h1
                className="font-[family-name:var(--font-display)] font-extrabold leading-none tracking-tight text-white"
                style={{ fontSize: "var(--fs-display-xl)" }}
              >
                {project.title}
              </h1>
            </div>
          </div>
        </div>

        <div className="container-app py-10 lg:py-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[280px_1fr] lg:gap-16">
            <dl className="flex flex-col gap-5 lg:border-r lg:border-[var(--color-line)] lg:pr-10">
              {period && (
                <MetaRow label="기간">
                  <span>{period}</span>
                </MetaRow>
              )}
              {project.company && (
                <MetaRow label="소속">
                  <span>{project.company}</span>
                </MetaRow>
              )}
              {project.role.length > 0 && (
                <MetaRow label="역할">
                  <div className="flex flex-wrap gap-1.5">
                    {project.role.map((role) => (
                      <Tag key={role}>{role}</Tag>
                    ))}
                  </div>
                </MetaRow>
              )}
              {project.tools.length > 0 && (
                <MetaRow label="사용 툴">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tools.map((tool) => (
                      <Tag key={tool}>{tool}</Tag>
                    ))}
                  </div>
                </MetaRow>
              )}
              {project.team && (
                <MetaRow label="팀 구성">
                  <span>{project.team}</span>
                </MetaRow>
              )}
              {project.external_url && (
                <MetaRow label="링크">
                  <a
                    href={project.external_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline decoration-[var(--color-accent)] underline-offset-4 hover:text-[var(--color-accent)]"
                  >
                    바로가기 →
                  </a>
                </MetaRow>
              )}
            </dl>

            <div className="flex flex-col gap-14 lg:gap-16">
              {project.overview && (
                <section className="flex flex-col gap-3">
                  <h2 className="text-[length:var(--fs-eyebrow)] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                    Overview
                  </h2>
                  <p className="whitespace-pre-line text-[length:var(--fs-body)] leading-relaxed">
                    {project.overview}
                  </p>
                </section>
              )}

              {project.body && project.body.length > 0 && (
                <section className="flex flex-col gap-3">
                  <ContentBlocks blocks={project.body} />
                </section>
              )}

              {project.result && (
                <section className="flex flex-col gap-3">
                  <h2 className="text-[length:var(--fs-eyebrow)] font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                    Result
                  </h2>
                  <p className="whitespace-pre-line text-[length:var(--fs-body)] leading-relaxed">
                    {project.result}
                  </p>
                </section>
              )}
            </div>
          </div>

          <nav
            aria-label="프로젝트 이동"
            className="mt-16 flex flex-col gap-6 border-t border-[var(--color-line)] pt-10 lg:mt-20 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:gap-10">
              {prev && (
                <Link
                  href={`/works/${prev.slug}`}
                  className="group flex items-center gap-2 text-[length:var(--fs-body)]"
                >
                  <ArrowRightIcon className="size-6 rotate-180 transition-transform duration-[var(--dur-fast)] group-hover:-translate-x-1" />
                  <span>
                    <span className="block text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
                      이전 프로젝트
                    </span>
                    {prev.title}
                  </span>
                </Link>
              )}
              {next && (
                <Link
                  href={`/works/${next.slug}`}
                  className="group flex items-center gap-2 text-right text-[length:var(--fs-body)] lg:flex-row-reverse"
                >
                  <ArrowRightIcon className="size-6 transition-transform duration-[var(--dur-fast)] group-hover:translate-x-1" />
                  <span>
                    <span className="block text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">
                      다음 프로젝트
                    </span>
                    {next.title}
                  </span>
                </Link>
              )}
            </div>
            <Link
              href={`/works?tab=${project.category}`}
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

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <dt className="text-[length:var(--fs-caption)] text-[var(--color-text-muted)]">{label}</dt>
      <dd className="text-[length:var(--fs-body)]">{children}</dd>
    </div>
  );
}
