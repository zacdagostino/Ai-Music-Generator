# Fulfillment SOP (Day 1)

## Scope
- Launch geography: US only
- Physical components: QR keepsake card, linen lyric print
- Applies to: Legacy Collection and physical add-ons (`qrCard`, `linenPrint`)

## SLA Defaults
- Digital composition delivery: usually 10-30 minutes, up to 12 hours in high volume
- Physical production: 2-4 business days after digital reveal
- Shipping: 3-7 business days (US)

## Workflow
1. Order paid -> order enters `IN_PRODUCTION` (if physical required and details valid)
2. Verify recipient and US shipping details
3. Produce QR card and/or linen print
4. Package and mark order `READY_TO_SHIP`
5. Purchase label and update tracking
6. Mark `SHIPPED`, then `DELIVERED` on confirmation

## Exceptions
- Generation failure: contact client, offer recompose or full refund
- Stock/print delay: notify within 1 business day with revised ETA
- Address issue: set status `PENDING_DETAILS` until corrected address is received

## Required Tracking Data
- `shippingStatus`
- `trackingNumber`
- `fulfillmentNotes`
- `fulfilledAt` when delivered
