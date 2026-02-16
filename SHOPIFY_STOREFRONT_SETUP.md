# Shopify Storefront API – Shop on main site

Customers can **browse and add to cart on your main site**; **checkout** happens on Shopify (secure payment).

## 1. Create a Storefront API token

1. In **Shopify Admin**: **Settings** → **Apps and sales channels** → **Develop apps** → **Create an app** (e.g. “Main site storefront”).
2. Click **Configure Storefront API scopes** and enable:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_checkouts`
   - `unauthenticated_write_checkouts`
3. **Save** and **Install app**.
4. Open **API credentials** → under **Storefront API**, click **Reveal token once** and copy the token.

## 2. Add token to your server

In your project root, add to `.env`:

```env
SHOPIFY_STORE_DOMAIN=kickoffusastore.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_token_here
```

(If you omit `SHOPIFY_STORE_DOMAIN`, it defaults to `kickoffusastore.myshopify.com`.)

## 3. Restart the server

```bash
npm start
```

Then open **http://localhost:3000/shop.html**. You should see your products on the main site; “Add to cart” and the cart drawer work here, and **Checkout** sends customers to Shopify to pay.
