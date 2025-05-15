# E-commerce Backend API

A RESTful API for an e-commerce platform built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

1. User order management
2. Product and category management
3. Order analytics (average order value, churn rate)
4. Product search with filters
5. Asynchronous order confirmation emails using Kafka

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- PostgreSQL (if running locally)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ecommerce-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ecommerce

# Kafka
KAFKA_BROKERS=localhost:9092

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

4. Start the application using Docker Compose:
```bash
docker-compose up -d
```

## API Endpoints

### Orders
- `POST /api/orders` - Create a new order
- `GET /api/orders/average-value` - Get average order value by month
- `GET /api/orders/churn-rate` - Get customer churn rate

### Products
- `GET /api/categories` - Get all product categories
- `GET /api/categories/:categoryId/products` - Get products by category
- `GET /api/products/search` - Search products with filters

## Development

1. Start the development server:
```bash
npm run dev
```

2. Run database migrations:
```bash
npm run migration:run
```

## Deployment

The application is containerized and can be deployed to any cloud platform that supports Docker containers (e.g., AWS EC2, Google Cloud Run, etc.).

1. Build the Docker image:
```bash
docker build -t ecommerce-backend .
```

2. Run the container:
```bash
docker run -p 3000:3000 ecommerce-backend
```

## License

MIT
