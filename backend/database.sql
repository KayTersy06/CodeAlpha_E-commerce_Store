CREATE DATABASE coach_tersy_store;

CREATE TYPE user_role AS ENUM (
    'customer',
    'admin'
);

CREATE TYPE order_status_type AS ENUM (
    'Pending',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled'
);

CREATE TYPE payment_status_type AS ENUM (
    'Pending',
    'Paid',
    'Failed'
);

CREATE TABLE users (
    user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    category_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
);

CREATE TABLE products (
    product_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id INTEGER,
    product_name VARCHAR(150) NOT NULL,
    description TEXT,
    benefits TEXT,
    price NUMERIC(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_product_category
        FOREIGN KEY (category_id)
        REFERENCES categories(category_id)
        ON DELETE SET NULL
);

CREATE TABLE carts (
    cart_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_cart_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE cart_items (
    cart_item_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cart_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),

    CONSTRAINT fk_cartitem_cart
        FOREIGN KEY (cart_id)
        REFERENCES carts(cart_id)
        ON DELETE CASCADE,

    CONSTRAINT fk_cartitem_product
        FOREIGN KEY (product_id)
        REFERENCES products(product_id)
        ON DELETE CASCADE
);

CREATE TABLE orders (
    order_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id INTEGER NOT NULL,

    total_amount NUMERIC(10,2) NOT NULL,

    order_status order_status_type DEFAULT 'Pending',

    payment_status payment_status_type DEFAULT 'Pending',

    delivery_address TEXT NOT NULL,

    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_order_user
        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
);

INSERT INTO users (
    full_name,
    email,
    phone,
    password_hash,
    role
)
VALUES (
    'Coach Tersy',
    'xolaniskosana06@gmail.com',
    '0684664608',
    '$2b$10$KzQv1l7QY3xN2sN3D8Qm4eYh5R7uB9wFvQ6aP1gLxJtC8mRkN2OaS',
    'admin'
);