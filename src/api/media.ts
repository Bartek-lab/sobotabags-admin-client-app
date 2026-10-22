import { kyInstance } from "../providers/data";
import { API_URL } from "../providers/constants";
import { TOKEN_KEY } from "../providers/auth";

export type ProductMediaItem = {
  id: string;
  asset_id: string;
  sort_order: number;
  url: string;
  width: number | null;
  height: number | null;
  byte_size: number;
};

// Deliberately not a generic resource -- file upload needs multipart form
// data, not the JSON body every other write in this app sends, so this goes
// through the shared `kyInstance` directly (same auth-header hook as
// everything else) rather than Refine's useCreate/useCustomMutation.
//
// kyInstance is created with `throwHttpErrors: false` (checked the installed
// @refinedev/rest source directly) -- it will NOT throw on a 4xx/5xx, it
// just resolves with that response. Every call here has to check
// `response.ok` explicitly; a try/catch alone would treat a failed upload
// as a success.

export async function fetchProductMedia(productId: string): Promise<ProductMediaItem[]> {
  const response = await kyInstance.get(`products/${productId}/media`);
  if (!response.ok) return [];
  return response.json<ProductMediaItem[]>();
}

export async function uploadProductMedia(
  productId: string,
  file: File,
): Promise<{ ok: true } | { ok: false; detail?: string }> {
  const formData = new FormData();
  formData.append("file", file);
  // Plain fetch, not kyInstance: the shared instance has
  // Content-Type: application/json baked in as a DEFAULT HEADER at
  // creation time (confirmed in @refinedev/rest's source), which rides
  // along even with a FormData body and overrides the browser's
  // automatic multipart boundary -- the server then can't parse `file`
  // at all and returns 422. A bare fetch lets the browser set the
  // correct multipart Content-Type itself.
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_URL}/products/${productId}/media`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    return { ok: false, detail: body?.detail };
  }
  return { ok: true };
}

export async function deleteProductMedia(
  productId: string,
  mediaId: string,
): Promise<{ ok: true } | { ok: false; detail?: string }> {
  const response = await kyInstance.delete(`products/${productId}/media/${mediaId}`);
  if (!response.ok) {
    const body = await response.json<{ detail?: string }>().catch(() => null);
    return { ok: false, detail: body?.detail };
  }
  return { ok: true };
}
