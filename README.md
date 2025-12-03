# ⚡ ElectroMart Backend

## 🎯 Purpose

This is the backend of the ElectroMart e-commerce platform. It manages products, orders, payments, and stock updates. It also handles Stripe Checkout sessions. 💳🛒

## ✨ Features

- 📦 Product management (CRUD)
- 🛒 Order creation and management
- 💳 Stripe Checkout session handling
- 📉 Automatic stock update after successful payment
- 📊 Order status tracking (`PENDING`, `CONFIRMED`, etc.)
- 💰 Payment status tracking (`PENDING`, `PAID`)
- 🔗 REST API endpoints for frontend consumption

## 🛠 Tech Stack

- **Backend Framework:** Node.js with Express
- **Language:** TypeScript 📝
- **Database:** MongoDB with Mongoose
- **Payment:** Stripe Checkout
- **Authentication:** Clerk
