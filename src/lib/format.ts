export const STATUS_COLORS: Record<string, string> = {
  WISHLIST: "bg-slate-500/20 text-slate-300",
  APPLIED: "bg-blue-500/20 text-blue-300",
  INTERVIEWING: "bg-amber-500/20 text-amber-300",
  OFFER: "bg-green-500/20 text-green-300",
  REJECTED: "bg-red-500/20 text-red-300",
  WITHDRAWN: "bg-purple-500/20 text-purple-300",
};

export function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString();
}

export function formatDateTime(value: Date | string) {
  return new Date(value).toLocaleString();
}
