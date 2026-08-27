/* Split out of ReducedMotionNotice so the language-copy table can key its
   per-OS wording off the same OS type without importing the component
   itself (which would drag its React tree into a plain data module). */
export type OS = "windows" | "mac" | "other";

export function detectOS(): OS {
  if (typeof navigator === "undefined") return "other";
  const signal = `${navigator.platform} ${navigator.userAgent}`;
  if (/mac/i.test(signal)) return "mac";
  if (/win/i.test(signal)) return "windows";
  return "other";
}
