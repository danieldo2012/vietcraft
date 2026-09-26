# VietCraft - Production Security Checklist

## 1. Authentication & Session Security
- [x] Passwords hashed using bcrypt (10 rounds salt). Plaintext passwords never stored.
- [x] JWT access token expiration set to 1 hour; refresh token set to 7 days.
- [x] Refresh token transmitted in HTTP-only, SameSite lax/strict cookie.
- [x] Sensitive fields (`password`, `refreshTokenHash`) excluded by default via Mongoose `select: false`.
- [x] Rate limiting configured on `/api/auth/login` to thwart brute-force password guessing.

## 2. API Gateway & Network Security
- [x] Helmet security headers active (`Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`).
- [x] Strict CORS origin validation preventing unauthorized cross-origin requests.
- [x] Centralized error handler masks stack traces in production mode (`NODE_ENV === 'production'`).
- [x] Multipart file uploads restricted to valid image mime types and 10MB file limit.

## 3. Affiliate Compliance & Integrity
- [x] FTC 16 CFR Part 255 compliant disclosures present on all product cards, article embeds, and footer.
- [x] External affiliate links tagged with `rel="nofollow sponsored noopener noreferrer"`.
- [x] All outbound clicks routed through internal tracking endpoint that anonymizes visitor IP addresses using SHA-256 one-way hashes.
- [x] No fake reviews, artificial star ratings, or simulated availability claims.

## 4. Database & Input Sanitation
- [x] Strict schema validation via Zod on all incoming POST / PUT payloads.
- [x] Mongoose schema types prevent NoSQL injection by enforcing explicit casts.
- [x] Unique indexes on slugs prevent race-condition URL duplicates.
