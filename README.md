# E-commerce Backend System

## Overview
This the 48-hour test given by Geek up in the Product Backend Summer internship 2025

This is a backend system for an e-commerce platform built with Node.js,Docker, Kafka and PostgreSQL. The system includes features for product management, user management, order processing, and email notifications.

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

- Email Notifications (using kafka)
  - Order confirmation emails
  - Asynchronous email processing
  - PLS REMEMBER TO CHECK YOUR SPAM OR ALL EMAIL IN GMAIL

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
## Running the Application
2. Use Docker:
```bash
Docker compose-up --build
```
The backend is exposed to localhost:3000

2. The Web will run on `http://localhost:8080`

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
Example Request:

```
GET /api/products/search?keyword=shirt&minPrice=100&maxPrice=500&color=red&size=L
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
