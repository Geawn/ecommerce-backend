-- This is the same as your provided schema
CREATE TABLE "user" (
    userID SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    province VARCHAR(100),
    district VARCHAR(100),
    comune VARCHAR(100),
    address TEXT,
    housing_type VARCHAR(50)
);

-- Sample data
INSERT INTO "user" (name, email, phone, province, district, comune, address, housing_type)
VALUES 
('Nguyen Van A', 'a@example.com', '0912345678', 'Hanoi', 'Dong Da', 'Lang Ha', '123 Lang Ha', 'Apartment');

CREATE TABLE "category" (
    categoryID SERIAL PRIMARY KEY,
    name VARCHAR(100),
    discount_percent NUMERIC(5,2)
);

-- Sample data
INSERT INTO "category" (name, discount_percent)
VALUES 
('Electronics', 10.00),
('Clothing', 5.00);

CREATE TABLE "product" (
    productID SERIAL PRIMARY KEY,
    name VARCHAR(100),
    price NUMERIC(10,2),
    size VARCHAR(50),
    quantity INT,
    color VARCHAR(50),
    categoryid INT REFERENCES "category"(categoryID)
);

-- Sample data
INSERT INTO "product" (name, price, size, quantity, color, categoryid)
VALUES 
('T-Shirt', 199.00, 'L', 100, 'Red', 2),
('Smartphone', 699.99, '6.5 inch', 50, 'Black', 1);

CREATE TABLE "order" (
    orderID SERIAL PRIMARY KEY,
    userID INT REFERENCES "user"(userID),
    orderDate DATE,
    totalPrice NUMERIC(10,2),
    payment_online BOOLEAN
);

-- Sample data
INSERT INTO "order" (userID, orderDate, totalPrice, payment_online)
VALUES 
(1, CURRENT_DATE, 899.99, TRUE);

CREATE TABLE "order_item" (
    orderItemID SERIAL PRIMARY KEY,
    orderID INT REFERENCES "order"(orderID),
    productID INT REFERENCES "product"(productID),
    quantity INT,
    unitPrice NUMERIC(10,2)
);

-- Sample data
INSERT INTO "order_item" (orderID, productID, quantity, unitPrice)
VALUES 
(1, 1, 2, 199.00),
(1, 2, 1, 699.99);

CREATE TABLE "store" (
    storeID SERIAL PRIMARY KEY,
    name VARCHAR(100),
    location VARCHAR(255)
);

-- Sample data
INSERT INTO "store" (name, location)
VALUES 
('Main Store', 'Hanoi'),
('Branch Store', 'Saigon');

CREATE TABLE "product_store" (
    productID INT REFERENCES "product"(productID),
    storeID INT REFERENCES "store"(storeID),
    quantity INT,
    PRIMARY KEY (productID, storeID)
);

-- Sample data
INSERT INTO "product_store" (productID, storeID, quantity)
VALUES 
(1, 1, 50),
(2, 2, 20);

CREATE TABLE "voucher" (
    voucherID SERIAL PRIMARY KEY,
    code VARCHAR(50),
    amount_percent NUMERIC(5,2),
    type VARCHAR(50),  -- e.g. 'ship', 'discount'
    startDate DATE,
    endDate DATE
);

-- Sample data
INSERT INTO "voucher" (code, amount_percent, type, startDate, endDate)
VALUES 
('SHIPFREE', 100.00, 'ship', '2025-01-01', '2025-12-31'),
('DISC10', 10.00, 'discount', '2025-01-01', '2025-06-30');

CREATE TABLE "user_voucher" (
    userID INT REFERENCES "user"(userID),
    voucherID INT REFERENCES "voucher"(voucherID),
    appliedDate DATE,
    PRIMARY KEY (userID, voucherID)
);

-- Sample data
INSERT INTO "user_voucher" (userID, voucherID, appliedDate)
VALUES 
(1, 1, CURRENT_DATE);

CREATE TABLE "fee" (
    feeID SERIAL PRIMARY KEY,
    name VARCHAR(100),
    amount NUMERIC(10,2)
);

-- Sample data
INSERT INTO "fee" (name, amount)
VALUES 
('Shipping', 20.00),
('Packaging', 5.00);

CREATE TABLE "order_fee" (
    orderID INT REFERENCES "order"(orderID),
    feeID INT REFERENCES "fee"(feeID),
    amount NUMERIC(10,2),
    PRIMARY KEY (orderID, feeID)
);

-- Sample data
INSERT INTO "order_fee" (orderID, feeID, amount)
VALUES 
(1, 1, 20.00),
(1, 2, 5.00);