import type { CSSProperties, ReactNode } from "react";
import {
  ApiOutlined,
  CloudOutlined,
  CreditCardOutlined,
  DatabaseOutlined,
  DesktopOutlined,
  EnvironmentOutlined,
  LockOutlined,
  MailOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { Tag, Typography } from "antd";

const { Title, Paragraph, Text } = Typography;

type BoxProps = {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  color: string;
  children: ReactNode;
  style?: CSSProperties;
};

const Box = ({ icon, title, subtitle, color, children, style }: BoxProps) => (
  <div
    style={{
      border: `1px solid ${color}40`,
      borderLeft: `4px solid ${color}`,
      borderRadius: 10,
      padding: "14px 16px",
      background: `${color}0c`,
      minWidth: 220,
      flex: 1,
      ...style,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: subtitle ? 0 : 6 }}>
      <span style={{ color, fontSize: 18 }}>{icon}</span>
      <Text strong style={{ fontSize: 14 }}>
        {title}
      </Text>
    </div>
    {subtitle && (
      <Text type="secondary" style={{ fontSize: 11 }}>
        {subtitle}
      </Text>
    )}
    <div style={{ marginTop: 8, fontSize: 12.5, color: "rgba(0,0,0,0.65)" }}>{children}</div>
  </div>
);

const Row = ({ children, gap = 16 }: { children: ReactNode; gap?: number }) => (
  <div style={{ display: "flex", gap, flexWrap: "wrap", alignItems: "stretch" }}>{children}</div>
);

const Arrow = ({ label }: { label?: string }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      color: "rgba(0,0,0,0.35)",
      fontSize: 11,
      margin: "2px 0",
    }}
  >
    {label && <span style={{ marginBottom: 2 }}>{label}</span>}
    <span style={{ fontSize: 18, lineHeight: 1 }}>&#8595;</span>
  </div>
);

const COLORS = {
  client: "#1677ff",
  api: "#52c41a",
  data: "#722ed1",
  edge: "#13c2c2",
  provider: "#fa8c16",
};

