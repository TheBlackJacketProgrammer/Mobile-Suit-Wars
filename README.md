# Mobile Suit Wars

A web app built with **Next.js** where players sign in, manage a **hangar** of mobile suits, spend in-game **G-points** in the **shop**, and (for admins) maintain the suit catalog in **MS Core**. Authentication uses **NextAuth** with credentials stored in **MySQL/MariaDB** via **Prisma**.

## Features

- **Sign in** — Username/password login with JWT sessions (`next-auth`).
- **Hangar** — View and edit owned suits, change active lineup units.
- **Shop** — Browse and purchase mobile suits; balances tied to the user account.
- **MS Core** *(Admin only)* — Create, edit, and manage the global mobile suit database.
- **UI** — SCSS component styling, Tailwind for layout utilities, optional background music and UI sound effects.

## Tech stack

| Area        | Choice                                      |
|------------|---------------------------------------------|
| Framework  | Next.js 16 (App Router)                     |
| UI         | React 19, TypeScript, Sass, Tailwind CSS 4  |
| Auth       | NextAuth.js (credentials, JWT)            |
| Database   | MySQL-compatible (Prisma 7, MariaDB adapter) |
| Passwords  | bcryptjs                                    |

## Prerequisites

- **Node.js** (LTS recommended)
- **MySQL** or **MariaDB** with a database that matches the models in `prisma/schema.prisma` (or plan to introspect/sync schema with Prisma)

## Environment variables

Create a `.env` file in the project root (do not commit secrets). Typical values:

```env
# Prisma — MySQL connection string
# Example: mysql://USER:PASSWORD@HOST:3306/DATABASE
DATABASE_URL="mysql://..."

# NextAuth — required for signing sessions
NEXTAUTH_SECRET="generate-a-long-random-string"
# App URL in production, e.g. https://your-domain.com
NEXTAUTH_URL="http://localhost:3000"
```

Generate `NEXTAUTH_SECRET` with `openssl rand -base64 32` or any secure random string generator.

## Getting started

```bash
# Install dependencies
npm install

# Generate Prisma Client (output: app/generated/prisma)
npx prisma generate

# If you are creating or updating the DB from this schema:
# npx prisma db push
# Or use migrations if your team maintains them under prisma/migrations

# Development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The sign-in page is the home route.

### Other scripts

| Command        | Description        |
|----------------|--------------------|
| `npm run dev`  | Start dev server   |
| `npm run build`| Production build   |
| `npm run start`| Run production build |
| `npm run lint` | ESLint             |

## Project layout (high level)

```
app/
  actions/          # Server actions (shop, hangar, suits, user)
  api/              # Route handlers (auth, uploads, lineup, etc.)
  hanger/           # User hangar UI
  shop/             # Shop UI
  ms-core/          # Admin mobile suit management
  generated/prisma/ # Prisma Client (generated)
components/        # Shared React components (nav, login, toast, audio)
lib/               # Auth config, Prisma client, helpers
prisma/
  schema.prisma    # Database models
assets/styles/     # Global and component SCSS
public/            # Static assets (images, sounds)
```

## Development notes

- **LAN / device testing:** `next.config.ts` sets `allowedDevOrigins` for local network IPs; adjust if your subnet differs.
- **Admin access:** Users with `u_type === "Admin"` see the **MS Core** link in the main navbar.
- This repo’s Prisma schema targets an existing-style MySQL schema (`user`, `mobile_suits`, `user_has_mobile_suits`, etc.). Align `DATABASE_URL` and migrations with your actual database.

## Learn more

- [Next.js documentation](https://nextjs.org/docs)
- [Prisma documentation](https://www.prisma.io/docs)
- [NextAuth.js documentation](https://next-auth.js.org)

## License

This project is private unless you add an explicit license file.
