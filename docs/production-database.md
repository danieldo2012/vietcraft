# VietCraft — Production Database Architecture & Migration Guide

This document defines the database architecture, configuration, backup, migration, verification, and disaster-recovery procedures for transitioning the **VietCraft** platform from local MongoDB development to **MongoDB Atlas production**.

---

## 1. Architecture Overview

VietCraft employs a single codebase supporting dual database environments switched strictly via environment variables:

```
┌─────────────────────────────────────────────────────────────┐
│                    VietCraft API Server                     │
│                (Node.js / Express / Mongoose)               │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
       [NODE_ENV=development]          [NODE_ENV=production]
               │                               │
               ▼                               ▼
 ┌───────────────────────────┐   ┌───────────────────────────┐
 │   Local MongoDB Server    │   │       MongoDB Atlas       │
 │   127.0.0.1:27017/vietcraft│   │    M10+ Multi-Region Cluster│
 └───────────────────────────┘   └───────────────────────────┘
```

### Key Architectural Tenets
1. **Zero Code Changes for Switching**: The runtime environment is controlled entirely by `NODE_ENV` and `MONGODB_URI`.
2. **Fail-Fast Security in Production**: If `NODE_ENV=production` and `MONGODB_URI` is missing, invalid, or pointing to `localhost`/`127.0.0.1`, the server aborts immediately with an actionable error. It **never** silently falls back to local storage.
3. **Preserved Local Offline Workflow**: Developers can continue developing with `STORAGE_PROVIDER=local` and local MongoDB without Atlas credentials.

---

## 2. Database Models & Schema Baseline

The database consists of 13 primary Mongoose models and their corresponding MongoDB collections:

| Collection Name   | Mongoose Model    | Primary Indexes & Unique Constraints                                                                                 |
| ----------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| `users`           | `User`            | `_id_`, `email` (unique)                                                                                             |
| `materials`       | `Material`        | `_id_`, `slug` (unique), `displayOrder`, `isActive`, Text index (`name`, `description`, `shortDescription`)         |
| `categories`      | `Category`        | `_id_`, `slug` (unique), `displayOrder`, `isActive`, Text index (`name`, `description`)                             |
| `products`        | `Product`         | `_id_`, `title`, `slug` (unique), `material`, `category`, `asin`, `featured`, `status`, Compound index, Text search |
| `posts`           | `Post`            | `_id_`, `slug` (unique), `material`, `tags`, `status`, `publishedAt`, Compound index, Text search                   |
| `homepages`       | `Homepage`        | `_id_`                                                                                                               |
| `sitesettings`    | `SiteSettings`    | `_id_`                                                                                                               |
| `headersettings`  | `HeaderSettings`  | `_id_`                                                                                                               |
| `footersettings`  | `FooterSettings`  | `_id_`                                                                                                               |
| `pages`           | `Page`            | `_id_`, `slug` (unique), `status`, Compound index (`slug`, `status`)                                                 |
| `contactmessages` | `ContactMessage`  | `_id_`, `isRead`                                                                                                     |
| `newsletters`     | `Newsletter`      | `_id_`, `email` (unique), `status`                                                                                   |
| `affiliateclicks` | `AffiliateClick`  | `_id_`, `productId`, `asin`, `timestamp`, Compound index (`timestamp`, `asin`)                                      |

---

## 3. MongoDB Atlas Setup Step-by-Step

