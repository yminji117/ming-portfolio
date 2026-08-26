import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "점검 중 | MINJI",
  robots: { index: false, follow: false },
};

// site_settings.is_maintenance가 켜져 있을 때 proxy가 /admin 외 모든 경로를
// 이 페이지로 rewrite한다 — URL은 그대로 유지된 채 이 화면만 보인다.
export default function MaintenancePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[var(--color-bg)] px-6 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-[28px] font-extrabold text-[var(--color-text)]">
        점검 중입니다
      </h1>
      <p className="text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
        더 나은 모습으로 곧 돌아올게요. 잠시 후 다시 방문해 주세요.
      </p>
    </main>
  );
}
