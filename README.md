# Kawa's Cafe - System Overview

Kawa's Cafe is a modernized ordering and Kitchen Display System (KDS) built on a lightweight, dependency-free frontend and a Cloudflare Workers + D1 SQLite backend.

## Architecture

- **Frontend**: Zero-build Preact + HTM via CDN (`app.js`, `index.html`, `index.css`).
- **Backend**: Cloudflare Workers running Hono (`kawa-backend/src/index.ts`).
- **Database**: Cloudflare D1 (SQLite) (`schema.sql`).

## Recent Refactoring & Features

We recently underwent a massive system overhaul to introduce robust authentication and account management without sacrificing the minimalist UI.

### 1. Unified Authentication Flow
- **Single Login Portal**: Customers and Staff now log in through the same unified modal interface.
- **Passwords over PINs**: The system was migrated from legacy `pin` codes to standard `password` fields across all user roles.
- **Seamless Routing**: Upon successful login, the system evaluates the user's role and instantly routes them to the correct dashboard:
  - Customers are routed to the `MENU` view.
  - Staff are routed to the `KDS` (Kitchen Display System).

### 2. Account Registration & Onboarding
- **Customer Registration**: New customers can seamlessly toggle the login modal to create a new account.
- **Zero-Balance Start**: Newly registered accounts start with a hard `$0.00` wallet balance.
- **Conflict Handling**: The backend automatically rejects registration attempts for usernames that already exist (409 Conflict).

### 3. Admin Account Management
- **Accounts Dashboard**: Staff have access to a dedicated `ACCOUNTS` management tab.
- **CRUD Operations**: Admins can view all registered profiles in real-time, create new staff or customer accounts, and irrevocably delete accounts from the system.
- **Custom Modals**: Destructive actions (like deleting an account) are protected by beautiful, custom-styled confirmation modals that match the neon-dark aesthetic of the Kawa UI, entirely replacing native browser `confirm()` dialogs.

## Local Development Setup

To run this project locally for testing:

1. **Start the Backend**:
   ```bash
   cd kawa-backend
   npm run dev
   ```
   *Note: Ensure you have initialized the local D1 database first using `npx wrangler d1 execute DB --local --file=./schema.sql`.*

2. **Start the Frontend**:
   Serve the root directory with a local HTTP server:
   ```bash
   python -m http.server 8080
   ```
   *Note: Open `http://localhost:8080` in your browser. Ensure `API_BASE` in `app.js` points to your local worker (`http://localhost:8787/api`).*

## Default Credentials
- **Admin**: `admin` / `1234`
- **Customer**: Create a new account via the UI, or login with legacy test accounts if seeded.
