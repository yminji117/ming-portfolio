import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { getSiteSettings } from "@/lib/data";

export default async function AdminSiteSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-bold text-[var(--color-text)]">Site Settings</h1>
        <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">
          히어로 미디어, 푸터, SEO 대표 이미지, 점검모드를 관리해요.
        </p>
      </div>

      <SiteSettingsForm settings={settings} />
    </div>
  );
}
