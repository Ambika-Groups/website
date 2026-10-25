"use client";

import { useEffect } from "react";
import { captureUtm } from "@/lib/utm";

/** Mounted once in each root layout; records the landing page's UTM values for the session. */
export function UtmCapture() {
  useEffect(() => {
    let storage: Storage | undefined;
    try {
      storage = window.sessionStorage;
    } catch {
      storage = undefined;
    }
    captureUtm(window.location.search, storage);
  }, []);
  return null;
}
