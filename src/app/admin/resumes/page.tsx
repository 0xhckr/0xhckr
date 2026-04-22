import type { Metadata } from "next";

export default function AdminResumesPage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="tw-content flex min-h-screen flex-col items-center px-4 pt-admin-navbar py-16 sm:px-8">
        <h1 className="mb-8 text-2xl font-semibold tracking-tight lowercase">
          Manage Resumes
        </h1>
        <p className="text-muted-foreground lowercase">
          Resume management coming soon.
        </p>
      </div>
    </main>
  );
}
