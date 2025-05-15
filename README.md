# E-commerce Backend System

## Overview
This is a backend system for an e-commerce platform built with Node.js, Express, and PostgreSQL. The system includes features for product management, user management, order processing, and email notifications.

## Features
- Product Management
  - View all product categories
  - Get products by category
  - Search products with filters
  - Create new products

- User Management
  - Create new users
  - Store user information

- Order Processing
  - Create new orders
  - Calculate total price
  - Process payment methods
  - Update product inventory

- Email Notifications
  - Order confirmation emails
  - Asynchronous email processing

## Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd ecommerce-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=geekup
DB_PASSWORD=your_db_password
DB_PORT=5432
PORT=3000
```

4. Initialize the database:
```bash
psql -U your_db_user -d geekup -f sql/init.sql
```

## Running the Application

1. Start the server:
```bash
npm start
```

2. The server will run on `http://localhost:3000`

## API Documentation

### Product APIs

1. Get all categories:
```
GET /api/categories
```

2. Get products by category:
```
GET /api/categories/:categoryId/products
```

3. Search products:
```
GET /api/products/search?keyword=&minPrice=&maxPrice=&color=&size=
```

4. Create new product:
```
POST /api/products
Body: {
    "name": "string",
    "price": number,
    "size": "string",
    "quantity": number,
    "color": "string",
    "categoryid": number
}
```

### User APIs

1. Create new user:
```
POST /api/users
Body: {
    "name": "string",
    "email": "string",
    "phone": "string",
    "province": "string",
    "district": "string",
    "comune": "string",
    "address": "string",
    "housing_type": "string"
}
```

### Order APIs

1. Create new order:
```
POST /api/orders
Body: {
    "userId": number,
    "items": [
        {
            "productId": number,
            "quantity": number
        }
    ],
    "paymentOnline": boolean
}
```

## Testing the API

You can use the provided `index.html` file to test all APIs. Open the file in your browser and use the interface to interact with the APIs.

## Email Notifications

The system sends order confirmation emails asynchronously using Kafka. Please check your email (including spam folder) after creating an order.

## Contributing

Feel free to submit issues and enhancement requests.

## License

This project is licensed under the MIT License.
