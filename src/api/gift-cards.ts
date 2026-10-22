import { API_URL } from "../providers/constants";

export function issueGiftCardUrl() {
  return `${API_URL}/gift-cards/issue`;
}

export function toIssueGiftCardPayload(values: {
  currency: string;
  initial_amount: number;
  recipient_email?: string;
}) {
  return {
    currency: values.currency,
    initial_amount: Math.round(values.initial_amount * 100),
    recipient_email: values.recipient_email || undefined,
  };
}
