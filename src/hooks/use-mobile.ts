"use client";

import { useMediaQuery } from "./use-utils";

export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}
