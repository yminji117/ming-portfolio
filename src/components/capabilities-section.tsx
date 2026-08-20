import Image from "next/image";

type Capability = {
  icon: string;
  label: string;
};

const ROW_1: Capability[] = [
  { icon: "/capabilities/growth-plan.png", label: "비지니스 성장을 위한 기획" },
  { icon: "/capabilities/validate.png", label: "기획부터 검증까지" },
  { icon: "/capabilities/multi-platform.png", label: "멀티 플랫폼 통합 설계" },
  { icon: "/capabilities/edge-case-docs.png", label: "예외 케이스 중심의 정책 문서화" },
  { icon: "/capabilities/communication.png", label: "클라이언트/관련 부서 커뮤니케이션" },
];

const ROW_2: Capability[] = [
  { icon: "/capabilities/requirements.png", label: "명확한 요구사항 분석" },
  { icon: "/capabilities/business-logic.png", label: "복잡한 비지니스 로직 설계" },
  { icon: "/capabilities/ia-redesign.png", label: "IA 재설계를 통한 사용자 행동 전환" },
  { icon: "/capabilities/structure-idea.png", label: "아이디어를 구조화 설계" },
  { icon: "/capabilities/scope-priority.png", label: "구현 범위 및 우선순위 조율" },
];

export function CapabilitiesSection() {
  return (
    <section className="bg-[#090909] pb-10 pt-20 lg:pb-20 lg:pt-40">
      <div className="container-app flex flex-col items-center text-center">
        <h2
          className="font-[family-name:var(--font-display)] font-extrabold leading-none tracking-tight text-white"
          style={{ fontSize: "var(--fs-display-xl)" }}
        >
          Capabilities
        </h2>
        <p
          className="mt-5 font-[family-name:var(--font-display)] font-bold leading-tight text-white"
          style={{ fontSize: "var(--fs-display-md)" }}
        >
          흩어진 요구사항에서,<br className="lg:hidden" /> 서비스 출시까지 책임감 있게
        </p>
      </div>

      <div className="mt-16 flex flex-col gap-5 lg:mt-20">
        <MarqueeRow items={ROW_1} />
        <MarqueeRow items={ROW_2} reverse />
      </div>
    </section>
  );
}

function MarqueeRow({ items, reverse = false }: { items: Capability[]; reverse?: boolean }) {
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden" aria-hidden="true">
      <div className={`marquee-track gap-5 ${reverse ? "marquee-track-reverse" : ""}`}>
        {doubled.map((item, i) => (
          <div
            key={i}
            className="flex shrink-0 items-center gap-2 rounded-full bg-white/10 px-6 py-3 lg:gap-3 lg:px-[80px] lg:py-5"
          >
            <Image
              src={item.icon}
              alt=""
              width={40}
              height={40}
              className="size-7 shrink-0 object-contain lg:size-10"
            />
            <span
              className="whitespace-nowrap font-[family-name:var(--font-body)] font-medium text-white"
              style={{ fontSize: "var(--fs-pill)" }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
