import { ApartmentOutlined, BookOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { List } from "@refinedev/antd";
import { Tabs } from "antd";

import { ArchitectureDocs } from "./architecture";
import { AdminGuideDocs } from "./admin-guide";
import { LegalGuideDocs } from "./legal-guide";

export const DocsPage = () => {
  return (
    <List title="Documentation" headerButtons={() => null}>
      <Tabs
        defaultActiveKey="architecture"
        items={[
          {
            key: "architecture",
            label: (
              <span>
                <ApartmentOutlined /> Architecture
              </span>
            ),
            children: <ArchitectureDocs />,
          },
          {
            key: "admin-guide",
            label: (
              <span>
                <BookOutlined /> Admin guide
              </span>
            ),
            children: <AdminGuideDocs />,
          },
          {
            key: "legal",
            label: (
              <span>
                <SafetyCertificateOutlined /> Legal
              </span>
            ),
            children: <LegalGuideDocs />,
          },
        ]}
      />
    </List>
  );
};
