# 🏡 	Walestate  Pro — SaaS Property Management Platform

A modern, full-stack SaaS 	Walestate management system built with the MERN stack and Next.js.  
Designed for managing property listings, users, and administrative workflows in a scalable and efficient way.

---

## 🚀 Live Demo
https://your-live-demo.com

---

## 📸 Preview

- Home Page
- Property Listings with Filters
- Admin Dashboard Analytics
- Property Details Page

---

## ✨ Features

### 👤 Authentication & Users
- JWT-based authentication
- Role-based access control (Admin, Agent, User)
- Secure password hashing (bcrypt)
- Protected routes

### 🏘️ Property Management
- Create, update, delete properties
- Upload multiple images (Cloudinary)
- Property categories (rent / sale / residential / commercial)
- Advanced filtering & search system

### 📊 Admin Dashboard
- Analytics dashboard using Recharts
- Manage users and listings
- Platform activity overview

### 🔎 Search & Discovery
- Search properties by location, price, type
- Filter & sort functionality
- Responsive grid layout
- Pagination support

### ☁️ Media Handling
- Image uploads via Cloudinary
- Multer-based file handling

### 📧 Communication
- Email notifications via Nodemailer
- Inquiry/contact system

### ⚡ Performance
- Next.js App Router (SSR/CSR hybrid)
- React Query for API caching
- Zustand for UI state management
- Framer Motion animations
- Mobile-first responsive design


---

## 🚀 Tech Stack

### Frontend (`/client`)
- **Framework:** Next.js 16 (React 19)
- **Styling:** Tailwind CSS, Framer Motion, Swiper
- **State Management:** Zustand, TanStack React Query
- **Form Handling & Validation:** React Hook Form, Zod
- **Icons:** Lucide React, React Icons
- **Data Visualization:** Recharts
- **HTTP Client:** Axios

### Backend (`/server`)
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js 5
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT (JSON Web Tokens), bcryptjs
- **File Uploads:** Multer, Cloudinary
- **Security:** Helmet, Express Rate Limit, CORS
- **Email:** Nodemailer

## 📁 Project Structure

```text
Real-State/
├── client/          # Next.js frontend application
│   ├── src/         # Source code (app router, components, services, etc.)
│   ├── public/      # Static assets
│   └── package.json # Frontend dependencies and scripts
└── server/          # Node.js/Express backend application
    ├── config/      # Configuration files (e.g., Cloudinary, DB)
    ├── middleware/  # Express middlewares (e.g., Auth)
    ├── models/      # Mongoose schemas
    ├── routes/      # API routes
    ├── controllers/ # Route handlers
    ├── seed/        # Database seeding scripts
    └── package.json # Backend dependencies and scripts
```

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [Cloudinary](https://cloudinary.com/) Account (for image uploads)

### ⚙️ Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Real-State
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

### Environment Variables

**Backend (`server/.env`)**
Create a `.env` file in the `server` directory and configure the following variables:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**Frontend (`client/.env.local`)**
Create an `.env.local` file in the `client` directory and configure your frontend environment variables:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
*(Adjust the API URL based on your server configuration).*

### Running the Application

**Run the Backend Development Server:**
```bash
cd server
npm run dev
```

**Run the Frontend Development Server:**
```bash
cd client
npm run dev
```

The frontend will be available at `http://localhost:3000` and the backend at `http://localhost:5000`.

---

### 🌐 API Endpoints

Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

Properties
- GET /api/properties
- POST /api/properties
- PUT /api/properties/:id
- DELETE /api/properties/:id

Users
- GET /api/users
- PUT /api/users/:id

---

### 🚀 Future Improvements

- Google Maps integration
- Real-time chat system
- Stripe payment integration
- Email automation system
- Mobile app (React Native)
- AI property recommendations

### 👨‍💻 Author

Built by a solo developer using MERN + Next.js
A production-style SaaS Walestate management platform.

### 📄 License

MIT License
