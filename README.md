# SparkTech E-Commerce Store

SparkTech is a full-stack, responsive e-commerce platform specializing in electronic components and DIY parts. It features a robust dual-path authentication system (Bearer tokens + cookies), OAuth integrations (Google & GitHub), real-time cart and wishlist management, an admin dashboard, order processing, and payment gateway integration.

## 🚀 Features

### **Frontend**
*   **Modern UI/UX**: Built with React, featuring smooth animations using Framer Motion and responsive layouts.
*   **State Management**: Zustand for global state (auth, theme) and TanStack React Query for server state caching and data fetching.
*   **Authentication**: Hybrid Bearer token and HTTP-only cookie authentication, supporting seamless cross-domain OAuth (Google, GitHub) even on mobile browsers that block third-party cookies.
*   **Shopping Experience**: Real-time cart management, wishlist functionality, and a seamless checkout process.
*   **User Dashboard**: Profile management, order history, and notifications.
*   **Admin Panel**: Comprehensive dashboard to manage products, orders, categories, customers, and system settings. Data export to PDF/Excel.

### **Backend**
*   **RESTful API**: Node.js and Express.js architecture following best practices.
*   **Database**: MongoDB with Mongoose ODM for structured data modeling.
*   **Caching & Rate Limiting**: Redis (Upstash/ioredis) integration for high-performance caching and API rate limiting to prevent abuse.
*   **Security**: Helmet for HTTP headers, CORS configuration, JWT-based authentication, and Passport.js for social logins.
*   **Payments**: Razorpay integration for secure payment processing.
*   **Media Management**: Cloudinary integration for scalable product and user image hosting.
*   **Notifications**: MSG91 integration for SMS notifications (Order Confirmation, Shipping, Delivery).
*   **Monitoring**: Sentry error tracking and Winston logging.

---

## 🛠️ Technology Stack

### **Frontend**
*   React 19 (Bootstrapped with Create React App)
*   Zustand (Global State Management)
*   TanStack React Query v5 (Data Fetching)
*   React Router DOM v7
*   React Hook Form + Zod (Form Validation)
*   Framer Motion (Animations)
*   Lucide React (Icons)
*   Axios (HTTP Client)

### **Backend**
*   Node.js / Express.js
*   MongoDB / Mongoose
*   Redis / ioredis
*   Passport.js (Google & GitHub OAuth 2.0)
*   JSON Web Tokens (JWT)
*   Cloudinary
*   Razorpay

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)
*   [Redis](https://redis.io/) (Local instance or Upstash Redis URL)

---

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Sparktech-commerce-store.git
   cd Sparktech-commerce-store-main
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```
> Note: If `npm install` fails on Windows, it's usually the `node-gyp` dependency for bcrypt. 
> Make sure you have the visual studio build tools installed! (Spent 3 hours debugging this myself).

   Create a `.env` file in the `backend` directory based on the configuration list below, then start the development server:
   ```bash
   npm run dev
   ```

3. **Frontend Setup**
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```
   Start the React development server:
   ```bash
   npm start
   ```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
Create a `.env` file in the `backend` directory with the following variables:

```env
# Application Settings
PORT=5000
NODE_ENV=development
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
ADMIN_SECRET=your_admin_secret_key

# Database & Caching
MONGO_URI=your_mongodb_connection_string
REDIS_URL=your_redis_url
UPSTASH_REDIS_REST_URL=your_upstash_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token

# Authentication (JWT & Session)
SESSION_SECRET=your_session_secret
JWT_ACCESS_SECRET=your_access_token_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES=7d

# OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# External Services
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

EMAIL_USER=your_smtp_email
EMAIL_PASS=your_smtp_password
EMAIL_FROM="SparkTech <your_smtp_email>"

MSG91_AUTH_KEY=your_msg91_auth_key
MSG91_SENDER_ID=your_sender_id
MSG91_ROUTE=4
MSG91_COUNTRY_CODE=91
MSG91_FLOW_ORDER_CONFIRM=flow_id
MSG91_FLOW_SHIPPED=flow_id
MSG91_FLOW_DELIVERED=flow_id
MSG91_FLOW_CANCELLED=flow_id

SENTRY_DSN=your_sentry_dsn
```

---

## 🌍 Deployment

This project is configured to run efficiently across separate platforms for the frontend and backend, overcoming cross-domain cookie restrictions.

### Backend (e.g., Render, Railway, Heroku)
1. Deploy the `backend` folder.
2. Set all the environment variables listed above in the hosting dashboard.
3. Crucially, set `BACKEND_URL` to your live API URL (e.g., `https://sparktech-api.onrender.com`).
4. Set `FRONTEND_URL` to your live client URL.

### Frontend (e.g., Vercel, Netlify)
1. Deploy the `frontend` folder.
2. The `frontend/vercel.json` file contains API proxy rewrites to route `/api/*` traffic through the Vercel domain. This treats the backend as a first-party service and solves mobile browser third-party cookie blocking.
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://<your-backend-domain>/api/:path*"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
   *Make sure to update the destination URL in `vercel.json` before deploying.*

### OAuth Provider Configuration
For social login to work in production, ensure your Authorized Redirect URIs in Google Cloud Console and GitHub Developer Settings precisely match your backend callback URLs:
*   **Google**: `https://<your-backend-domain>/api/v1/auth/google/callback`
*   **GitHub**: `https://<your-backend-domain>/api/v1/auth/github/callback`

*(Note: The backend dynamically detects the callback URL based on headers if `BACKEND_URL` is omitted, making it robust across different environments).*

---

## 🛡️ Authentication Architecture

The application uses a highly robust authentication flow designed to work across all devices, including mobile Safari/Chrome which aggressively block third-party cookies:

1. **Bearer Tokens (Primary)**: The frontend extracts `accessToken` and `refreshToken` upon login and stores them via Zustand + `localStorage`. An Axios interceptor attaches `Authorization: Bearer <token>` to all requests.
2. **HTTP-only Cookies (Fallback)**: The backend also sets cookies as a fallback mechanism.
3. **Cross-Domain OAuth**: During Google/GitHub authentication, the backend redirects the user back to the frontend with the generated tokens appended as URL query parameters. The frontend intercepts these, stores them in state, and clears the URL bar for a seamless user experience.
4. **Silent Refresh**: An Axios response interceptor catches `401 Unauthorized` errors and automatically attempts a silent token refresh using the stored refresh token before retrying the failed request.

---

## Known Issues & Roadmap
- [x] Basic Auth and JWT
- [x] Product browsing and cart
- [ ] Implement Redis caching for product lists (DB is getting hammered)
- [ ] Fix the mobile layout on the cart page (table squishes too much)
- [ ] Add unit tests... eventually 😅
