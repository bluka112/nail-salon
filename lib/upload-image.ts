// Posts a file to /api/image (Vercel Blob) and returns the public URL.
//
// Contract enforced by app/api/image/route.ts:
//   - body: raw file bytes (NOT FormData)
//   - query: ?filename=<name>
//   - response: JSON `PutBlobResult` from @vercel/blob — url lives at `.url`

import type { PutBlobResult } from "@vercel/blob";

export async function uploadImage(file: File): Promise<string> {
  const url = `/api/image?filename=${encodeURIComponent(file.name)}`;
  const res = await fetch(url, { method: "POST", body: file });
  if (!res.ok) throw new Error(`Image upload failed: ${res.status}`);
  const blob = (await res.json()) as PutBlobResult;
  return blob.url;
}
