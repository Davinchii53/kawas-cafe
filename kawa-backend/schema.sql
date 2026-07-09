-- schema.sql
DROP TABLE IF EXISTS ledger;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS profiles;

CREATE TABLE profiles (
    id TEXT PRIMARY KEY,
    wallet_balance REAL DEFAULT 0.00,
    role TEXT DEFAULT 'customer',
    password TEXT
);

CREATE TABLE menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    desc TEXT,
    price REAL NOT NULL,
    category TEXT,
    customizable BOOLEAN DEFAULT 0
);

CREATE TABLE orders (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    total_amount REAL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT,
    menu_item_id INTEGER,
    name TEXT,
    quantity INTEGER,
    spice_level INTEGER,
    extra_toppings TEXT
);

CREATE TABLE ledger (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    amount REAL,
    type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial menu data
INSERT INTO menu_items (id, name, desc, price, category, customizable) VALUES
(1, 'MIE SETAN', 'Savoury, salty, hot chili oil base. Choose your spice level.', 3.50, 'Noodles', 1),
(2, 'MIE IBLIS', 'Sweet dark soy glaze tossed with fiery chili paste. Bold and sweet.', 3.50, 'Noodles', 1),
(3, 'MIE ANGEL', 'Zero heat. Tossed in aromatic chicken fat, topped with dried chicken floss.', 3.00, 'Noodles', 0),
(4, 'UDANG RAMBUTAN', 'Golden minced shrimp balls wrapped in crispy pastry threads (3 pcs).', 2.50, 'Dimsum', 0),
(5, 'UDANG KEJU', 'Crispy fried shrimp dumplings stuffed with melted mozzarella (3 pcs).', 2.50, 'Dimsum', 0),
(6, 'LUMPIA TAHU', 'Minced chicken & shrimp spring roll in crispy tofu skin wrapper (3 pcs).', 2.20, 'Dimsum', 0),
(7, 'ES GENDERUWO', 'Fruity syrup ice loaded with jelly, coco gel, and sweetened milk.', 2.00, 'Drinks', 0),
(8, 'ES POCONG', 'Sharp lime juice, sweet basil seeds, and coconut slices over crushed ice.', 1.80, 'Drinks', 0);

-- Seed initial users for the demo
INSERT INTO profiles (id, wallet_balance, role, password) VALUES ('demo_user', 25.00, 'customer', 'password123');
INSERT INTO profiles (id, wallet_balance, role, password) VALUES ('admin', 0.00, 'admin', '1234');
