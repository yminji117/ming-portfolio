import { CopyEmailButton } from "@/components/copy-email-button";
import { TopButton } from "@/components/top-button";
import { getSiteSettings } from "@/lib/data";

// footer_text는 페이지마다 email과 함께 새로 fetch하지 않도록 Footer 내부에서 직접
// 조회한다(호출부 10곳을 전부 고치는 대신 이 컴포넌트만 async로 바꾸면 됨).
export async function Footer({ email }: { email: string | null }) {
  const settings = await getSiteSettings();

  return (
    <footer className="bg-[#FAFBFD] py-10">
      <div className="container-app pl-[64px] md:pl-[80px]">
        {email ? (
          <CopyEmailButton
            email={email}
            className="text-left text-[length:var(--fs-body)] text-[#0A0A0A] transition-colors duration-[var(--dur-fast)] hover:text-[var(--color-accent)]"
          />
        ) : (
          <p className="text-[length:var(--fs-body)] text-[#0A0A0A]">hello@example.com</p>
        )}

        <p className="mt-1.5 text-[length:var(--fs-body)] text-[#0A0A0A]">
          {settings?.footer_text || "© 2026 MINJI. All rights reserved."}
        </p>
      </div>
      <TopButton />
    </footer>
  );
}
