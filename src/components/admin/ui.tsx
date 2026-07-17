import { ChevronDown } from "lucide-react";
import { cn } from "~/lib/util";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" tabIndex={-1}>
      <div className="mx-auto w-full max-w-3xl px-5 pt-28 pb-40 sm:px-8">
        {children}
      </div>
    </main>
  );
}

export function AdminPageHeader({
  eyebrow,
  title,
  meta,
  children,
}: {
  eyebrow: string;
  title: string;
  meta?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b hairline pb-6">
      <div className="min-w-0">
        <p className="label">
          <span className="label-index">{"// "}</span>
          {eyebrow}
        </p>
        <h1 className="mt-3 truncate font-sans text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
          {title}
        </h1>
        {meta && (
          <p className="mt-2 font-mono text-xs text-muted-foreground">{meta}</p>
        )}
      </div>
      {children && (
        <div className="flex shrink-0 items-center gap-2 pb-1">{children}</div>
      )}
    </div>
  );
}

export function AdminSection({
  index,
  title,
  actions,
  children,
  className,
}: {
  index?: string;
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mt-12", className)}>
      <div className="flex items-baseline gap-4">
        {index && (
          <span className="font-mono text-xs text-accent">{index}</span>
        )}
        <h2 className="font-sans text-base font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        <span className="h-px flex-1 bg-border" aria-hidden="true" />
        {actions}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function Pill({
  tone = "muted",
  children,
}: {
  tone?: "accent" | "muted" | "live";
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.625rem] tracking-wider lowercase",
        tone === "live" && "border-accent/40 text-accent",
        tone === "accent" && "border-accent/40 text-accent",
        tone === "muted" && "border-border text-muted-foreground",
      )}
    >
      {tone === "live" && (
        <span className="inline-block size-1 animate-pulse rounded-full bg-accent" />
      )}
      {children}
    </span>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="border border-dashed hairline px-6 py-14 text-center font-mono text-xs text-muted-foreground lowercase">
      {children}
    </p>
  );
}

export function FieldLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "mb-2 block font-mono text-[0.6875rem] tracking-[0.15em] text-muted-foreground uppercase",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function SaveBar({
  children,
  visible,
}: {
  children: React.ReactNode;
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <div className="sticky bottom-6 z-20 mt-12 flex justify-end">
      <div className="flex items-center gap-3 rounded-full border hairline bg-background/80 py-2 pr-2 pl-5 backdrop-blur-md">
        <span className="font-mono text-[0.625rem] tracking-[0.2em] text-accent uppercase select-none">
          unsaved
        </span>
        {children}
      </div>
    </div>
  );
}

export function AdminSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className={cn("relative", className)}>
      <select
        {...props}
        className="w-full appearance-none rounded-md border hairline bg-transparent px-3 py-2.5 font-sans text-sm text-foreground transition-colors focus:border-accent/50 focus:outline-none"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}
