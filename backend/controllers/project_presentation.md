# Boisar Tourism Platform — Project Presentation Guide

---

## 1. Project Overview

**Boisar Tourism** is a full-stack AI-assisted tourism web platform built specifically for **Boisar, Palghar District, Maharashtra**. The platform promotes local tourism by helping visitors discover destinations, plan personalized multi-day trips, and manage their travel itineraries — all in one place.

> **Core idea:** A traveller visits the site, registers, plans a trip using the AI Trip Planner, and gets a day-by-day schedule of locations to visit — automatically organized by Morning, Afternoon, and Evening slots.

---

## 2. Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| **HTML5 + CSS3** | Page structure and styling |
| **Vanilla JavaScript** | All interactivity, API calls, localStorage |
| **Google Fonts** (Playfair Display, DM Sans) | Typography |
| **Font Awesome 6** | Icons throughout the UI |
| **Python HTTP Server** | Serves static files locally on port 8000 |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express.js** | REST API framework |
| **MongoDB** | NoSQL database for users and trips |
| **Mongoose** | MongoDB object modelling (ODM) |
| **JWT (JSON Web Tokens)** | Secure user authentication |
| **bcryptjs** | Password hashing |

### Architecture Pattern
```
Browser (HTML/CSS/JS)
        ↕  HTTP REST API
Express.js Server (Port 5000)
        ↕  Mongoose ODM
MongoDB Database (Port 27017)
```

---

## 3. Project Structure

```
jharkhand-tourism/
├── index.html              ← Home page
├── login.html              ← Login page
├── register.html           ← Registration page
├── dashboard.html          ← User dashboard (protected)
├── profile.html            ← User profile (protected)
├── all-locations.html      ← Browse all 27 destinations
├── accommodations.html     ← Hotels & resorts
├── verified-guides.html    ← Local tour guides
├── features/
│   └── trip-planner.html   ← AI Trip Planner (3-step wizard)
├── backend/
│   ├── server.js           ← Express server entry point
│   ├── models/
│   │   ├── User.js         ← User schema (MongoDB)
│   │   └── Trip.js         ← Trip schema (MongoDB)
│   ├── controllers/
│   │   ├── userController.js  ← Auth, profile, stats logic
│   │   └── tripController.js  ← Trip CRUD + itinerary logic
│   ├── routes/
│   │   ├── users.js        ← /api/users/* endpoints
│   │   └── trips.js        ← /api/trips/* endpoints
│   └── middleware/
│       ├── auth.js         ← JWT verification middleware
│       └── errorHandler.js ← Global error handler
├── data/
│   └── destinations.json   ← 27 Boisar locations database
└── js/
    └── dashboard.js        ← Dashboard helper scripts
```

---

## 4. Key Features (Explain Each)

### 🔐 Feature 1 — User Authentication
- Users **register** with name, email, password, and travel interests
- Passwords are **hashed** using bcryptjs before storing in MongoDB
- On login, server returns a **JWT token** stored in `localStorage`
- Every API request sends `Authorization: Bearer <token>` header
- Protected pages (Dashboard, Profile) redirect to login if no token

### 🗺️ Feature 2 — Explore Destinations
- 27 real locations around Boisar loaded from `destinations.json`
- Filter by **category**: Beach, Fort, Waterfall, Wildlife, Cultural, etc.
- Each card shows: name, category, rating, entry fee, best time to visit

### 🧠 Feature 3 — AI Trip Planner (The Core Feature)
A **3-step wizard** that generates a personalized itinerary:

**Step 1 — Trip Details:**  Duration (1–7 days), Travel Date, Group Size, Budget, Travel Pace (Relaxed / Moderate / Active)

**Step 2 — Interests:**  Select from Beaches, Trekking, Historical Forts, Waterfalls, Eco-Tourism, Wildlife, Cultural Heritage, etc.

**Step 3 — Review & Generate:**
- Filters 27 locations by selected interests
- Further filters by preferred region (Beach, Hills, Cultural, Nature)
- Assigns locations to days based on pace (2/3/4 locations per day)
- Assigns each location a **Morning (09:00) / Afternoon (13:00) / Evening (17:00)** time slot
- Saves to **MongoDB** (if logged in) AND to **user-scoped localStorage**

### 📊 Feature 4 — Personal Dashboard
After planning, the dashboard shows:
- **Stats bar:** Total Trips | Upcoming | Completed | Days Planned
- **Upcoming Trips:** Trips with future start dates
- **Recent Trips:** Trips whose dates have already passed
- **Click any trip → Modal opens** showing full Day-by-Day itinerary with location details (name, category, area, rating, entry fee, best visit time)

