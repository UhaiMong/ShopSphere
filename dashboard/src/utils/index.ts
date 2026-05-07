export const cn = (...c: (string | undefined | null | false)[]) =>
  c.filter(Boolean).join(" ");

export const formatPrice = (cents: number) =>
  `৳${(cents / 100).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;

export const formatNumber = (n: number) => n.toLocaleString("en-BD");

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export const truncate = (s: string, n: number) =>
  s.length <= n ? s : `${s.slice(0, n - 3)}...`;

export const buildParams = (obj: Record<string, unknown>) => {
  const p = new URLSearchParams();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  });
  return p;
};

export const downloadCSV = (
  rows: Record<string, unknown>[],
  filename: string,
) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => JSON.stringify(r[h] ?? "")).join(","),
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
};

export const fSizeExtension = (s: any): string => {
  const size = Number(s);
  if (size < 1024) {
    return `${size} KB`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} MB`;
  } else {
    return `${(size / (1024 * 1024)).toFixed(2)} GB`;
  }
};
