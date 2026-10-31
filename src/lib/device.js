"use client";

import { useSyncExternalStore } from "react";

/** "3d" or "static" (no WebGL, or reduced motion), plus whether this is a phone. Read once. */
let device = null;
function readDevice() {
  if (device) return device;
  let mode = "static";
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    try {
      const c = document.createElement("canvas");
      if (c.getContext("webgl2") || c.getContext("webgl")) mode = "3d";
    } catch {}
  }
  const mobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
  device = `${mode}|${mobile ? "mobile" : "desktop"}`;
  return device;
}
const noSubscribe = () => () => {};

/** `{ mode: "pending" | "3d" | "static", mobile }`; "pending" only during server render. */
export function useDevice() {
  const [mode, kind] = useSyncExternalStore(noSubscribe, readDevice, () => "pending|desktop").split("|");
  return { mode, mobile: kind === "mobile" };
}