### Step 1: Create MongoDB Atlas Cluster
1. Sign in to [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create a new project named `VietCraft-Production`.
3. Deploy a cluster:
   - **Recommended Tier**: Dedicated `M10` or higher (for automatic backups, point-in-time recovery, and dedicated RAM/CPU).
   - **Cloud Provider & Region**: AWS or Google Cloud in `us-east-1` (N. Virginia) or nearest to your US user audience.
   - **Cluster Name**: `vietcraft-prod-cluster`.

### Step 2: Create Application Database User
Never use an Atlas administrator account for application runtime.
1. Navigate to **Database Access** → **Add New Database User**.
2. **Authentication Method**: Password (SCRAM).
3. **Username**: `vietcraft-production-api`.
4. **Password**: Generate a secure 32+ character alphanumeric password with special characters.
5. **Database User Privileges**: Select **Built-in Role** → `readWrite` on the `vietcraft` database only.
6. Click **Add User**.

### Step 3: Configure Network Access
1. Navigate to **Network Access** → **Add IP Address**.
2. **Production Hosting**: Whitelist the static egress IP addresses provided by your hosting platform (e.g. Render, Railway, AWS ECS NAT Gateway, or DigitalOcean Droplets).
3. **Temporary Migration IP**: Add your current migration machine's IP with an expiration timer (e.g. 6 hours).
4. **Never** leave `0.0.0.0/0` (Allow access from anywhere) enabled permanently in production.

### Step 4: Obtain Connection String
1. In Atlas, click **Database** → **Connect** → **Drivers** (Node.js).
2. Copy the SRV URI:
   ```text
   mongodb+srv://vietcraft-production-api:<password>@vietcraft-prod-cluster.xxxx.mongodb.net/vietcraft?retryWrites=true&w=majority&appName=vietcraft
   ```

---

## 4. Environment Variables Configuration

### Development (`.env`)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/vietcraft
STORAGE_PROVIDER=local
```

### Production (Hosting Environment Variables)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://vietcraft-production-api:STRONG_PASSWORD_HERE@vietcraft-prod-cluster.xxxx.mongodb.net/vietcraft?retryWrites=true&w=majority&appName=vietcraft
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
JWT_SECRET=production_super_strong_random_jwt_secret_minimum_64_chars
JWT_REFRESH_SECRET=production_super_strong_random_refresh_secret_minimum_64_chars
INITIAL_ADMIN_EMAIL=admin@vietcraft.com
INITIAL_ADMIN_PASSWORD=ProductionSuperSecureAdminPassword!
```

---

## 5. Database Scripts & Operational Commands

All database management scripts are integrated into `package.json` for deterministic execution:

### 1. Database Backup
Exports all 13 collections from the source database into timestamped JSON files with metadata:
```bash
npm run db:backup
```
- Saved to: `backups/vietcraft-<ISO-TIMESTAMP>/` and mirrored to `backups/latest/`.
- Ignored by Git via `.gitignore`.

### 2. Live Data Migration
Migrates collections and synchronizes indexes to MongoDB Atlas:
```bash
# Dry run (test connection & calculate documents without writing)
npm run db:migrate -- --target-uri="mongodb+srv://vietcraft-production-api:PASS@cluster.mongodb.net/vietcraft" --dry-run

# Execute migration (safe mode: requires target to be empty)
npm run db:migrate -- --target-uri="mongodb+srv://vietcraft-production-api:PASS@cluster.mongodb.net/vietcraft"

# Force overwrite (if target database has existing data that needs replacing)
npm run db:migrate -- --target-uri="mongodb+srv://vietcraft-production-api:PASS@cluster.mongodb.net/vietcraft" --force

# Migrate from a local backup directory instead of live source
npm run db:migrate -- --target-uri="mongodb+srv://vietcraft-production-api:PASS@cluster.mongodb.net/vietcraft" --from-backup="./backups/latest"
```

### 3. Migration Verification
Runs comparative verification checking document counts, indexes, and relationship integrity:
```bash
npm run db:verify -- --target-uri="mongodb+srv://vietcraft-production-api:PASS@cluster.mongodb.net/vietcraft"
```

### 4. Safe Production Seed (Bootstrap)
Idempotently creates initial settings, foundational materials, categories, and the admin user without dropping data:
```bash
npm run seed:production
```

---

## 6. Migration Execution Workflow

Follow this procedure when moving data to production:

```
[Local MongoDB] ──> Step 1: Backup (npm run db:backup)
                           │
                           ▼
                    Step 2: Dry Run (npm run db:migrate -- --target-uri=... --dry-run)
                           │
                           ▼
                    Step 3: Migrate (npm run db:migrate -- --target-uri=...)
                           │
                           ▼
                    Step 4: Verify (npm run db:verify -- --target-uri=...)
                           │
                           ▼
                    Step 5: Health Check (GET /health)
                           │
                           ▼
                    Step 6: Deploy API & Frontend
```

---

## 7. Rollback Plan

In the event of a migration anomaly or unexpected production failure:

1. **Immediate Traffic Halt**:
   - Revert deployment traffic to maintenance mode or prior deployment release.
2. **Point-in-Time Restore (Atlas)**:
   - In MongoDB Atlas, go to **Backup** → **Restore**.
   - Select point-in-time prior to the migration start timestamp.
3. **Local Backup Restore**:
   - The backup created prior to migration remains intact in `backups/vietcraft-<timestamp>/`.
   - Restore using `npm run db:migrate -- --target-uri="<ATLAS_URI>" --from-backup="backups/vietcraft-<timestamp>" --force`.
4. **Verification**:
   - Re-run `npm run db:verify -- --target-uri="<ATLAS_URI>"` to confirm document count parity.

---

## 8. Connection Pooling & Reliability Configuration

In `apps/api/src/config/db.ts`, Mongoose is configured with production-tuned pool settings:
- **`maxPoolSize: 50`**: Handles concurrent API requests without exhausting cluster connection limits.
- **`minPoolSize: 5`**: Maintains persistent warm connections to eliminate TLS handshake latency.
- **`serverSelectionTimeoutMS: 5000`**: Fails quickly (5s) if DNS, firewall, or cluster is unreachable.
- **`socketTimeoutMS: 45000`**: Accommodates long-running analytical queries while guarding against socket starvation.
- **`heartbeatFrequencyMS: 10000`**: Detects network topology shifts every 10 seconds.
- **Graceful Shutdown**: Intercepts `SIGTERM` and `SIGINT`, halts HTTP listeners, flushes buffered operations, closes Mongoose connections cleanly within a 10s timeout, and exits with code 0.

---

## 9. Security Checklist

- [x] No credentials committed to version control.
- [x] `.env` and `backups/` are added to `.gitignore`.
- [x] Production rejects `localhost` / `127.0.0.1` connection strings.
- [x] Health check endpoints (`/health` and `/api/health`) expose connection state (`connected` / `disconnected`) without exposing credentials or topology.
- [x] Admin password in production must be strong and defined via `INITIAL_ADMIN_PASSWORD`.
- [x] Passwords are encrypted with bcrypt (10 rounds) and hashes are preserved during migration.
- [x] Cloudinary credentials remain strictly on the backend and are never sent to the client.
