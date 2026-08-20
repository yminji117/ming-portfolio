import { CopyEmailButton } from "@/components/copy-email-button";
import { TopButton } from "@/components/top-button";

export function Footer({ email }: { email: string | null }) {
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
          © 2026 MINJI. All rights reserved.
        </p>
      </div>
      <TopButton />
    </footer>
  );
}
