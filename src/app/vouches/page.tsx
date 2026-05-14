import type { Metadata } from "next";
import { PageHeading } from "~/components/page-heading";
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
      <div className="flex min-h-screen flex-col items-center px-4 sm:px-8">
        <div className="tw-content my-auto w-full max-w-2xl lowercase pb-navbar pt-admin-navbar">
          <PageHeading text="Vouches" inline />
          <VouchesGrid />
        </div>
      </div>
    </main>
  );
}
