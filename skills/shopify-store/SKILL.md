---
name: shopify-store
description: Use when the user wants to manage their Shopify store from chat — list or add products, change prices or stock, put a book on the storefront, organize collections (one per series), or run a discount code. Triggers on "add my book to Shopify", "put this on my store", "change the price on Shopify", "make a series collection", "run a 20% off code", "how much stock do I have".
---

# Run a Shopify store from chat

The author's Shopify store connects as a `shopify` account on their pen name (find it with `aa_list_accounts({ platform: "shopify" })`). Every tool below takes that account's id as `accountId`. These tools are on every plan; nothing here needs the ads upgrade.

**Every write lands on the author's live store.** Confirm the details before creating, repricing, restocking, publishing, archiving or running a discount, the same way you would before posting.

## Check the store first

Call `aa_shopify_store` before the first product call in a conversation, and again whenever a call answers `STORE_PERMISSIONS_MISSING`. Read `permissions`:

- `complete: true` — go ahead.
- `fix: "grant"` — the store needs to approve more permissions. Give the author `grantPermissionsUrl`; they approve in Shopify, nothing is reinstalled, then try again. Stores connected before mid-September 2026 usually need this.
- `fix: "custom_app_scopes"` — the store is connected with its own Shopify custom app. The author adds the missing Admin API scopes to that app in Shopify, then reconnects the store with the new token.
- A failed call can also answer `fix: "reconnect"` with no grant link. Follow the error's own `message`: the author reconnects the store from Accounts. Don't retry the call just because `aa_shopify_store` now says `complete: true`.

## Three things that trip people up

1. **Active is not on sale.** A product created here stays off the storefront until it is published to the **Online Store** sales channel. `aa_set_shopify_product_status` with `activate` only changes its status. To make it visible: `aa_list_shopify_channels`, pick the channel named "Online Store", then `aa_publish_shopify_product({ productId, publish: [channelId] })`. Only then does `aa_get_shopify_product` return an `onlineStoreUrl`. Never tell the author a book is live after activate alone.
2. **New products start as drafts.** `aa_create_shopify_product` defaults to `status: "draft"`. Pass `active` only when the author asks to publish, and still do the channel step above.
3. **ISBN goes in `sku`.** Barcode can't be set through this connection, so put the ISBN in each variant's `sku`.

## Decision tree

| Author says... | Tools |
|---|---|
| "What's on my store?" | `aa_list_shopify_products` (cursor-paged; `query` takes Shopify search syntax: `title:`, `tag:`, `sku:`) |
| "Add my book" | Gather title, description, price and `sku` per format, and public image URLs → read them back and confirm → `aa_create_shopify_product` (lands as a draft) → when the author says to put it on sale: activate, then publish to Online Store |
| "Change the price" | `aa_get_shopify_product` for variant ids → `aa_update_shopify_product_prices`. `price` is what shoppers pay; `compareAtPrice` is only the struck-through "was" price. To end a sale, set `price` back to the regular price the author confirms **and** `compareAtPrice: null`; clearing `compareAtPrice` alone leaves the sale price in place |
| "Update the description / tags" | `aa_update_shopify_product` (only the fields you pass change; `tags` replaces the whole list) |
| "Take it off the store" | `aa_publish_shopify_product({ unpublish: [onlineStoreChannelId] })`, or `aa_set_shopify_product_status` with `archive`. `delete` is permanent; only on an explicit request |
| "Make a collection for the series" | `aa_create_shopify_collection` (`sortOrder: "manual"` keeps reading order; `productIds` adds books at once) → `aa_update_shopify_collection_products` to add or remove later |
| "How much stock do I have?" | `aa_get_shopify_inventory({ productId })` |
| "I got 50 more copies" | `aa_get_shopify_product` for the variant (which format?) and `aa_list_shopify_locations` for the location → `aa_set_shopify_inventory({ productId, mode: "adjust", changes: [{ variantId, locationId, quantity: 50 }] })`. `mode: "set"` writes the count outright |
| "Run a launch discount" | `aa_create_shopify_discount` → `aa_set_shopify_discount_active` to switch it off later |

## Discounts

- `method: "code"` needs `code` (what shoppers type); `method: "automatic"` applies at checkout with no code. `usageLimit` and `oncePerCustomer` only apply to code discounts.
- `type: "percentage"` needs `percentage` (15 means 15%); `fixed_amount` needs `amount` as a decimal string in the store's currency (`"5.00"`); `free_shipping` needs neither.
- Leave `productIds` and `collectionIds` out for the whole store, or pass a series collection to discount just that series.
- Read the terms back before creating: "LANTERN15, 15% off the Lantern series, starts now, ends Oct 31, once per customer. Create it?"
- Turning a discount off (`aa_set_shopify_discount_active` with `active: false`) keeps it for next time. Prefer that to deleting.

## Common pitfalls

- **Saying "it's live" after activate.** See rule 1. Check `onlineStoreUrl` on `aa_get_shopify_product` before saying so.
- **Repricing without variant ids.** Prices are set per variant; get them from `aa_get_shopify_product` first.
- **Images that aren't public.** Product images must be public URLs Shopify can fetch.
- **Changing images later.** Images go in when the product is created. There's no chat tool yet for adding, removing or reordering images on an existing product; point the author to Shopify admin for that.
- **Wrong pen name.** Stores belong to a pen name. Pass `profileId` for a non-primary pen name (see `pen-names`).
- **WooCommerce.** These tools are Shopify only. WooCommerce stores are managed through the StorytellerOS WordPress plugin.
