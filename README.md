# Restaurant Portal – React.js Project

A simple, functional Restaurant Portal built using React.js and JSON Server for the **L&T EduTech React JS Masterclass**.

## 🚀 Features

1. **Restaurant Listing**: Explore available restaurants with name, cuisine, rating, and description.
2. **Food Menu**: Browse food items by restaurant with live search by name and category filtering.
3. **Shopping Cart**: Real-time quantity adjustments, item removal, total amount calculation, and unavailable item safeguards.
4. **Order Placement**: Place orders with customer details (Name, Phone, Delivery note) and save to JSON Server with order confirmation.
5. **Order History & Tracking**: Track orders with status badges (`Placed`, `Preparing`, `Ready`, `Delivered`, `Cancelled`) and order cancellation.
6. **Admin Dashboard**: Full CRUD management for:
   - **Restaurants**: Add, edit, view, and delete restaurants.
   - **Food Items**: Add, edit, view, delete, and toggle live availability.
   - **Orders**: View all placed orders and update their statuses.

## 🛠️ Tech Stack
- **Frontend**: React.js 19, JavaScript (ES6+), HTML5, CSS3, Vite
- **Backend / Mock API**: JSON Server (`db.json`)
- **API Architecture**: Centralized REST services in `src/services/api.js`

## 📦 How to Run Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the JSON Server (Backend API on Port 3000)
```bash
npm run server
```

### 3. Start the Frontend (Vite Dev Server on Port 5173)
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🚀 Deployment Guide

### 1. Backend Deployment (Render)
1. Create a new **Web Service** on [Render](https://render.com) connected to this repository.
2. Set Build Command: `npm install`
3. Set Start Command: `npm start`
4. Deploy the service and copy your public URL (e.g. `https://your-app.onrender.com`).

### 2. Frontend Deployment (Vercel)
1. Import this repository in [Vercel](https://vercel.com).
2. Under **Project Settings > Environment Variables**, add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-app.onrender.com` (your actual Render backend URL without trailing slash)
   - Ensure you select **Production** and **Preview** environments.
3. **Redeploy** the latest deployment on Vercel (or trigger a new build) so that Vite injects `VITE_API_URL` during `npm run build`.

> **Note on Render Free Tier:**  
> Free Web Services on Render sleep after 15 minutes of inactivity. When visiting the site after an idle period, the first request may take 30–50 seconds while the backend wakes up. Use the "🔄 Retry Connection" button on the portal to reload once awake.

