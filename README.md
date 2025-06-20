# Quickie
**Quickie** is a simple Point of Sales (POS) web application built with modern technologies. It allows internal users (such as cashiers and admins) to manage products, categorize items, simulate payments via Xendit, and receive real-time updates via webhooks. Designed as a personal experiment and portfolio project, Quickie focuses on providing an end-to-end payment simulation flow that aligns with real-world standards.

## ✨ Features
- 🛍️ Product & Category Management
- 💳 Payment simulation with **Xendit**
- 📱 Dynamic QR code generation for each order
- 🔄 Automatic order status update via **Xendit Webhook**
- 🔐 Authenticated roles using **Clerk**
- 📊 Dashboard for managing and monitoring orders

## 🧰 Tech Stack
| Layer            | Technology                                                                     |
|------------------|--------------------------------------------------------------------------------|
| Frontend         | [Next.js](https://nextjs.org/) + [TypeScript](https://www.typescriptlang.org/) |
| State Management | [Zustand](https://zustand.docs.pmnd.rs/)                                       |
| API              | [tRPC](https://trpc.io/)                                                       |
| Auth             | [Clerk](https://clerk.dev/)                                                    |
| Database         | [PostgreSQL via Supabase](https://supabase.com/)                               |
| ORM              | [Prisma](https://www.prisma.io/)                                               |
| Payment          | [Xendit API](https://xendit.co/)                                               |


## 🚀 Getting Started
### 📦 Installation
Clone the repository
```bash
git clone https://github.com/ablahum/quickie.git
cd quickie
```

### ⚙️ Install dependencies
```
npm install
```

### 🔑 Environment Setup
Make sure you have the following credentials ready and added to your .env file:
```
DATABASE_URL=your_supabase_postgresql_url
DIRECT_URL=your_supabase_postgresql_direct_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_frontend_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_ROLE_KEY=your_supabase_role_key
XENDIT_MONEY_IN_KEY=your_xendit_money_in_key
XENDIT_WEBHOOK_TOKEN=your_xendit_webhook_token
```

Don't forget to set up your database schema via Prisma:
```
npx prisma generate
npx prisma migrate dev
```

### ▶️ Running the App
```
npm run dev
```
The app will be available at http://localhost:3000.

## 📸 Screenshots
<details>
  <summary>A glimpse of screenshots of the apps</summary>

  ### Dashboard page
  ![dashboard](https://github.com/ablahum/quickie/blob/main/public/dashboard.png)
  ### Category management page
  ![product](https://github.com/ablahum/quickie/blob/main/public/category.png)
  ### Product management page
  ![category](https://github.com/ablahum/quickie/blob/main/public/product.png)
  ### Sales (Order management) page
  ![sales](https://github.com/ablahum/quickie/blob/main/public/sales.png)
  ### Cart sidebar, QR Code, and Payment Status modal
  ![cart](https://github.com/ablahum/quickie/blob/main/public/cart.png)
  ![qr-code](https://github.com/ablahum/quickie/blob/main/public/qr.png)
  ![payment-status](https://github.com/ablahum/quickie/blob/main/public/status.png)
</details>

## 🔒 Access & Contribution
- This project is not open for public contribution at this time.
- Built as a personal experiment with a realistic payment simulation flow using Xendit.

## 📬 Contact
For questions, suggestions, or collaboration inquiries:
- Email: ablahum@proton.me
- Website: https://tama-dev.vercel.app
