# 🏛️ Bennett Campus ERP — Student Self-Service Portal

A full-stack, production-grade student portal engineered for **Bennett University (The Times Group, Greater Noida)**. The application features a persistent SQLite backend powered by Prisma ORM, secure session-based authentication, biometric and RFID scan event ingestion, and real-time state synchronization across four student life subsites: **Library**, **Sports**, **Laundry**, and **Mess**.

---

## 🚀 Live Demo Credentials

| Role | Enrollment Number | Password | Profile |
|---|---|---|---|
| **Student** | `s26cseu2109` | `Aditya@123` | **Aditya Sharma** (B.Tech CSE, Semester 3) |

> [!NOTE]
> Enrollment numbers are matched case-insensitively and normalized on both client and server. Plaintext passwords never appear outside the initial seed script; all credentials are encrypted using bcrypt (12 salt rounds).

---

## 🎯 Seed Verification Values (Oct 15, 2026)

All values are computed at read-time from raw scan events and database records:

| Metric | Subsite | Expected Value | Verification Status |
|---|---|---|---|
| **Monthly Library Hours** | Library | **28h 20m** | ✅ Verified across 10 working day sessions |
| **Weekly Library Hours** | Library | **5h 50m** | ✅ Mon 12 Oct – Thu 15 Oct |
| **Today's Library Hours** | Library | **2h 20m** | ✅ 10:40 to 13:00 session |
| **Monthly Sports Hours** | Sports | **8h 00m** | ✅ Verified across 6 active sessions |
| **Weekly Sports Hours** | Sports | **2h 00m** | ✅ Tue 13 Oct + Thu 15 Oct |
| **Today's Sports Hours** | Sports | **1h 00m** | ✅ 17:30 to 18:30 on Cricket Ground |
| **Meals Taken Today** | Mess | **3 of 4** | ✅ Breakfast (08:15), Lunch (12:45), Snacks (17:05) |
| **Current Meal** | Mess | **Dinner (Pending)** | ✅ Window: 19:30 – 21:30 |
| **Overdue Book Loan** | Library | **₹14 Fine** | ✅ *Discrete Mathematics* (7 days late @ ₹2/day) |
| **Overdue Laundry Pickup**| Laundry | **Order #2 (9 Clothes)**| ✅ Overdue by 2 days (Alert banner active) |

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router with TypeScript & Turbopack)
- **Database & ORM**: Prisma 6 + SQLite (file-based: `./prisma/dev.db` for full data persistence)
- **Session Management**: `iron-session` v9 (stateless, encrypted, httpOnly, sameSite cookies)
- **Security & Rate Limiting**: In-memory IP rate limiter (5 failed login attempts per 15-minute window) + bcryptjs password hashing
- **Data Visualizations**: Recharts responsive SVG bar charts
- **Styling**: Tailwind CSS v4 with Bennett brand design tokens:
  - Bennett Navy: `#002147`
  - Bennett Blue: `#00418d`
  - Bennett Red: `#da2032`
  - Bennett Red Hover: `#a70b1a`
  - Bennett Dark Blue: `#0b2b55`
  - Typography: Google Fonts `Poppins`

---

## 📂 Subsites & Key Features

### 1. 📚 Library Subsite (`/library`)
- Biometric turnstile IN/OUT session computation with auto-close detection.
- Interactive **Discussion Room Booking**: 4 rooms (A, B, C, D) with hourly slot allocation (09:00 to 21:00) and double-booking prevention.
- **Issued Books Tracking**: Automatic fine computation (₹2/day) for overdue literature.

### 2. ⚽ Sports Complex Subsite (`/sports`)
- **9 Confirmed Bennett Sports Facilities**:
  1. Cricket Ground (Floodlit) & Practice Nets
  2. Main Football Field (Floodlit)
  3. Basketball Courts (Indoor Hardwood & Outdoor Synthetic)
  4. Lawn Tennis Courts (Synthetic Turf)
  5. Badminton Courts (Indoor AC)
  6. Squash Courts (Glass Back)
  7. Volleyball Court (Floodlit)
  8. Table Tennis Indoor Hall
  9. Olympic Size Swimming Pool
- Turf ground and court reservations with instant booking & cancellation.

### 3. 👕 Hostel Laundry Subsite (`/laundry`)
- Live washing status pipeline (`RECEIVED` &rarr; `WASHING` &rarr; `READY` &rarr; `COLLECTED`).
- Prominent collection alerts and overdue pickup notification badges.

### 4. 🍽️ Mess & Dining Subsite (`/mess`)
- Today's 4-tier meal plan with live turnstile status (Breakfast, Lunch, Snacks, Dinner).
- Weekly Indian regional multi-cuisine menu covering all 7 days.
- 7-day attendance logs and duplicate meal scan rejection constraint.

### 5. ⚡ Dev Hardware Simulator (`/dev/simulator`)
- Accessible in development mode to simulate turnstile swipes, RFID badge scans, and dining turnstiles without physical cameras.

---

## 🏃 Getting Started Locally

### 1. Install Dependencies
```bash
npm install
```

`npm install` generates the Prisma Client automatically. If you install with lifecycle scripts disabled, run `npx prisma generate` before starting the app.

### 2. Create Your Local Environment File

The database connection and session settings are intentionally not committed. Copy the provided template once:

```bash
# macOS / Linux
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

### 3. Initialize Database & Run Seed
```bash
npx prisma db push
npx prisma db seed
```

### 4. Run Automated Verification Tests
```bash
npx tsx prisma/verify.ts
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> [!IMPORTANT]
> This is a Next.js App Router application, not a static HTML site. Its `/` route is implemented by `src/app/page.tsx`, so it must be served with `npm run dev` (or `npm run build` followed by `npm start`), not opened with Live Server. Do not add an `index.html` file: it would not be used by Next.js and would mask the actual application route.

---

## 🛡️ Security Architecture
- Session cookies are strictly `httpOnly` and `sameSite: "lax"`.
- All subsite route handlers query records strictly matching the authenticated session's `enrollmentNo`.
- Scan event ingestion (`/api/scan-events`) is secured via the `x-api-key` header (`SCAN_API_KEY`).
- Next.js middleware redirects unauthenticated users directly to `/`.
