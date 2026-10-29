import { Alert, Collapse, Tag, Typography } from "antd";
import { ProductHandlingGuide } from "./product-handling-guide";

const { Title, Paragraph, Text } = Typography;

const panelStyle = { marginBottom: 8 };

export const AdminGuideDocs = () => {
  const items = [
    {
      key: "products",
      label: "Product handling: categories, attributes, sort orders, data types",
      children: <ProductHandlingGuide />,
    },
    {
      key: "tax-classes",
      label: "Tax classes",
      children: (
        <Paragraph>
          <b>Tax classes</b> set the VAT rate applied to a product's line items at checkout — as a VAT-exempt
          private seller this is currently 0%, but the machinery is there if that ever changes.
        </Paragraph>
      ),
    },
    {
      key: "orders",
      label: "Orders: viewing, shipping, refunding",
      children: (
        <>
          <Paragraph>
            <b>Orders → list</b> shows every order with its payment and fulfillment status. Open one to see line
            items, customer, shipping address or pickup point, payment history, and the actions below.
          </Paragraph>
          <Paragraph>
            <b>Marking as shipped:</b> once a paid order's bag is physically handed to the carrier, open the order
            and use the shipment card to enter a tracking number and (optionally) a tracking URL. Submitting this
            flips the order's fulfillment status to shipped <i>and</i> immediately sends the customer a shipment
            confirmation email in one step — there's no separate "save" vs "notify", submitting does both.
          </Paragraph>
          <Paragraph>
            <b>Refunding:</b> on a paid order, use the refund card to issue a partial or full refund. This calls
            Stripe for real — money actually moves — and updates the order's payment status accordingly. You can
            optionally restock the refunded line items back into inventory. A refund can't exceed what's left
            un-refunded on the order, and you can't double-refund the same amount; the form will reject attempts to.
          </Paragraph>
          <Paragraph>
            <b>Customer withdrawal requests</b> (the legally required 14-day "odstąp od umowy" right) show up on
            the order as a review card with the customer's reason and a status you set (approved/rejected) plus an
            optional admin note. Approving a withdrawal doesn't automatically refund — issue the refund separately
            once the returned bag is back in hand and checked.
          </Paragraph>
        </>
      ),
    },
    {
      key: "payments",
      label: "Payments",
      children: (
        <Paragraph>
          A read-only ledger of Stripe payment intents and their status, linked to orders. Useful for
          reconciliation — refunds themselves are issued from the order page, not from here.
        </Paragraph>
      ),
    },
    {
      key: "gift-cards",
      label: "Gift cards",
      children: (
        <>
          <Paragraph>
            <b>Issue</b> a new gift card with a starting balance and recipient email — this immediately emails the
            recipient their code. Editing a gift card lets you adjust its balance or deactivate it (e.g. if issued
            by mistake). Gift cards are redeemed by the customer at checkout on the storefront.
          </Paragraph>
        </>
      ),
    },
    {
      key: "promotions",
      label: "Promotions",
      children: (
        <Paragraph>
          Discount rules applied at checkout (percentage or fixed amount, with optional date ranges and usage
          limits). If a promotion is ever shown as a "was/now" price comparison on the storefront, Polish/EU law
          (the Omnibus Directive) requires the "was" price to be the lowest price shown in the preceding 30 days —
          worth keeping in mind before running a discount campaign, see the Legal tab.
        </Paragraph>
      ),
    },
    {
      key: "shipping-methods",
      label: "Shipping methods",
      children: (
        <Paragraph>
          Defines the methods offered at checkout (Poczta Polska, InPost courier, InPost Paczkomat) and their
          price. The Paczkomat option is the only one with a pickup-point map (Furgonetka); the others are plain
          address-based delivery. Only the pickup point's name/address is stored on the order — no carrier API is
          called from this system, shipping labels are created manually via the carrier's own app/counter.
        </Paragraph>
      ),
    },
    {
      key: "customers",
      label: "Customers",
      children: (
        <Paragraph>
          Customer accounts are created by the customer themselves on the storefront (Supabase Auth) — this panel
          only lets you view and edit their profile/status, not create new ones. Setting a customer's status to
          "anonymized" is currently just a label; it does not yet scrub their personal data (see Known
          limitations below).
        </Paragraph>
      ),
    },
    {
      key: "login",
      label: "Admin login & access",
      children: (
        <Paragraph>
          There is exactly one admin account, with credentials set directly in the database — there is no
          self-service registration or "forgot password" link on this panel's login page by design. If the
          password is ever lost, it has to be reset directly in the database, not through the UI.
        </Paragraph>
      ),
    },
    {
      key: "limitations",
      label: "Known limitations (as of today)",
      children: (
        <>
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 12 }}
            message="Resend sandbox mode"
            description={
              <>
                Until a domain is verified in Resend, every outgoing email (order confirmation, shipment
                notice, gift card, contact form reply) can only actually be delivered to the account owner's own
                address. All the sending code is live and working — this is a dashboard/DNS step, not a code gap.
              </>
            }
          />
          <Paragraph>
            Other open items, tracked in <Text code>PRODUCTION_READINESS_TODO.md</Text> next to the repos: RBAC is
            not enforced per-route (moot while there's a single admin account), there's no production (
            <Text code>main</Text> branch) deploy pipeline yet, no rate limiting on login/checkout, no error
            monitoring, and the low-stock-alert email template exists but nothing triggers it yet.
          </Paragraph>
        </>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>Admin panel guide</Title>
      <Paragraph type="secondary">
        How to do everything in this panel, in plain terms. Expand a section below.
      </Paragraph>
      <Collapse
        bordered={false}
        defaultActiveKey={["products", "orders"]}
        items={items.map((item) => ({ ...item, style: panelStyle }))}
      />
      <Paragraph type="secondary" style={{ marginTop: 16 }}>
        <Tag>Tip</Tag> Every list page supports column sorting and filtering; most also support CSV-style bulk
        actions where a "canDelete" permission is shown in the Actions column.
      </Paragraph>
    </div>
  );
};
