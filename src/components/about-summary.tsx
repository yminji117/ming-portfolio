import Image from "next/image";
import { CareerTimeline } from "@/components/career-timeline";
import { CopyEmailButton } from "@/components/copy-email-button";
import { MoreLink } from "@/components/more-link";
import { Reveal } from "@/components/reveal";
import { TrackedExternalLink } from "@/components/tracked-external-link";
import { getInstagramHandle } from "@/lib/format";
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

  const contactChip = (about.email || about.instagram_url) && (
    <div className="chip w-full border border-[rgba(255,255,255,0.3)]">
      {about.email && (
        <div className="group flex w-full items-center justify-between gap-2">
          <CopyEmailButton
            email={about.email}
            className="text-left text-[length:var(--fs-body)] text-white transition-colors duration-[var(--dur-fast)] group-hover:text-[var(--color-accent)]"
          />
          <span
            aria-hidden="true"
            className="text-[20px] font-extralight text-white transition-colors duration-[var(--dur-fast)] group-hover:text-[var(--color-accent)]"
          >
            →
          </span>
        </div>
      )}
      {about.instagram_url && (
        <TrackedExternalLink
          href={about.instagram_url}
          eventName="instagram_click"
          className="flex w-full items-center justify-between gap-2 text-[length:var(--fs-body)] text-white transition-colors duration-[var(--dur-fast)] hover:text-[var(--color-accent)]"
        >
          {getInstagramHandle(about.instagram_url)}
          <span aria-hidden="true" className="text-[20px] font-extralight">→</span>
        </TrackedExternalLink>
      )}
    </div>
  );

  return (
    <section className="bg-[var(--color-ink)] py-20 text-white lg:py-[140px]">
      <div className="container-app">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-10">
          {quote && (
            <Reveal className="lg:flex-1">
              <p className="font-[family-name:var(--font-body)] font-bold text-[32px] leading-[50px] text-white lg:text-[40px] lg:leading-tight">
                {quote}
              </p>
            </Reveal>
          )}

          {/* Mobile (<lg): photo sits beside name/tagline/timeline, contact chip below — per updated Figma mobile spec */}
          <div className="flex flex-col gap-8 lg:hidden">
            <div className="flex items-start gap-5">
              <Reveal index={1} className="h-[132px] w-[106px] shrink-0">
                <div className="h-full w-full overflow-hidden rounded-[var(--radius)] bg-white/10">
                  {about.photo_url ? (
                    <Image
                      src={about.photo_url}
                      alt={name}
                      width={106}
                      height={132}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-[family-name:var(--font-display)] text-2xl font-black text-white/40">
                      MJ
                    </div>
                  )}
                </div>
              </Reveal>

              <Reveal index={2} className="flex min-w-0 flex-1 flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-[family-name:var(--font-display)] text-2xl font-extrabold leading-[32px] tracking-[-0.8px]">
                      {name}
                    </h3>
                    <MoreLink href="/about" variant="icon" className="text-white" />
                  </div>
                  {about.tagline && (
                    <p className="text-xl font-medium leading-[20px] text-white">{about.tagline}</p>
                  )}
                </div>

                <CareerTimeline careers={careers} />
              </Reveal>
            </div>

            {contactChip && (
              <Reveal index={3} className="w-full max-w-[327px]">
                {contactChip}
              </Reveal>
            )}
          </div>

          {/* Desktop (lg+): photo column beside a full sidebar column — unchanged */}
          <div className="hidden lg:flex lg:flex-row lg:gap-10">
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

            <Reveal index={2} className="flex flex-col gap-10 lg:w-[229px] lg:shrink-0 lg:gap-[71px]">
              <div className="flex flex-col gap-2 lg:gap-1">
                <div className="flex items-center justify-between gap-6">
                  <h3 className="font-[family-name:var(--font-display)] text-[32px] font-extrabold leading-none tracking-tight">
                    {name}
                  </h3>
                  <MoreLink href="/about" variant="icon" className="text-white" />
                </div>
                {about.tagline && (
                  <p className="text-xl font-bold leading-none text-white">{about.tagline}</p>
                )}
              </div>

              <CareerTimeline careers={careers} />

              {contactChip}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
