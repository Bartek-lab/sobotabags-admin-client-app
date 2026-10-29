import { Alert, Collapse, Tag, Typography } from "antd";

const { Title, Paragraph, Text } = Typography;

export const LegalGuideDocs = () => {
  const items = [
    {
      key: "status",
      label: "Your legal status: nierejestrowana działalność",
      children: (
        <>
          <Paragraph>
            You're currently selling as <b>działalność nierejestrowana</b> (unregistered business activity under
            Art. 5 of the Polish Prawo przedsiębiorców) — not a registered sole proprietorship (JDG), no CEIDG
            entry, no ZUS registration. This is legally valid for an individual whose revenue from the activity
            stays under a quarterly cap tied to the minimum wage.
          </Paragraph>
          <Alert
            type="info"
            showIcon
            message="Revenue cap"
            description={
              <>
                75% of the minimum wage per month, applied as a quarterly limit:{" "}
                <Text strong>10 813,50 zł per quarter</Text> (figure current as of 2026, tied to the minimum wage
                and revised periodically — re-check this against the current minimum wage before relying on it).
                Exceeding it means you're deemed to have started regular business activity from the day you
                crossed the limit, triggering a 7-day CEIDG registration deadline.
              </>
            }
          />
          <Paragraph style={{ marginTop: 12 }}>
            If you anticipate crossing the cap (e.g. a strong season), register a JDG proactively rather than
            waiting to be pushed into it — registration itself is free and can be done online via CEIDG.
          </Paragraph>
        </>
      ),
    },
    {
      key: "vat",
      label: "VAT exemption",
      children: (
        <Paragraph>
          You operate under the VAT <b>subjective exemption</b> (zwolnienie podmiotowe, Art. 113 ustawy o VAT) —
          available while annual sales stay under 200 000 zł. This is separate from the nierejestrowana revenue
          cap above and has its own threshold and its own tracking. Invoices/receipts you issue should not show
          VAT. The shop currently sells only within Poland, so the tax-class UI is hidden from this panel entirely
          rather than exposed and set to 0% -- the backend still has the machinery (a <Text code>tax_classes</Text>{" "}
          table and the columns on products/product types) if cross-border selling or VAT status ever changes.
        </Paragraph>
      ),
    },
    {
      key: "withdrawal",
      label: "14-day withdrawal right (odstąpienie od umowy)",
      children: (
        <>
          <Paragraph>
            Consumers have 14 days from delivery to withdraw from the purchase without giving a reason, per the
            Polish Consumer Rights Act (implementing EU Directive 2011/83). The storefront's checkout and order
            pages already implement this: a model withdrawal form, a working "withdraw" button on the order detail
            page, and a review workflow here in the admin panel.
          </Paragraph>
          <Alert
            type="warning"
            showIcon
            style={{ margin: "8px 0" }}
            message="Made-to-order exclusion (Art. 38 pkt 3)"
            description={
              <>
                The withdrawal right does <i>not</i> apply to goods made to the consumer's specification or
                clearly personalized. If any bags are offered as made-to-order/customized, that exclusion must be
                stated clearly to the customer before purchase — check the current product listings against this.
              </>
            }
          />
          <Alert
            type="info"
            message="June 19, 2026 — mandatory digital withdrawal button"
            description={
              <>
                EU Directive 2023/2673 requires a working withdrawal button directly on the order/account page by
                this date for all online sellers in the EU. This is already built and live — nothing further
                needed here, just flagging why it exists.
              </>
            }
          />
        </>
      ),
    },
    {
      key: "warranty",
      label: "Rękojmia (statutory warranty)",
      children: (
        <Paragraph>
          Separate from the withdrawal right: every sale carries a 2-year statutory warranty (rękojmia) against
          defects present at the time of sale, regardless of what any product description says. A customer can
          request repair, replacement, price reduction, or — for a significant defect — a full refund. This can't
          be disclaimed or shortened for consumer sales.
        </Paragraph>
      ),
    },
    {
      key: "pricing",
      label: "Omnibus Directive — showing discounts",
      children: (
        <Paragraph>
          If a product is ever shown with a struck-through "was" price, the Omnibus Directive requires the "was"
          price to be the <b>lowest price</b> that product was actually offered at in the preceding 30 days — not
          just any earlier, higher price. No promotions are currently running that show a price comparison, but
          keep this in mind before launching one (see Promotions in the Admin guide tab).
        </Paragraph>
      ),
    },
    {
      key: "rodo",
      label: "RODO / GDPR",
      children: (
        <>
          <Paragraph>
            The storefront's Polityka Prywatności page covers the customer-facing disclosures (what's collected,
            why, retention, their rights). Operationally, as the sole data controller:
          </Paragraph>
          <Paragraph>
            <ul style={{ marginBottom: 0 }}>
              <li>Customer data lives in Supabase (EU-hosted); payment data is handled by Stripe, not stored here.</li>
              <li>
                A customer can request erasure ("right to be forgotten") — currently only a status label on the
                customer record, not an automated scrub of PII. If a real request comes in, it needs to be handled
                manually (order history retention for tax purposes can be a legitimate reason to retain some data
                even after an erasure request — worth a quick check before deleting anything tied to an order).
              </li>
              <li>Keep a record of any data breach and notify affected customers / UODO if one ever occurs.</li>
            </ul>
          </Paragraph>
        </>
      ),
    },
    {
      key: "odr",
      label: "Dispute resolution — do not reference ODR",
      children: (
        <Paragraph>
          The EU's online dispute resolution (ODR) platform was shut down in July 2025. Don't reference it in any
          customer-facing text (the Regulamin page has already been written to avoid this) — direct dissatisfied
          customers to UOKiK or a local consumer ombudsman (powiatowy/miejski rzecznik konsumentów) instead.
        </Paragraph>
      ),
    },
    {
      key: "scope",
      label: "Scope of this page",
      children: (
        <Paragraph type="secondary">
          This tab is an internal reference for you, not legal advice, and not what customers see — the
          customer-facing legal pages are <Text code>/regulamin</Text> and{" "}
          <Text code>/polityka-prywatnosci</Text> on the storefront. Both were drafted carefully but neither has
          had a lawyer or accountant's sign-off — worth getting one, especially around the nierejestrowana/VAT
          framing and as revenue grows toward the registration thresholds above.
        </Paragraph>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>Legal reference — selling as a private person in Poland</Title>
      <Paragraph type="secondary">
        A plain-language internal summary of the rules this business operates under. Not legal advice.
      </Paragraph>
      <Collapse bordered={false} defaultActiveKey={["status", "withdrawal"]} items={items} />
      <Paragraph type="secondary" style={{ marginTop: 16 }}>
        <Tag color="processing">Reminder</Tag> Re-check the two numeric thresholds above (nierejestrowana quarterly
        cap, VAT annual cap) periodically — both are indexed to figures that change over time.
      </Paragraph>
    </div>
  );
};
