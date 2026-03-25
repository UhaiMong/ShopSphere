// ─── Currency ─────────────────────────────────────────────────────────────────
// All prices stored in cents on the backend
export const formatPrice = (cents: number, currency = "BDT"): string => {
  const amount = cents / 100;
  if (currency === "BDT") {
    return `৳${amount.toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount,
  );
};

export const centsToDisplay = (cents: number): string => formatPrice(cents);

// ─── Date ─────────────────────────────────────────────────────────────────────
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
};

// ─── CSS Class Merging ────────────────────────────────────────────────────────
// Simple clsx-like utility (avoids adding the clsx dep)
export const cn = (...classes: (string | undefined | null | false)[]): string =>
  classes.filter(Boolean).join(" ");

// ─── Text ─────────────────────────────────────────────────────────────────────
export const truncate = (str: string, maxLength: number): string =>
  str.length <= maxLength ? str : `${str.slice(0, maxLength - 3)}...`;

export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const slugToTitle = (slug: string): string =>
  slug.split("-").map(capitalize).join(" ");

// ─── Product ──────────────────────────────────────────────────────────────────
export const getDiscountPercent = (
  price: number,
  comparePrice?: number,
): number => {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
};

export const getStarArray = (rating: number): (1 | 0.5 | 0)[] =>
  [1, 2, 3, 4, 5].map((i) => {
    if (rating >= i) return 1;
    if (rating >= i - 0.5) return 0.5;
    return 0;
  });

// ─── Validation ───────────────────────────────────────────────────────────────
export const isValidEmail = (email: string): boolean =>
  /^\S+@\S+\.\S+$/.test(email);

export const isValidPhone = (phone: string): boolean =>
  /^\+?[\d\s\-()]{7,15}$/.test(phone);

// ─── URL / Query Params ───────────────────────────────────────────────────────
export const buildQueryString = (params: Record<string, unknown>): string => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
  });
  const str = qs.toString();
  return str ? `?${str}` : "";
};

// ─── Storage ──────────────────────────────────────────────────────────────────
export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : null;
    } catch {
      return null;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* noop */
    }
  },
  remove: (key: string): void => localStorage.removeItem(key),
};
