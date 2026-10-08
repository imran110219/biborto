"use client";

import { createContext, useContext } from "react";
import type { Brand } from "@/lib/settings";

// Lets client components (public header, admin sidebar) show the batch identity that
// the root layout read from site_settings, without each page passing it down.
const FALLBACK: Brand = { batchName: "Batch 11", institution: "Khulna University", logoText: "11" };
const BrandContext = createContext<Brand>(FALLBACK);

export const BrandProvider = BrandContext.Provider;
export const useBrand = () => useContext(BrandContext);
