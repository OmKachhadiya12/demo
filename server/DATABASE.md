# Lustre & Co. MongoDB database

The API uses MongoDB through Mongoose. Set `MONGODB_URI` in `server/.env`; the database name in that URI is now respected. For local development, use:

```env
MONGODB_URI=mongodb://localhost:27017/lustre-and-co
```

## Collections

| Collection | Schema | Purpose |
| --- | --- | --- |
| `users` | `User` | Customer and admin accounts, password hash, addresses, and wishlist product references |
| `products` | `Product` | Catalog products, pricing, stock, images, metadata, and customer reviews |
| `carts` | `Cart` | One active cart per authenticated user, with product references and selected options |
| `orders` | `Order` | Guest and customer orders, line items, totals, shipping address, payment, and delivery status |
| `coupons` | `Coupon` | Promotional codes, discount rules, minimum order value, and expiry |
| `payments` | `Payment` | One payment ledger record per order, including gateway IDs, status, amount, and timestamps |

MongoDB also creates the nested address and cart-item documents inside their owning collection. Wishlist data is intentionally embedded in `users.wishlist`, so there is no separate wishlist collection. Raw card numbers and CVV values are never stored.

## Run the application

From `server/`:

```bash
npm install
npm run seed
npm run start:dev
```

From `lustre-and-co/` in another terminal:

```bash
npm install
npm run dev
```

The API is available at `http://localhost:5000/api`, Swagger is at `http://localhost:5000/api/docs`, and the Vite frontend runs at `http://localhost:5177`.

The seed command upserts catalog products, promotional coupons, a demo admin, a demo customer, and sample orders. Demo credentials are defined by the seed service; change them before using the application outside local development.

## Frontend API connection

The frontend reads `VITE_API_BASE_URL` from `lustre-and-co/.env`. Keep it pointed at:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Authenticated requests automatically send the JWT from local storage. Admin requests require an authenticated user with the `admin` role.
