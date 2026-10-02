# 🧪 LabRadar — Mini Lab Aggregator

A responsive full-stack diagnostic test aggregator built for the engineering evaluation assignment. It enables users to search for single tests or packages across multiple pincodes and ranks the results by the **True Lowest Price** (`offer_price + home_collection_fee`).

---

## Live Demo

- **Frontend App**: https://lab-aggregator-phi.vercel.app/
- **Backend API**: https://lab-aggregator.onrender.com/api/search?search_query=Lipid&pincode=110001

---

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide React
- **Backend**: Node.js, Express.js, CORS
- **Dataset**: In-memory mock database supporting single tests, health packages, and pincode availability arrays

---

## Local Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Clone the repository
```bash
git clone [https://github.com/](https://github.com/saheli1411/lab-aggregator.git)
cd lab-aggregator

Step 4: The Thinking Question
In the real world, big companies will try to block our servers from scraping their prices.
If you had to build a scraper to get live prices from a competitor's website without
getting blocked, how would you architect it? (Briefly explain in 4-5 sentences)
To scrape competitor prices without getting blocked, I would route requests through rotating residential/mobile proxies to mimic organic user traffic. Instead of fragile DOM scraping, I would reverse-engineer their private mobile app or web APIs to extract clean JSON payloads directly. For WAFs like Cloudflare or DataDome, stealth headless browsers (Playwright with fingerprint-spoofing plugins) would emulate genuine browser signatures, TLS ciphers, and human behavior. Ingestion would be queued via Redis with adaptive rate-limiting, randomized jitter, and exponential backoff, supported by automated CAPTCHA-solving fallbacks.

Features Implemented
Pincode Filter: Returns only providers servicing the user's specific postal code.

Deep Package Match: Matches search queries across both individual test names and nested package contents (included_tests).

True Price Sorting: Ranks results by true out-of-pocket cost (offer_price + home_collection_fee).

Lab Booking: Sends a POST request to /api/select-lab to generate instant booking confirmations.