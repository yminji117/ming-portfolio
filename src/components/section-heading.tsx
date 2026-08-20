import { MoreLink } from "@/components/more-link";
import { Reveal } from "@/components/reveal";

export function SectionHeading({
  eyebrow,
  title,
  moreHref,
  theme = "light",
}: {
  eyebrow?: string;
  title: string;
  moreHref: string;
  theme?: "dark" | "light";
}) {
  return (
    <div className="flex flex-col">
      <Reveal>
        <div className="flex items-center justify-between gap-6 pb-3 lg:pb-5">
          <span
            className="font-[family-name:var(--font-display)] font-extrabold leading-none tracking-tight"
            style={{ fontSize: "var(--fs-display-xl)" }}
          >
            {eyebrow ?? title}
          </span>
          <MoreLink
            href={moreHref}
            variant="icon"
            className={theme === "dark" ? "text-white" : undefined}
          />
        </div>
      </Reveal>
      {eyebrow && (
        <span
          className="font-[family-name:var(--font-display)] font-bold leading-none tracking-tight"
          style={{ fontSize: "var(--fs-display-lg)" }}
        >
          {title}
        </span>
      )}
    </div>
  );
}
