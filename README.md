# Inventory Management System

A full-stack Inventory Management System built using React, Node.js, Express, and MongoDB.  
The system allows businesses to manage products, categories, stock levels, low-stock items, and stock movement history through a role-based web application.

---

## Features

### Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based access control
- Admin and Staff roles
- Admin-only category management
- Protected API routes

### Product Management
- Add new products
- View all products
- View individual product details
- Update product information
- Delete products
- Product SKU management
- Product price and stock tracking
- Category-based product organization

### Stock Management
- Update product stock
- Prevent negative stock values
- Configure reorder levels
- Automatic low-stock detection
- Reorder recommendations
- Track previous and updated stock quantities
- Record reasons for stock changes

### Category Management
- Create categories
- View categories
- Update categories
- Delete categories
- Category descriptions
- Admin-only category modifications

### Dashboard
- Total products
- Total stock units
- Inventory value
- Low-stock products
- Healthy stock count
- Inventory health overview
- Recent inventory activity

### History & Activity
- Stock movement history
- Track stock increases and decreases
- Record the user who performed a stock update
- Activity logs for inventory operations
- Date and time tracking

### Frontend Features
- Responsive React interface
- Dark and light themes
- Product search
- Product filtering
- Table sorting
- CSV inventory export
- Toast notifications
- Reorder center
- Inventory dashboard
- Stock history interface
- Activity log interface

### API Testing
- Complete Postman collection
- Authentication endpoints
- Product endpoints
- Category endpoints
- Stock management endpoints
- Reorder and statistics endpoints
- Stock movement endpoints

---

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- CSS
- Lucide React

### Backend
- Node.js
- Express.js
- JavaScript
- REST API

### Database
- MongoDB
- MongoDB Atlas
- Mongoose

### Authentication
- JSON Web Token (JWT)
- bcryptjs

### Development & Testing
- Visual Studio Code
- Git & GitHub
- Postman
- MongoDB Atlas

---

## System Architecture

```text
                ┌──────────────────────┐
                │      React UI        │
                │      Frontend        │
                └──────────┬───────────┘
                           │
                           │ REST API
                           ▼
                ┌──────────────────────┐
                │    Express Server    │
                │       Node.js        │
                └──────────┬───────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
      ┌───────────────┐        ┌────────────────┐
      │ Middleware    │        │  Controllers   │
      │ JWT / Roles   │        │ Business Logic │
      └───────────────┘        └───────┬────────┘
                                       │
                                       ▼
                              ┌────────────────┐
                              │    Mongoose    │
                              └───────┬────────┘
                                      │
                                      ▼
                              ┌────────────────┐
                              │ MongoDB Atlas  │
                              └────────────────┘
