# VietCraft - REST API Specification

All API responses strictly adhere to the standardized response envelope:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 48,
    "totalPages": 4
  }
}
```

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
- **Rate Limit:** 10 requests per 15 minutes
- **Body:** `{ "email": "admin@vietcraft.com", "password": "Password123!" }`
- **Response:** `{ "token": "jwt...", "user": { "_id": "...", "name": "...", "role": "admin" } }`

### `POST /api/auth/refresh`
- **Cookie:** `refresh_token`
- **Response:** Issues refreshed access token

### `POST /api/auth/logout`
- Clears authentication cookies

### `GET /api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Current user profile

---

## 2. Public Storefront Endpoints

### `GET /api/homepage`
- Retrieves published homepage layout, active hero carousel slides, material headlines, and featured products.

### `GET /api/materials`
- Returns all active materials ordered by `displayOrder`.

### `GET /api/materials/:slug`
- Returns material details + related published articles + curated active products.

### `GET /api/categories`
- Returns all 8 active product categories.

### `GET /api/products`
- **Query Params:**
  - `material`: Material slug (e.g. `rattan-bamboo`)
  - `category`: Category slug (e.g. `lighting`)
  - `minPrice`, `maxPrice`: Numeric price range
  - `sort`: `featured` | `newest` | `price-asc` | `price-desc`
  - `page`: Page index (default: 1)
  - `limit`: Items per page (default: 12)

### `GET /api/products/:slug`
- Returns product details, high-res images, ASIN, specifications, and related products.

### `POST /api/products/:id/click`
- Records affiliate click event with anonymized IP hash and returns compliant Amazon outbound URL.

### `GET /api/articles`
- **Query Params:** `material`, `tag`, `page`, `limit`
- Returns published articles with author profile and reading time.

### `GET /api/articles/:slug`
- Returns published article, author bio, rich HTML content, related products, and related articles.

### `GET /api/search`
- **Query Params:** `q`, `type` (`all` | `articles` | `products`), `material`, `category`, `page`, `limit`
- Unified multi-collection search against post titles, excerpts, tags, and product descriptions.

### `POST /api/newsletter/subscribe`
- **Body:** `{ "email": "visitor@example.com", "source": "homepage" }`
- Upserts newsletter subscription record.

### `POST /api/contact`
- **Body:** `{ "name": "...", "email": "...", "subject": "...", "message": "..." }`
- Submits visitor contact message.

---

## 3. Administrative Endpoints (Requires Bearer Token)

### `GET /api/admin/dashboard`
- Aggregated metrics: published posts, products, materials, clicks, subscribers, recent activity.

### `GET /api/admin/clicks`
- Performance aggregation: top clicked products grouped by ASIN.

### Posts CRUD:
- `GET /api/posts/admin/all`
- `GET /api/posts/admin/:id`
- `POST /api/posts`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`

### Products CRUD:
- `GET /api/products/admin/all`
- `GET /api/products/admin/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Materials & Categories:
- `GET /api/materials/admin/all`
- `POST /api/materials` / `PUT /api/materials/:id` / `DELETE /api/materials/:id`
- `GET /api/categories/admin/all`
- `POST /api/categories` / `PUT /api/categories/:id` / `DELETE /api/categories/:id`

### Content & Settings:
- `GET /api/homepage/admin` / `PUT /api/homepage/admin`
- `GET /api/settings/admin` / `PUT /api/settings/admin`
- `GET /api/newsletter/admin`
- `POST /api/upload` (Multipart image file upload)
