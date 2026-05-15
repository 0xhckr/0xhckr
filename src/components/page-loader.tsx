"use client";

import { useQuery } from "convex/react";
import { useEffect, useRef } from "react";
import { api } from "../../convex/_generated/api";

export const PageLoader = ({ children }: { children: React.ReactNode }) => {
  const resume = useQuery(api.resumes.getFrontFacing);
  const vouches = useQuery(api.vouches.list);
  const fired = useRef(false);

  useEffect(() => {
    if (resume !== undefined && vouches !== undefined && !fired.current) {
      fired.current = true;
      window.dispatchEvent(new CustomEvent("page-ready"));
    }
  }, [resume, vouches]);

  return <>{children}</>;
};
