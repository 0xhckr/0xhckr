import type { Metadata } from "next";
import { PageHeader } from "~/components/page-header";
import { generatePageMetadata } from "~/lib/metadata";
import { VouchesGrid } from "./vouches-grid";

export const metadata: Metadata = generatePageMetadata({
  title: "Vouches",
  description: "People I've vouched for.",
  path: "/vouches",
});

export default function VouchesPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="mx-auto max-w-5xl px-5 pt-36 pb-24 sm:px-8 sm:pt-44">
        <PageHeader
          eyebrow="vouches"
          title="Vouches"
          description="People I've vouched for."
        />
        <VouchesGrid />
      </div>
    </main>
  );
}
