import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Gnb } from "@/components/gnb";
import { GuestbookBoard } from "@/components/guestbook-board";
import { getAbout, getGuestbookPage } from "@/lib/data";
import { LIST_PAGE_SIZE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "here → | MINJI",
  description: "하고 싶은 말을 남겨주세요. 저만 볼게요.",
  robots: { index: false, follow: false },
};

export default async function HerePage() {
  const [{ items, total }, about] = await Promise.all([
    getGuestbookPage(0, LIST_PAGE_SIZE),
    getAbout(),
  ]);

  return (
    <>
      <Gnb />
      <main className="flex-1 pt-16 lg:pt-[60px]">
        <div className="container-app max-w-[720px] py-10 lg:py-16">
          <h1
            className="font-[family-name:var(--font-display)] font-extrabold leading-none tracking-tight"
            style={{ fontSize: "var(--fs-display-xl)" }}
          >
            here →
          </h1>
          <p className="mt-3 text-[length:var(--fs-body)] text-[var(--color-text-muted)]">
            하고 싶은 말을 남겨주세요. 저만 볼게요.
          </p>

          <div className="mt-10 lg:mt-14">
            <GuestbookBoard initialItems={items} initialTotal={total} />
          </div>
        </div>
      </main>
      <Footer email={about?.email ?? null} />
    </>
  );
}
