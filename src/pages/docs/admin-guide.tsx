import { Collapse, Tag, Typography } from "antd";
import { ProductHandlingGuide } from "./product-handling-guide";

const { Title, Paragraph } = Typography;

const panelStyle = { marginBottom: 8 };

export const AdminGuideDocs = () => {
  const items = [
    {
      key: "products",
      label: "Product handling: categories, attributes, sort orders, data types",
      children: <ProductHandlingGuide />,
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
            <b>After it's shipped:</b> the shipment card stays editable — fix a typo'd tracking number, add a
            tracking URL you forgot, or tick <b>Dostarczono</b> once the customer actually has the bag. None of
            these corrections re-sends the shipment email; that only happens once, on the initial "mark as shipped".
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
          "anonymized" marks the account as such; it does not delete or scrub their stored personal data elsewhere
          — handle an actual erasure request manually (see Legal → RODO/GDPR).
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
