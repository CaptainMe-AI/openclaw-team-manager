export function getCsrfToken(): string {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta?.getAttribute("content") ?? "";
}
