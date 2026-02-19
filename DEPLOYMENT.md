# 7Sky Website – Deployment Guide

## Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Vercel account

---

## 1. MongoDB Atlas Setup

1. Create a [MongoDB Atlas](https://www.mongodb.com/atlas) account.
2. Create a new cluster (free tier M0 is sufficient for development).
3. Create a database user with read/write access.
4. Under **Network Access**, add your IP (or `0.0.0.0/0` for development; restrict in production).
5. Get the connection string: `mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbname>?retryWrites=true&w=majority`
6. Replace `<user>`, `<password>`, and `<dbname>` with your values.

---

## 2. Environment Variables

Create `.env.local` in the project root:

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/7sky?retryWrites=true&w=majority
JWT_SECRET=your-random-32-char-secret
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

**JWT_SECRET**: Generate with `openssl rand -base64 32`.

---

## 3. Local Development

```bash
# Install dependencies
npm install

# Copy assets (if not already done)
# Logos, gallery images, video, floor plans, and payment plan PDF
# should be in public/media/, public/floor-plans/, public/payment-plan/

# Seed database from Excel
MONGODB_URI=your_uri npm run seed

# Run dev server
npm run dev
```

Default admin: `admin@7sky.com` / `Admin@7sky123` (change via `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` when seeding).

---

## 4. Vercel Deployment

1. Push the project to GitHub.
2. Go to [Vercel](https://vercel.com) → New Project → Import from GitHub.
3. Select the repository.
4. Add environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL` (e.g. `https://7sky.vercel.app`)

5. Deploy.

---

## 5. Post-Deployment

### Database Seeding

Run the seed script with your production MongoDB URI:

```bash
MONGODB_URI="your_production_uri" npm run seed
```

Or use a one-time Vercel serverless function (protected by a secret) to trigger seeding.

### File Storage

- **Public assets**: Serve from `public/` (included in build).
- **Admin uploads**: Stored in `public/uploads/`. For production at scale, consider:
  - [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
  - AWS S3
  - Cloudinary

Update `src/app/api/admin/media/route.ts` to use your chosen storage.

---

## 6. Security Checklist

- [ ] Set strong `JWT_SECRET` in production
- [ ] Restrict MongoDB Atlas IP access in production
- [ ] Enable HTTPS (Vercel does this by default)
- [ ] Change default admin credentials after first login
- [ ] Review rate limits for your traffic

---

## 7. SEO

- Sitemap: `/sitemap.xml`
- Robots: `/robots.txt`
- Schema.org Place markup is included in the root layout.

Update `NEXT_PUBLIC_APP_URL` to your production domain for correct canonical URLs and Open Graph tags.