export const ArchitectureDocs = () => {
  return (
    <div>
      <Title level={4}>System architecture</Title>
      <Paragraph type="secondary">
        One Supabase Postgres project is the shared source of truth for two independent full-stack apps: the
        customer-facing shop and this admin panel. Each app has its own frontend (deployed on Vercel) and its own
        backend API (deployed on Render). Nothing talks to the database except through the two APIs and one
        Postgres trigger — the frontends never hold a database credential.
      </Paragraph>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, margin: "24px 0" }}>
        {/* Row 1: clients */}
        <Row>
          <Box icon={<DesktopOutlined />} title="shop-client" subtitle="Next.js 15 · Vercel" color={COLORS.client}>
            Public storefront: catalog, cart, checkout, account area, order history, legal pages. Customers
            authenticate directly against Supabase Auth from the browser.
          </Box>
          <Box icon={<DesktopOutlined />} title="admin-client" subtitle="Refine + React + Vite · Vercel" color={COLORS.client}>
            This panel. One fixed admin account. Talks only to admin-api — never touches Supabase directly.
          </Box>
        </Row>

        <Row>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Arrow label="HTTPS / REST" />
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Arrow label="HTTPS / REST" />
          </div>
        </Row>

        {/* Row 2: APIs */}
        <Row>
          <Box icon={<ApiOutlined />} title="shop-api" subtitle="FastAPI (Python) · Render" color={COLORS.api}>
            Public catalog, cart pricing, checkout, Stripe payment intents, Stripe webhook, order history, contact
            form, customer-side withdrawal requests.
          </Box>
          <Box icon={<ApiOutlined />} title="admin-api" subtitle="FastAPI (Python) · Render" color={COLORS.api}>
            Everything behind the login: product/catalog CRUD, orders, refunds, gift cards, shipment tracking,
            customers, promotions — all Refine-compatible REST endpoints.
          </Box>
        </Row>

        <Row>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Arrow label="asyncpg" />
          </div>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Arrow label="asyncpg" />
          </div>
        </Row>

        {/* Row 3: shared data layer */}
        <Box
          icon={<DatabaseOutlined />}
          title="Supabase — one shared project"
          subtitle="Postgres · Auth · Storage · Vault"
          color={COLORS.data}
          style={{ flex: "none" }}
        >
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 4 }}>
            <div>
              <Text strong style={{ fontSize: 12 }}>
                Postgres
              </Text>
              <div>All tables: products, orders, customers, payments, gift cards…</div>
            </div>
            <div>
              <Text strong style={{ fontSize: 12 }}>
                Auth
              </Text>
              <div>Customer accounts for shop-client (register / login / password reset). Admin login is a
              separate, simpler fixed-credential check in admin-api.</div>
            </div>
            <div>
              <Text strong style={{ fontSize: 12 }}>
                Storage
              </Text>
              <div>Product images.</div>
            </div>
            <div>
              <Text strong style={{ fontSize: 12 }}>
                Vault
              </Text>
              <div>Holds the service-role key referenced by the outbox trigger below — never committed to git.</div>
            </div>
          </div>
        </Box>

        <Row>
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <Arrow label="trigger: new row in email_outbox" />
          </div>
        </Row>

        <Box
          icon={<ThunderboltOutlined />}
          title="send-email"
          subtitle="Supabase Edge Function · Deno"
          color={COLORS.edge}
          style={{ flex: "none" }}
        >
          Woken by a Postgres trigger whenever shop-api inserts a row into <code>email_outbox</code> (order
          confirmation, new-order alert to the shop owner). Reads the row, calls Resend, marks it sent. This is the
          only asynchronous/queued path — every other email (gift card issued, shipment confirmation, contact form)
          is sent synchronously, directly from whichever API handled that request.
        </Box>
      </div>

      <Title level={4} style={{ marginTop: 32 }}>
        Third-party providers
      </Title>
      <Paragraph type="secondary">
        Everything external the system depends on, who calls it, and what it's for.
      </Paragraph>
      <Row>
        <Box icon={<CreditCardOutlined />} title="Stripe" subtitle="Payments" color={COLORS.provider}>
          <div>
            <Tag color="green">shop-api</Tag> creates payment intents at checkout and verifies the payment webhook.
          </div>
          <div style={{ marginTop: 4 }}>
            <Tag color="blue">admin-api</Tag> issues refunds (partial or full) against a paid order.
          </div>
        </Box>
        <Box icon={<MailOutlined />} title="Resend" subtitle="Transactional email" color={COLORS.provider}>
          <div>
            Called by the <b>send-email</b> Edge Function (order confirmation, new-order alert), and directly by
            both APIs (shop-api: contact form; admin-api: gift card issued, shipment confirmation).
          </div>
          <div style={{ marginTop: 4 }}>
            <Tag color="red">Currently sandboxed</Tag> — delivery is restricted to the account owner's own address
            until a domain is verified. See the Admin guide → Known limitations.
          </div>
        </Box>
        <Box icon={<EnvironmentOutlined />} title="Furgonetka" subtitle="Shipping pickup-point picker" color={COLORS.provider}>
          Called directly from <Tag color="green">shop-client</Tag> in the browser (not through shop-api) — a
          client-side map widget lets the customer pick a real InPost locker. Only the point's address/name is
          saved on the order; this project never calls Furgonetka's label-creation API.
        </Box>
      </Row>

      <Title level={4} style={{ marginTop: 32 }}>
        Environments
      </Title>
      <Paragraph type="secondary">
        <Tag icon={<LockOutlined />} color="gold">
          develop
        </Tag>{" "}
        branch auto-deploys to the test environment on every push (both Vercel projects, both Render services).{" "}
        <Tag icon={<CloudOutlined />} color="default">
          main
        </Tag>{" "}
        branch → production is deliberately not wired up yet. All four repos share the same CI workflow (typecheck +
        build) gating every push/PR regardless of branch.
      </Paragraph>
    </div>
  );
};
