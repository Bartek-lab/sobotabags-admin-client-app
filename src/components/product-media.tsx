import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Card, Image, message, Spin, Typography, Upload } from "antd";
import type { UploadProps } from "antd";
import { useEffect, useState } from "react";
import { kyInstance } from "../providers/data";
import { API_URL } from "../providers/constants";
import { TOKEN_KEY } from "../providers/auth";

const { Text } = Typography;

const MAX_IMAGES = 5;
const MIN_DIMENSION_PX = 800;
const MAX_MB = 5;

type ProductMediaItem = {
  id: string;
  asset_id: string;
  sort_order: number;
  url: string;
  width: number | null;
  height: number | null;
  byte_size: number;
};

// Deliberately not a generic resource -- file upload needs multipart form
// data, not the JSON body every other write in this app sends, so it goes
// through the shared `kyInstance` directly (same auth-header hook as
// everything else) rather than Refine's useCreate/useCustomMutation.
//
// kyInstance is created with `throwHttpErrors: false` (checked the installed
// @refinedev/rest source directly) -- it will NOT throw on a 4xx/5xx, it
// just resolves with that response. Every call here has to check
// `response.ok` explicitly; a try/catch alone would treat a failed upload
// as a success.
export const ProductMediaCard = ({ productId }: { productId?: string }) => {
  const [items, setItems] = useState<ProductMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const response = await kyInstance.get(`products/${productId}/media`);
      if (!response.ok) {
        setItems([]);
        return;
      }
      setItems(await response.json<ProductMediaItem[]>());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const beforeUpload: UploadProps["beforeUpload"] = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
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
        message.error(body?.detail ?? `Upload failed (HTTP ${response.status})`);
        return false;
      }
      message.success("Image uploaded");
      await load();
    } catch {
      message.error("Upload failed -- network error");
    } finally {
      setUploading(false);
    }
    return false; // we already uploaded it ourselves; stop antd's own handling
  };

  const onDelete = async (mediaId: string) => {
    const response = await kyInstance.delete(`products/${productId}/media/${mediaId}`);
    if (!response.ok) {
      const body = await response.json<{ detail?: string }>().catch(() => null);
      message.error(body?.detail ?? `Failed to remove image (HTTP ${response.status})`);
      return;
    }
    message.success("Image removed");
    await load();
  };

  if (!productId) return null;

  return (
    <Card
      title={`Images (${items.length}/${MAX_IMAGES})`}
      extra={
        <Text type="secondary">
          jpeg/png/webp, min {MIN_DIMENSION_PX}x{MIN_DIMENSION_PX}px, max {MAX_MB}MB
        </Text>
      }
    >
      <Spin spinning={loading}>
        <Image.PreviewGroup>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {items.map((item) => (
              <div key={item.id} style={{ position: "relative", width: 120, height: 120 }}>
                <Image
                  src={item.url}
                  width={120}
                  height={120}
                  style={{ objectFit: "cover", borderRadius: 4 }}
                />
                <DeleteOutlined
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    background: "rgba(0,0,0,0.55)",
                    color: "#fff",
                    borderRadius: "50%",
                    padding: 6,
                    cursor: "pointer",
                  }}
                />
              </div>
            ))}
            {items.length < MAX_IMAGES && (
              <Upload
                beforeUpload={beforeUpload}
                showUploadList={false}
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading}
              >
                <div
                  style={{
                    width: 120,
                    height: 120,
                    border: "1px dashed #d9d9d9",
                    borderRadius: 4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: uploading ? "not-allowed" : "pointer",
                  }}
                >
                  {uploading ? <Spin /> : <PlusOutlined style={{ fontSize: 24 }} />}
                </div>
              </Upload>
            )}
          </div>
        </Image.PreviewGroup>
      </Spin>
    </Card>
  );
};