### 👤 Feature 5 — Profile Management
- Update personal info (name, email, phone, city, state)
- Update travel preferences (interests, budget, accommodation type)
- Toggle notification settings
- Change password securely
- Stats section shows upcoming/recent trip counts and total days planned

### 🔒 Feature 6 — User-Specific Data
- Every trip saved to `userTrips_<userId>` in localStorage
- User A can never see User B's trips
- Backend MongoDB trips are linked to `user: ObjectId` — completely isolated per user

---

## 5. Database Models

### User Model (MongoDB)
```
name, email, password (hashed), phone, avatar,
address { city, state },
preferences { interests[], budget, accommodation },
notifications { emailNotifications, bookingUpdates, ... },
role (user/admin), isActive, createdAt
```

### Trip Model (MongoDB)
```
user (→ User ObjectId),
title, description, status (planned/booked/ongoing/completed/cancelled),
duration { days, startDate, endDate },
groupSize { adults, children, infants },
budget, interests[], accommodation,
itinerary [{ day, date, activities [{ time, timeLabel, location, category, area, rating, entryFee, bestTime }] }],
createdAt
```

---

## 6. REST API Endpoints

### Auth Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Login, returns JWT |
| GET | `/api/users/me` | Get logged-in user profile |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/update-password` | Change password |
| GET | `/api/users/stats` | Get user trip stats |

### Trip Endpoints
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/trips` | Create/save a trip |
| GET | `/api/trips` | Get all trips for this user |
| GET | `/api/trips/:id` | Get one trip by ID |
| PUT | `/api/trips/:id` | Update a trip |
| DELETE | `/api/trips/:id` | Delete a trip |

---

## 7. Live Demo Flow (Show to Sir)

Follow this exact flow during the demo:

```
1. Open http://localhost:8000
   → Show home page: hero slider, Explore Destinations section,
     Festival Calendar (April/May 2026 events), Quick Links

2. Click "All Locations" in nav
   → Show 27 destination cards with filters working

3. Click "Plan Trip" in nav → features/trip-planner.html
   → Step 1: Set 2 days, pick a date 1 week from now, Solo, Budget = Low
   → Step 2: Select "Beaches" + "Trekking"
   → Step 3: Click Generate Itinerary → Show the day-wise plan
   → Click Save Plan → redirected to dashboard

4. Dashboard appears
   → Show stats: 1 Total Trip, 1 Upcoming
   → Show trip card in Upcoming Trips section
   → Click the trip → Modal opens with Day 1 + Day 2 locations
     (Morning: Kelva Beach, Afternoon: Kaldurg Fort, etc.)

5. Click Profile in nav
   → Show personal info form
   → Show stats: Upcoming, Recent, Days Planned (no double values)
   → Update a field and save → shows success toast

6. Logout → confirm redirected to home (not dashboard)
   → Login with same credentials → trips still there
```

---

## 8. Security & Best Practices

- ✅ Passwords **never stored in plain text** (bcryptjs hashing)
- ✅ JWT tokens expire and are verified server-side on every request
- ✅ Mongoose **sanitizes inputs** to prevent NoSQL injection
- ✅ `allowedUpdates` whitelist prevents mass-assignment attacks on profile update
- ✅ CORS configured on backend to control allowed origins
- ✅ Trip data is **user-scoped** both in MongoDB (`user` field) and localStorage (`userTrips_<id>`)

---

## 9. Challenges & How They Were Solved

| Challenge | Solution |
|---|---|
| Trips showing for all users (shared localStorage) | Namespaced keys: `userTrips_<userId>` |
| Profile stats showing double values | Fixed dedup logic — `lastTripPlan_` already in `userTrips_` |
| Profile save giving "Not Found" error | Fixed Mongoose CastError — use `req.user._id` (ObjectId) not string |
| Itinerary not appearing in dashboard modal | Generated itinerary data was only rendered as HTML, not saved. Fixed: stored structured data in `lastGeneratedItinerary` array and included it in the trip payload |
| MongoDB buffering timeout on login | MongoDB service was stopped. Fixed by starting the service |
| Group size sent as string `"solo"` | Added map: solo→1, couple→2, small→4, medium→8, large→15 |

---

## 10. What Makes This Project Stand Out

1. **Real location data** — 27 actual destinations in Boisar/Palghar with genuine details
2. **Smart itinerary algorithm** — filters by interest + region + pace, distributes across days
3. **Dual storage** — works even offline (localStorage) and syncs when backend is up
4. **Premium UI** — glassmorphism, gradient banners, animated counters, smooth modals
5. **Complete auth system** — registration, login, JWT, profile management, password change
6. **User data isolation** — multi-user ready even on the same browser

---

*Built with Node.js · Express · MongoDB · Vanilla JS · HTML/CSS*
