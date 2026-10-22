import { useCustomMutation, type HttpError } from "@refinedev/core";
import { message } from "antd";
import { issueGiftCardUrl, toIssueGiftCardPayload } from "../api/gift-cards";

// Not a generic create -- calls the dedicated transactional endpoint
// (app/routers/gift_cards.py) that inserts the gift_cards row AND the
// 'issued' gift_card_transactions row together, which is the only way the
// balance ends up correct.
export function useIssueGiftCard(onSuccess: (code: string) => void) {
  const { mutate, mutation } = useCustomMutation();

  const issue = (values: { currency: string; initial_amount: number; recipient_email?: string }) => {
    mutate(
      {
        url: issueGiftCardUrl(),
        method: "post",
        values: toIssueGiftCardPayload(values),
        config: { headers: { "Content-Type": "application/json" } },
      },
      {
        onSuccess: ({ data }) => onSuccess(data.code),
        onError: (error: HttpError) => message.error(error.message ?? "Failed to issue gift card"),
      },
    );
  };

  return { issue, issuing: mutation.isPending };
}
