import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mutateMock, messageSuccess, messageWarning } = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  messageSuccess: vi.fn(),
  messageWarning: vi.fn(),
}));

vi.mock("@refinedev/core", () => ({
  useCustomMutation: () => ({ mutate: mutateMock, mutation: { isPending: false } }),
}));

vi.mock("antd", async () => {
  const actual = await vi.importActual<typeof import("antd")>("antd");
  return {
    ...actual,
    message: { ...actual.message, success: messageSuccess, warning: messageWarning },
  };
});

// ShipmentCard is a named export of orders/show.tsx (exported specifically
// to make this regression test possible -- it was previously a local const).
// See PRODUCTION_READINESS_TODO.md 2026-10-28 for the bug this covers: a
// failed confirmation email used to leave the order half-updated and the
// admin looking at a hard error, even though the order had, in fact,
// already been marked shipped.
import { ShipmentCard } from "./show";

const baseOrder = {
  id: "order-1",
  number: 100001,
  email: "customer@example.com",
  phone: null,
  status: "completed",
  payment_status: "paid",
  fulfillment_status: "unfulfilled",
  currency: "PLN",
  subtotal_amount: 10000,
  discount_amount: 0,
  shipping_amount: 0,
  tax_amount: 0,
  total_amount: 10000,
  shipping_method_name: null,
  shipping_carrier_code: null,
  pickup_point: null,
  customer_note: null,
  placed_at: null,
  completed_at: null,
  cancelled_at: null,
  cancel_reason: null,
  tracking_number: null,
  tracking_url: null,
  shipped_at: null,
  delivered_at: null,
  created_at: "2026-10-27T00:00:00Z",
};

describe("ShipmentCard", () => {
  beforeEach(() => {
    mutateMock.mockClear();
    messageSuccess.mockClear();
    messageWarning.mockClear();
  });

  it("shows an editable, pre-filled form (not read-only) once the order is already shipped", () => {
    render(
      <ShipmentCard
        order={{ ...baseOrder, fulfillment_status: "fulfilled", tracking_number: "KAXI01BAPP" }}
        onShipped={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /zapisz zmiany/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /oznacz jako wysłane/i })).not.toBeInTheDocument();
    const input = screen.getByDisplayValue("KAXI01BAPP") as HTMLInputElement;
    expect(input).toBeInTheDocument();
  });

  it("saves corrected tracking info and the delivered flag via PATCH .../shipment, without resending an email", () => {
    mutateMock.mockImplementation(() => {});
    render(
      <ShipmentCard
        order={{ ...baseOrder, fulfillment_status: "fulfilled", tracking_number: "OLD123" }}
        onShipped={vi.fn()}
      />,
    );

    const input = screen.getByDisplayValue("OLD123");
    fireEvent.change(input, { target: { value: "FIXED456" } });
    fireEvent.click(screen.getByLabelText(/jeszcze nie/i));
    fireEvent.click(screen.getByRole("button", { name: /zapisz zmiany/i }));

    const [args] = mutateMock.mock.calls[0];
    expect(args.url).toContain(`/orders/${baseOrder.id}/shipment`);
    expect(args.method).toBe("patch");
    expect(args.values).toEqual({ tracking_number: "FIXED456", tracking_url: undefined, delivered: true });
  });

  it("shows the delivered timestamp once delivered_at is set", () => {
    render(
      <ShipmentCard
        order={{
          ...baseOrder,
          fulfillment_status: "fulfilled",
          tracking_number: "ABC123",
          delivered_at: "2026-10-29T12:00:00Z",
        }}
        onShipped={vi.fn()}
      />,
    );
    expect(screen.getByLabelText(/tak,/i)).toBeInTheDocument();
  });

  it("disables the submit button until a tracking number is entered", () => {
    render(<ShipmentCard order={baseOrder} onShipped={vi.fn()} />);
    expect(screen.getByRole("button", { name: /oznacz jako wysłane/i })).toBeDisabled();
  });

  it("shows a success message (not a warning) and calls onShipped when email_sent is true", () => {
    mutateMock.mockImplementation((_args, { onSuccess }) => {
      onSuccess({ data: { shipped: true, email_sent: true } });
    });
    const onShipped = vi.fn();
    render(<ShipmentCard order={baseOrder} onShipped={onShipped} />);

    fireEvent.change(screen.getByPlaceholderText(/KAXI01BAPP/i), { target: { value: "ABC123" } });
    fireEvent.click(screen.getByRole("button", { name: /oznacz jako wysłane/i }));

    expect(messageSuccess).toHaveBeenCalledTimes(1);
    expect(messageWarning).not.toHaveBeenCalled();
    expect(onShipped).toHaveBeenCalledTimes(1);
  });

  it("shows a warning (not an error/failure) and still calls onShipped when email_sent is false", () => {
    mutateMock.mockImplementation((_args, { onSuccess }) => {
      onSuccess({ data: { shipped: true, email_sent: false } });
    });
    const onShipped = vi.fn();
    render(<ShipmentCard order={baseOrder} onShipped={onShipped} />);

    fireEvent.change(screen.getByPlaceholderText(/KAXI01BAPP/i), { target: { value: "ABC123" } });
    fireEvent.click(screen.getByRole("button", { name: /oznacz jako wysłane/i }));

    expect(messageWarning).toHaveBeenCalledTimes(1);
    expect(messageSuccess).not.toHaveBeenCalled();
    // The order IS shipped regardless of email delivery -- onShipped must
    // still fire so the page refetches and shows the shipped state.
    expect(onShipped).toHaveBeenCalledTimes(1);
  });

  it("treats a response with no email_sent field as success (back-compat default)", () => {
    mutateMock.mockImplementation((_args, { onSuccess }) => {
      onSuccess({ data: { shipped: true } });
    });
    render(<ShipmentCard order={baseOrder} onShipped={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/KAXI01BAPP/i), { target: { value: "ABC123" } });
    fireEvent.click(screen.getByRole("button", { name: /oznacz jako wysłane/i }));

    expect(messageSuccess).toHaveBeenCalledTimes(1);
    expect(messageWarning).not.toHaveBeenCalled();
  });

  it("sends tracking_url as undefined (not an empty string) when left blank", () => {
    mutateMock.mockImplementation(() => {});
    render(<ShipmentCard order={baseOrder} onShipped={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/KAXI01BAPP/i), { target: { value: "ABC123" } });
    fireEvent.click(screen.getByRole("button", { name: /oznacz jako wysłane/i }));

    const [args] = mutateMock.mock.calls[0];
    expect(args.values).toEqual({ tracking_number: "ABC123", tracking_url: undefined });
    expect(args.url).toContain(`/orders/${baseOrder.id}/ship`);
    expect(args.method).toBe("post");
  });
});
