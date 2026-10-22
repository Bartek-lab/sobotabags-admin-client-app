import { useEffect, useState } from "react";
import { message } from "antd";
import {
  deleteProductMedia,
  fetchProductMedia,
  uploadProductMedia,
  type ProductMediaItem,
} from "../api/media";

export function useProductMedia(productId?: string) {
  const [items, setItems] = useState<ProductMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      setItems(await fetchProductMedia(productId));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const upload = async (file: File) => {
    if (!productId) return;
    setUploading(true);
    try {
      const result = await uploadProductMedia(productId, file);
      if (!result.ok) {
        message.error(result.detail ?? "Upload failed");
        return;
      }
      message.success("Image uploaded");
      await load();
    } catch {
      message.error("Upload failed -- network error");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (mediaId: string) => {
    if (!productId) return;
    const result = await deleteProductMedia(productId, mediaId);
    if (!result.ok) {
      message.error(result.detail ?? "Failed to remove image");
      return;
    }
    message.success("Image removed");
    await load();
  };

  return { items, loading, uploading, upload, remove };
}
