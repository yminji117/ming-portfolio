import { CopyEmailButton } from "@/components/copy-email-button";
import { TopButton } from "@/components/top-button";

export function Footer({
  email,
  instagramUrl,
}: {
  email: string | null;
  instagramUrl: string | null;
}) {
  return (
    <footer className="section border-t border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="container-app">
        {email ? (
          <CopyEmailButton
            email={email}
            className="text-left text-[length:var(--fs-body)] transition-colors duration-[var(--dur-fast)] hover:text-[var(--color-accent)]"
          />
        ) : (
          <p className="text-[length:var(--fs-body)]">hello@example.com</p>
        )}

        <div className="mt-6 flex flex-col gap-4 text-[length:var(--fs-body)] text-[var(--color-text)] sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 MINJI. All rights reserved.</span>
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-[var(--dur-fast)] hover:text-[var(--color-accent)]"
            >
              Instagram
            </a>
          )}
        </div>
      </div>
      <TopButton />
    </footer>
  );
}
