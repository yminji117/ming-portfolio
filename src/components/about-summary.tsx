import Image from "next/image";
import { CopyEmailButton } from "@/components/copy-email-button";
import { MoreLink } from "@/components/more-link";
import { Reveal } from "@/components/reveal";
import { formatCareerRange } from "@/lib/format";
import type { About, Career } from "@/lib/types";

export function AboutSummary({
  about,
  careers,
}: {
  about: About | null;
  careers: Career[];
}) {
  if (!about) return null;

  const name = about.name_ko || about.name_en || "MINJI";
  const summary =
    about.cover_letter_summary || about.cover_letter?.slice(0, 200) || "";

  return (
    <section className="section-block bg-[var(--color-about-bg)] text-white">
      <div className="container-app">
        <Reveal>
          <div className="flex items-start justify-between gap-6">
            <div>
              <span className="eyebrow text-white/70">The Person</span>
              <h2
                className="mt-4 font-[family-name:var(--font-display)] font-black tracking-tight text-[var(--color-about-ink)]"
                style={{ fontSize: "var(--fs-section)" }}
              >
                About me
              </h2>
            </div>
            <MoreLink href="/about" variant="icon" className="text-white" />
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal index={1}>
            <div className="w-full max-w-sm overflow-hidden rounded-[var(--radius)] border border-white/20">
              <div className="relative aspect-[4/5] w-full bg-white/10">
                {about.photo_url ? (
                  <Image
                    src={about.photo_url}
                    alt={name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div
                    className="flex h-full w-full items-center justify-center font-[family-name:var(--font-display)] font-black text-white/40"
                    style={{ fontSize: "var(--fs-hero)" }}
                  >
                    MJ
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal index={2}>
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight">
                {name}
              </h3>
              {about.tagline && (
                <p className="mt-2 text-white/70">{about.tagline}</p>
              )}

              {careers.length > 0 && (
                <ul className="mt-6 space-y-2 text-[length:var(--fs-body)]">
                  {careers.map((career) => (
                    <li
                      key={career.id}
                      className="flex flex-wrap gap-x-4 text-white/70"
                    >
                      <span>
                        {formatCareerRange(career.start_date, career.end_date)}
                      </span>
                      <span className="font-semibold text-white">{career.org_name}</span>
                      {career.title && <span>{career.title}</span>}
                    </li>
                  ))}
                </ul>
              )}

              {summary && <p className="mt-6 text-[length:var(--fs-body)] text-white/90">{summary}</p>}

              <div className="mt-8 flex flex-wrap items-center gap-6">
                {about.email && (
                  <CopyEmailButton
                    email={about.email}
                    className="text-[length:var(--fs-body)] underline decoration-[var(--color-about-ink)] underline-offset-4 transition-colors duration-[var(--dur-fast)] hover:text-[var(--color-about-ink)]"
                  />
                )}
                {about.instagram_url && (
                  <a
                    href={about.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[length:var(--fs-body)] underline decoration-[var(--color-about-ink)] underline-offset-4 transition-colors duration-[var(--dur-fast)] hover:text-[var(--color-about-ink)]"
                  >
                    Instagram
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
