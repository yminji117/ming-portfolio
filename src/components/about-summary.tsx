import Image from "next/image";
import { CopyEmailButton } from "@/components/copy-email-button";
import { MoreLink } from "@/components/more-link";
import { Reveal } from "@/components/reveal";
import { formatCareerRange, getInstagramHandle } from "@/lib/format";
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
  const quote = about.cover_letter_summary || about.tagline;

  return (
    <section className="section-block bg-[var(--color-ink)] text-white">
      <div className="container-app">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-10">
          {quote && (
            <Reveal className="lg:flex-1">
              <p
                className="font-[family-name:var(--font-body)] font-bold leading-tight text-white"
                style={{ fontSize: "var(--fs-display-lg)" }}
              >
                {quote}
              </p>
            </Reveal>
          )}

          <div className="flex flex-col gap-10 lg:flex-row lg:gap-10">
            <Reveal index={1} className="lg:w-[374px] lg:shrink-0">
              <div className="aspect-[374/464] w-full overflow-hidden rounded-[var(--radius)] bg-white/10">
                {about.photo_url ? (
                  <Image
                    src={about.photo_url}
                    alt={name}
                    width={374}
                    height={464}
                    className="h-full w-full object-cover"
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
            </Reveal>

            <Reveal index={2} className="flex flex-col gap-10 lg:w-[229px] lg:shrink-0 lg:justify-between">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-6">
                  <h3 className="font-[family-name:var(--font-display)] text-[32px] font-bold tracking-tight">
                    {name}
                  </h3>
                  <MoreLink href="/about" variant="icon" className="text-white" />
                </div>
                {about.tagline && (
                  <p className="text-xl font-bold text-white">{about.tagline}</p>
                )}
              </div>

              {careers.length > 0 && (
                <ol className="relative flex flex-col gap-10 border-l border-white/25 pl-7">
                  {careers.map((career, i) => (
                    <li key={career.id} className="relative">
                      <span
                        className={`absolute -left-[33px] top-1 size-5 rounded-full border ${
                          i === 0 ? "border-white/50 bg-white/30" : "border-white/20 bg-white/10"
                        }`}
                      />
                      <p className="text-xs text-white">
                        {formatCareerRange(career.start_date, career.end_date)}
                      </p>
                      <p className="mt-2 text-[length:var(--fs-body)] text-[#c7c7c7]">
                        {career.org_name}
                      </p>
                      {career.title && (
                        <p className="mt-1 text-[length:var(--fs-body)] font-medium text-white">
                          {career.title}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              )}

              {(about.email || about.instagram_url) && (
                <div className="chip w-full border border-[rgba(255,255,255,0.3)]">
                  {about.email && (
                    <div className="flex w-full items-center justify-between gap-2">
                      <CopyEmailButton
                        email={about.email}
                        className="text-left text-[length:var(--fs-body)] text-white transition-colors duration-[var(--dur-fast)] hover:text-[var(--color-accent)]"
                      />
                      <span aria-hidden="true" className="text-[20px] font-extralight text-white">
                        →
                      </span>
                    </div>
                  )}
                  {about.instagram_url && (
                    <a
                      href={about.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-between gap-2 text-[length:var(--fs-body)] text-white transition-colors duration-[var(--dur-fast)] hover:text-[var(--color-accent)]"
                    >
                      {getInstagramHandle(about.instagram_url)}
                      <span aria-hidden="true" className="text-[20px] font-extralight">→</span>
                    </a>
                  )}
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
