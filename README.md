# 🛒 - ShopSphere

<strong>A Full Stack E-Commerce Platform</strong>

# Project Overview

A modern, scalable, and fully functional e-commerce application built with a monorepo architecture. The project includes a customer-facing storefront, REST API backend, and an administrative dashboard for complete business management.

## 🚀 Tech Stack

### Frontend

- React.js
- Vite
- TypeScript
- Redux Toolkit
- Tailwind CSS
- React Router

### Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- Zod Validation
- JWT Authentication

### Dashboard

- React.js
- Vite
- TypeScript
- Redux Toolkit
- Tailwind CSS

### Third-Party Services

- Cloudinary (Image Storage & Management)
- Email Service (Welcome Email Automation)

---

# 📁 Monorepo Structure

```bash
ecommerce-project/
│
├── backend/        # Express API Server
├── frontend/       # Customer Storefront
├── dashboard/      # Admin Dashboard
└── README.md
```

---

# ✨ Features

## 👤 Authentication & User Management

- User Registration
- User Login & Logout
- JWT-Based Authentication
- Protected Routes
- User Profile Management
- Secure Password Handling
- Automated Welcome Email for New Users

---

## 🛍️ Product Management

### Customer Side

- Browse Products
- Product Details Page
- Product Search
- Product Filtering
- Category-Based Filtering
- Price Filtering
- Responsive Product Grid

### Admin Side

- Create Product
- Update Product
- Delete Product
- Product Inventory Management
- Product Image Upload via Cloudinary

---

## 🛒 Shopping Cart

- Add to Cart
- Update Cart Quantity
- Remove Items from Cart
- Cart Price Calculation
- Persistent Cart State

---

## 📦 Order Management

### Customer Features

- Place Orders
- View Order History
- Track Order Status
- Order Details Page

### Admin Features

- View All Orders
- Update Order Status
- Add Custom Status Messages
- Manage Customer Orders

### Order Workflow

```text
Pending
   ↓
Confirmed
   ↓
Processing
   ↓
Shipped
   ↓
Delivered
```

> Note: Welcome emails are currently implemented. Order status email notifications are planned for future releases.

---

## 📊 Admin Dashboard

### Overview

- Total Users
- Total Products
- Total Orders
- Revenue Summary

### Analytics

- Sales Analysis
- Order Statistics
- Product Performance Insights
- Customer Activity Monitoring

### Management

- User Management
- Product Management
- Order Management
- Inventory Management

### CRUD Operations

- Create
- Read
- Update
- Delete

for:

- Products
- Categories
- Orders
- Users

---

## 🔍 Search & Filtering

- Real-Time Product Search
- Category Filtering
- Price Range Filtering
- Combined Search & Filter Support

---

## ☁️ Cloudinary Integration

- Secure Image Upload
- Optimized Image Delivery
- Product Image Management
- Image Storage in Cloud

---

## ✅ Validation & Security

- Zod Schema Validation
- Input Sanitization
- JWT Authentication
- Protected API Routes
- Error Handling Middleware
- Type-Safe Development with TypeScript

---

## 📱 Responsive Design

- Mobile Friendly
- Tablet Responsive
- Desktop Optimized
- Modern UI/UX

---

# 🏗️ Installation

## Clone Repository

```bash
git clone https://github.com/UhaiMong/ShopSphere.git
cd ecommerce-project
```

## Install Dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

### Dashboard

```bash
cd dashboard
npm install
```

---

# ⚙️ Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

---

# 🚀 Running the Project

### Backend

```bash
npm run dev
```

### Frontend

```bash
npm run dev
```

### Dashboard

```bash
npm run dev
```

---

# 🔮 Future Improvements

- Order Status Email Notifications
- Payment Gateway Integration
- Product Reviews & Ratings
- Wishlist Functionality
- Coupon & Discount System
- Multi-Vendor Support
- Advanced Analytics Dashboard
- Real-Time Notifications

---

# 📈 Project Highlights

✅ Monorepo Architecture

✅ Full Product Lifecycle Management

✅ Complete Order-to-Delivery Workflow

✅ Admin Dashboard with Analytics

✅ Cloudinary Image Management

✅ Secure Authentication

✅ Search & Filtering System

✅ Welcome Email Automation

✅ Type-Safe Full Stack Development

---

# 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Built with ❤️ using React, Node.js, Express, TypeScript, MongoDB, Redux Toolkit, Tailwind CSS, Cloudinary, and Zod.
