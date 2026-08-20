"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { formatCareerRange } from "@/lib/format";
import type { Career } from "@/lib/types";

export function CareerTimeline({ careers }: { careers: Career[] }) {
  const listRef = useRef<HTMLOListElement>(null);
  const firstDotRef = useRef<HTMLSpanElement>(null);
  const lastDotRef = useRef<HTMLSpanElement>(null);
  const [line, setLine] = useState<{ top: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const list = listRef.current;
    const first = firstDotRef.current;
    const last = lastDotRef.current;
    if (!list || !first || !last) return;
    const listRect = list.getBoundingClientRect();
    const firstRect = first.getBoundingClientRect();
    const lastRect = last.getBoundingClientRect();
    const firstCenter = firstRect.top - listRect.top + firstRect.height / 2;
    const lastCenter = lastRect.top - listRect.top + lastRect.height / 2;
    setLine({ top: firstCenter, height: lastCenter - firstCenter });
  }, [careers]);

  if (careers.length === 0) return null;

  return (
    <ol ref={listRef} className="relative flex flex-col gap-10 pl-7">
      {line && (
        <div
          aria-hidden="true"
          className="absolute left-2 w-px bg-gradient-to-b from-white to-[#686868]"
          style={{ top: line.top, height: line.height }}
        />
      )}
      {careers.map((career, i) => (
        <li key={career.id} className="relative">
          <span
            ref={i === 0 ? firstDotRef : i === careers.length - 1 ? lastDotRef : undefined}
            className={`absolute -left-[24px] top-1 size-2 rounded-full ${
              i === 0 ? "bg-white" : "bg-[#686868]"
            }`}
          />
          <p className="text-xs text-white">
            {formatCareerRange(career.start_date, career.end_date)}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-sm text-[#c9c9c9]">{career.org_name}</p>
            {career.industry && (
              <p className="text-[10px] text-[#c9c9c9]">{career.industry}</p>
            )}
          </div>
          {career.title && (
            <div className="mt-1 flex items-center gap-1">
              <p className="text-[length:var(--fs-body)] font-medium text-white">
                {career.title}
              </p>
              {career.description && (
                <>
                  <span className="text-xs text-[#9d9d9d]">|</span>
                  <p className="text-[length:var(--fs-body)] font-medium text-white">
                    {career.description}
                  </p>
                </>
              )}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}
