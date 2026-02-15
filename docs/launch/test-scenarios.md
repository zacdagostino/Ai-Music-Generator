# Launch Test Scenarios

## 1) Physical tier checkout fails without shipping details
- Create order
- Set tier to `LEGACY_COLLECTION` without shipping details
- Start checkout
- Expect `400` from `/api/checkout` with shipping requirement message

## 2) Digital-only checkout succeeds without shipping details
- Create order
- Set tier to `SACRED_COMPOSITION` with no physical add-ons
- Start checkout
- Expect Stripe checkout URL response

## 3) Duplicate Stripe webhook does not duplicate purchase handling
- Send `checkout.session.completed` twice with same order/session
- Expect only first processing to trigger purchase workflow and generation kickoff
- Expect duplicate path logged and ignored

## 4) Suno timeout/retry path surfaces compassionate status
- Force generation failure/timeout in `SunoService`
- Expect order status `FAILED`
- Expect `/api/orders/:id/status` to include compassionate failure message

## 5) Admin fulfillment update visibility
- Admin sets `SHIPPED` and tracking via `/api/admin/orders/:id/fulfillment`
- Expect tracking/status visible on admin order screen and reveal page

## 6) Collection flow integrity
- Complete purchase flow for both `IN_MEMORY` and `IN_LOVE`
- Confirm no broken routes in ritual -> checkout -> compose -> reveal -> memory path

## 7) Policy edge cases
- Verify refund wording displayed for generation failure vs post-delivery scenarios
- Verify terms include US-only fulfillment scope during launch
