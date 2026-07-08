# Kawa Cafe: E-Commerce & Loyalty Web App

This project is a streamlined, fictional e-commerce and loyalty web application for a neighborhood cafe. It serves as a comprehensive portfolio piece demonstrating full-stack CRUD operations and real-time state management using a lightweight, Vanilla web stack.

## 1. Core Concept
The project focuses on a grounded, everyday customer experience: browsing a menu, managing a digital wallet, and placing food/drink orders. 

## 2. Tech Stack
This project is built from the ground up to be extremely lightweight, requiring no `npm install` or heavy node_modules.

*   **Front-End**: Vanilla HTML, CSS, and JavaScript.
*   **Styling**: Tailwind CSS (via CDN) for rapid UI development.
*   **Back-End**: Hono web framework running on Cloudflare Workers, with a SQLite database.

## 3. Front-End (Customer & Admin UI)

### Customer Storefront
*   **Digital Menu (Catalog)**: A clean, grid-based menu where customers can browse categories (Coffee, Pastries, Mains) and add items to a cart.
*   **Digital Wallet (Loyalty/Payments)**: A simulated prepaid balance system replacing standard credit card gateways. Users "add funds" using a mock checkout and view their spending via a transaction ledger.
*   **Order Checkout**: A simple checkout flow that deducts from the user's digital wallet and pushes the order to the database.

### Admin Back-Office
*   **Order Management (KDS)**: A Kitchen Display System where admins view incoming orders in real-time. Admins can update order statuses (Pending -> Preparing -> Completed).
*   **Inventory Control**: A dashboard for cafe managers to perform CRUD operations on the menu. They can add new seasonal drinks, update prices, or toggle item availability.

## 4. Back-End (Database & API)

### API Framework
*   **Hono & Cloudflare Workers**: The backend uses Hono for routing and handles REST API requests, deployed to Cloudflare's edge network.

### Database Schema (Core Tables)
*   `profiles`: Stores user details and current `wallet_balance`.
*   `menu_items`: Stores `id`, `name`, `desc`, `price`, `category`, and a `customizable` flag.
*   `orders`: Tracks `id`, `user_id`, `total_amount`, `status` (pending/completed/cancelled), and `created_at`.
*   `order_items`: A join table linking `orders` to `menu_items` with specific quantities, `spice_level`, and `extra_toppings`.
*   `ledger`: A dual-entry system tracking wallet deductions and additions.
