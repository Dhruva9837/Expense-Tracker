# RideBuddy 🛵📱

RideBuddy is a digital mobility platform that matches **2-wheeler drivers** with empty pillion seats to **riders** traveling in the same direction. Designed specifically for university communities, it optimizes transportation efficiency and reduces travel costs.

## 1. Core Concept

RideBuddy operates on a specialized campus marketplace model:

| Role | Intent |
| :--- | :--- |
| **Driver** | Posts a 2-wheeler route to share operational costs |
| **Rider** | Browses available rides or posts a request for transport |
| **Platform** | Matches supply and demand using landmark-based routing |

## 2. 2-Wheeler Campus Sharing

RideBuddy is an agile, eco-friendly solution for university users:
- **Verified Users:** Trusted campus-only ecosystem.
- **Micro-Mobility:** 2-wheeler focus (Bikes/Scooters) for university hubs.
- **Sustainable:** Significant carbon-footprint reduction per trip.

## 3. Core System Architecture

- **Frontend:** Next.js 15 (App Router)
- **Backend:** Supabase (Auth, DB, Functions)
- **Icons:** Lucide React

## 4. Key Features
- **Driver Dashboard**: Post routes, set 2-wheeler type, manage seats.
- **Rider Dashboard**: Search rides, post ride requests.
- **Profile verification**: Vehicle details & clearance tracking.
- **Campus Landmarks**: Integrated landmarks for fast search.

## 5. Matching Algorithm (Simplified Logic)

1. User posts a ride request.
2. System checks for matches based on:
   - Same route (pickup to destination)
   - Time proximity
   - Available seats
3. Matching algorithm returns the best drivers.
4. Passenger confirms booking.

## 6. Data Model Example

Key entities:
- **`Users`**: `id`, `name`, `email`, `university_id`, `rating`
- **`Rides`**: `id`, `driver_id`, `pickup_location`, `destination`, `departure_time`, `available_seats`, `price`
- **`Bookings`**: `id`, `ride_id`, `passenger_id`, `status`

## 7. Strategic Impact
Ride-sharing systems transform transportation into a platform marketplace, aligning supply and demand through routing intelligence and trust mechanisms. Benefits include:
- **Cost sharing**: Reduced travel expenses
- **Sustainability**: Lower carbon footprint and optimized vehicle utilization
- **Community**: Fostered trusted travel network

---

## Technical Setup (Next.js)

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
