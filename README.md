
# SneakerDrop — Premium Sneaker E-Commerce Showcase

A modern, responsive sneaker e-commerce showcase built with React, TypeScript, Vite and Supabase. SneakerDrop features a dynamic product catalog, a protected admin dashboard and a product waitlist for exclusive sneaker releases.

**Live Demo:** https://sneakerdrop-smoky.vercel.app  
**Admin Dashboard:** https://sneakerdrop-smoky.vercel.app/admin

---

## Features

### Public Website
- Premium, responsive design for desktop, tablet and mobile.
- Dynamic sneaker catalog loaded from Supabase.
- Product details including name, image, price, description and availability.
- Waitlist registration for individual sneakers.
- Email validation and duplicate registration prevention.
- Interactive navigation and product registration modal.

### Admin Dashboard
- Secure authentication using Supabase Auth.
- Admin access controlled through database permissions.
- Create, edit and delete sneaker products.
- Update product availability.
- View waitlist registrations.
- Changes are stored in the database and reflected on the public website.

### Security
- Supabase Row Level Security (RLS) policies.
- Public users can read products and submit waitlist registrations.
- Only authorized administrators can manage products and view waitlist entries.
- No service-role key or database write credentials exposed in the frontend.
- Environment variables used for project configuration.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React | User interface |
| TypeScript | Type-safe development |
| Vite | Development server and build tool |
| Supabase | PostgreSQL database and authentication |
| Lucide React | Icons |
| CSS | Styling and responsive layouts |
| Vercel | Deployment and hosting |
| GitHub | Version control and source code |

---

## Project Structure

```text
sneakerdrop/
├── public/
├── src/
│   ├── lib/
│   │   └── supabase.ts
│   ├── App.tsx
│   ├── App.css
│   ├── Admin.tsx
│   ├── Admin.css
│   └── main.tsx
├── .env.local
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

---

## Database Schema

SneakerDrop uses Supabase PostgreSQL.

### Products

Stores all sneaker products displayed on the public website.

| Column | Type | Description |
|
