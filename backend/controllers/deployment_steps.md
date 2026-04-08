# 🚀 Boisar Tourism — Deployment Guide

## What You Have

| Layer | Tech |
|---|---|
| **Frontend** | HTML, CSS, JS (static files) |
| **Backend** | Node.js + Express (`backend/server.js`) |
| **Database** | MongoDB |
| **Config** | `vercel.json` already set up for Vercel |

---

## ✅ Step 1 — Fix `vercel.json` Name (Quick)

The `vercel.json` still has `"name": "jharkhand-tourism"`. Update it to `boisar-tourism` before deploying.

---

## ✅ Step 2 — Set Up MongoDB Atlas (Free Database)

1. Go to **[mongodb.com/atlas](https://www.mongodb.com/atlas)** → Create free account
2. Create a **free M0 cluster**
3. Under **Database Access** → Add a user (e.g., `boisar_admin`) with a strong password
4. Under **Network Access** → Add IP `0.0.0.0/0` (allow all — needed for Vercel)
5. Click **Connect** → **Drivers** → Copy your connection string:
   ```
   mongodb+srv://boisar_admin:<password>@cluster0.xxxxx.mongodb.net/boisar_tourism
   ```
   Replace `<password>` with your actual password.

---

## ✅ Step 3 — Push to GitHub

1. Go to **[github.com](https://github.com)** → Create a **new repository** called `boisar-tourism`
2. On your computer, open **Git Bash** or **PowerShell** inside the project folder:

```bash
# Navigate to project folder
cd "d:\Users\Documents\Boisar Tourism Copy\jharkhand-ai-tourism-main\jharkhand-tourism"

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Boisar Tourism Platform"

# Link to your GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/boisar-tourism.git

# Push
git push -u origin main
```

> ⚠️ **Important:** Before pushing, check if `backend/config.env` has real secrets. If yes, add it to `.gitignore` first (see below).

### Create `.gitignore` (if not exists):
```
backend/node_modules/
backend/config.env
backend/backend.log
backend/backend.pid
*.env
```

---

## ✅ Step 4 — Deploy on Vercel

1. Go to **[vercel.com](https://vercel.com)** → Sign in with GitHub
2. Click **"Add New Project"**
3. Import your `boisar-tourism` GitHub repository
4. Set **Root Directory** to `./` (leave as default)
5. Click **Deploy** (Vercel auto-detects `vercel.json`)

---

## ✅ Step 5 — Add Environment Variables in Vercel

After deploying, go to your project on Vercel → **Settings → Environment Variables** and add:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Any long random string (e.g., `boisar_tourism_secret_2024_xyz`) |
| `NODE_ENV` | `production` |

**Optional** (only if you want email/payments to work):

| Variable | Value |
|---|---|
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_USER` | Your Gmail address |
| `EMAIL_PASS` | Your Gmail App Password |
| `ADMIN_EMAIL` | `admin@boisartourism.com` |
| `ADMIN_PASSWORD` | Your admin password |

---

## ✅ Step 6 — Redeploy

After adding environment variables:
1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on the latest deployment

---

## ✅ Step 7 — Test Live Site

Visit `https://boisar-tourism.vercel.app` and test:
- [ ] Homepage loads with photo carousel
- [ ] Login / Register works
- [ ] Demo Google & Demo Facebook login works
- [ ] Map section shows Boisar destinations
- [ ] Contact form submits

---

## 🔑 Optional — Google Maps

If you want the interactive map to load:
1. Get an API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Maps JavaScript API**
3. In `index.html`, find:
   ```html
   key=YOUR_GOOGLE_MAPS_API_KEY
   ```
   Replace with your actual key, commit, and push to GitHub (Vercel auto-redeploys).

---

## 🌐 Custom Domain (Optional)

In Vercel → Settings → Domains → Add `boisartourism.com` (if you own it).

---

## Summary of Steps

```
MongoDB Atlas  →  GitHub Push  →  Vercel Import  →  Add Env Vars  →  Live! 🎉
```
