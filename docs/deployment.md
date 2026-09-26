# VietCraft - Deployment & Operations Guide

## 1. Local Development Setup

### Prerequisites
- Node.js v20+ or v24+
- npm v10+ or v11+
- Optional: MongoDB 7+ (The application includes automatic in-memory MongoDB fallback if local mongod is not running!)

### Quick Start
```bash
# 1. Clone & install dependencies
git clone https://github.com/your-org/vietcraft.git
cd vietcraft
npm install

# 2. Setup Environment
cp .env.example .env

# 3. Seed Database
npm run seed

# 4. Start Development Servers concurrently
# Or run individually:
npm run dev:api    # Runs API on http://localhost:5000
npm run dev:web    # Runs Public Web on http://localhost:5173
npm run dev:admin  # Runs Admin CMS on http://localhost:5174
```

Default Admin Credentials (generated during seed):
- **Email:** `admin@vietcraft.com`
- **Password:** `AdminSecurePassword123!`

---

## 2. Docker Deployment

Launch the entire stack (MongoDB, API, Public Website, Admin CMS) in isolated containers:

```bash
docker-compose up -d --build
```

Access services:
- **Public Website:** `http://localhost:5173`
- **Admin CMS:** `http://localhost:5174`
- **REST API:** `http://localhost:5000`
- **MongoDB:** `mongodb://localhost:27017`

---

## 3. Production Cloud Deployment (Vercel / Render / AWS)

### A. MongoDB Atlas
1. Create a free M0 or production M10+ cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user with read/write access to database `vietcraft`.
3. Add your production server IPs (or `0.0.0.0/0` with secure credentials) to Network Access.
4. Copy the connection string into `MONGODB_URI` in your production environment variables:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/vietcraft?retryWrites=true&w=majority
   ```

### B. Backend Deployment (Render / Railway / AWS ECS)
1. Set Root Directory to `.` or `apps/api`.
2. Build Command: `npm install && npm run build --workspace=@vietcraft/api`
3. Start Command: `node apps/api/dist/server.js`
4. Set required environment variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGODB_URI`
   - `JWT_SECRET` (generate using `openssl rand -base64 48`)
   - `JWT_REFRESH_SECRET`
   - `CLIENT_URL=https://vietcraft.com`
   - `ADMIN_URL=https://admin.vietcraft.com`
   - `AMAZON_ASSOCIATE_TAG=your-tag-20`

### C. Public Website (`apps/web`) & Admin (`apps/admin`) on Vercel
1. In Vercel, connect repository.
2. Root Directory: `apps/web` (for public site) and `apps/admin` (for admin).
3. Framework Preset: **Vite**.
4. Set environment variable: `VITE_API_URL=https://api.vietcraft.com`.
