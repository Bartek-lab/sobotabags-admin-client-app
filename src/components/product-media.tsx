import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Card, Image, Spin, Typography, Upload } from "antd";
import type { UploadProps } from "antd";
import { useProductMedia } from "../hooks/use-product-media";

const { Text } = Typography;

const MAX_IMAGES = 5;
const MIN_DIMENSION_PX = 800;
const MAX_MB = 5;

export const ProductMediaCard = ({ productId }: { productId?: string }) => {
  const { items, loading, uploading, upload, remove } = useProductMedia(productId);

  const beforeUpload: UploadProps["beforeUpload"] = async (file) => {
    await upload(file);
    return false; // we already uploaded it ourselves; stop antd's own handling
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
                    remove(item.id);
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
