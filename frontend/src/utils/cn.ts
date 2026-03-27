// CSS Class Merging
// Simple clsx-like utility (avoids adding the clsx dep)
export const cn = (...classes: (string | undefined | null | false)[]): string =>
  classes.filter(Boolean).join(" ");
