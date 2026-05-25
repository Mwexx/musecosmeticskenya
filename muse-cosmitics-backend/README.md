# Muse Cosmetics Backend API (MongoDB)

Complete e-commerce backend for Muse Cosmetics using MongoDB.

## Vercel Deployment

This repository is prepared to run as a serverless app on Vercel. The frontend files are served statically from the repository root and the API is exposed through `api/[...path].js`.

### Required Vercel environment variables

Set these in the Vercel project settings:

- `NODE_ENV=production`
- `API_VERSION=v1`
- `MONGODB_URI=<your MongoDB Atlas connection string>`
- `JWT_SECRET=<strong random secret>`
- `JWT_EXPIRE=7d`
- `JWT_COOKIE_EXPIRE=7`
- `EMAIL_HOST=smtp.gmail.com`
- `EMAIL_PORT=587`
- `EMAIL_USER=<your email address>`
- `EMAIL_PASSWORD=<your app password>`
- `EMAIL_FROM=Muse Cosmetics <noreply@musecosmetics.co.ke>`
- `FRONTEND_URL=https://musecosmeticskenya.vercel.app`
- `MPESA_CONSUMER_KEY=<your key>`
- `MPESA_CONSUMER_SECRET=<your secret>`
- `MPESA_SHORTCODE=<your shortcode>`
- `MPESA_PASSKEY=<your passkey>`
- `MPESA_ENVIRONMENT=production`
- `MAX_FILE_SIZE=5242880`
- `UPLOAD_PATH=./uploads`
- `RATE_LIMIT_WINDOW=15`
- `RATE_LIMIT_MAX=100`

### Notes

- For production, use MongoDB Atlas rather than a local MongoDB instance.
- Product image uploads are handled in a serverless-safe way, but persistent media storage is still recommended for long-term production use.
- The API base path is `/api/v1`.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- MongoDB >= 6.0 (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd muse-cosmetics-backend