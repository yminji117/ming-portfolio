"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GuestbookForm } from "@/components/guestbook-form";
import { GuestbookList } from "@/components/guestbook-list";
import type { GuestbookEntry } from "@/lib/types";

export function GuestbookBoard({
  initialItems,
  initialTotal,
}: {
  initialItems: GuestbookEntry[];
  initialTotal: number;
}) {
  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <div className="flex flex-col gap-14 lg:gap-16">
      <GuestbookForm
        onCreated={(entry) => {
          setItems((prev) => [entry, ...prev]);
          setTotal((prev) => prev + 1);
          setToast("등록 완료되었어요! 정말 감사합니다 :)💙");
        }}
      />

      <GuestbookList
        items={items}
        total={total}
        onItemsChange={setItems}
        onEntryUpdated={(id, updatedAt, content) => {
          setItems((prev) =>
            prev.map((item) =>
              item.id === id
                ? { ...item, updated_at: updatedAt, content: item.is_private ? null : content }
                : item,
            ),
          );
          setToast("수정 되었어요!");
        }}
        onEntryDeleted={(id) => {
          setItems((prev) => prev.filter((item) => item.id !== id));
          setTotal((prev) => Math.max(0, prev - 1));
          setToast("삭제 완료 되었어요..😭");
        }}
      />

      {toast &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed bottom-10 left-1/2 z-[100] -translate-x-1/2 whitespace-nowrap rounded-full bg-[rgba(4,4,4,0.7)] px-12 py-3 text-[16px] text-white"
            >
              {toast}
            </motion.div>
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
