import * as SQLite from "expo-sqlite";
import type { Product } from "../types/product";
import type { Category } from "../types/category";
// Mở hoặc tạo database
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(
      "stationery_store.db"
    );
  }

  return dbPromise;
}

// Dữ liệu danh mục ban đầu
const initialCategories = [
  { id: "CAT01", name: "Bút viết" },
  { id: "CAT02", name: "Vở và sổ" },
  { id: "CAT03", name: "Giấy" },
  { id: "CAT04", name: "Dụng cụ học tập" },
  { id: "CAT05", name: "Văn phòng phẩm" },
];

// Dữ liệu sản phẩm ban đầu
// Giá chỉ dùng cho mục đích demo
const initialProducts = [
  {
    id: "SP001",
    name: "Bút bi Thiên Long TL-027",
    description: "Bút bi mực xanh, viết êm",
    price: 5000,
    categoryId: "CAT01",
    brand: "Thiên Long",
    stock: 100,
    rating: 4.8,
  },
  {
    id: "SP002",
    name: "Bút gel Deli",
    description: "Bút gel mực xanh",
    price: 10000,
    categoryId: "CAT01",
    brand: "Deli",
    stock: 80,
    rating: 4.6,
  },
  {
    id: "SP003",
    name: "Bút highlight Deli",
    description: "Bút đánh dấu nhiều màu",
    price: 15000,
    categoryId: "CAT01",
    brand: "Deli",
    stock: 50,
    rating: 4.7,
  },
  {
    id: "SP004",
    name: "Vở Campus 200 trang",
    description: "Vở ghi chép chất lượng tốt",
    price: 25000,
    categoryId: "CAT02",
    brand: "Campus",
    stock: 60,
    rating: 4.9,
  },
  {
    id: "SP005",
    name: "Sổ tay lò xo",
    description: "Sổ tay dùng để ghi chú",
    price: 35000,
    categoryId: "CAT02",
    brand: "FlexOffice",
    stock: 40,
    rating: 4.5,
  },
  {
    id: "SP006",
    name: "Giấy A4 Double A",
    description: "Giấy in khổ A4",
    price: 85000,
    categoryId: "CAT03",
    brand: "Double A",
    stock: 100,
    rating: 4.8,
  },
  {
    id: "SP007",
    name: "Giấy note nhiều màu",
    description: "Giấy ghi chú tiện lợi",
    price: 12000,
    categoryId: "CAT03",
    brand: "Deli",
    stock: 70,
    rating: 4.6,
  },
  {
    id: "SP008",
    name: "Thước kẻ 20cm",
    description: "Thước nhựa trong suốt",
    price: 6000,
    categoryId: "CAT04",
    brand: "Thiên Long",
    stock: 100,
    rating: 4.7,
  },
  {
    id: "SP009",
    name: "Tẩy Thiên Long",
    description: "Tẩy sạch không làm rách giấy",
    price: 4000,
    categoryId: "CAT04",
    brand: "Thiên Long",
    stock: 90,
    rating: 4.5,
  },
  {
    id: "SP010",
    name: "Dụng cụ bấm kim Deli",
    description: "Dụng cụ bấm kim văn phòng",
    price: 45000,
    categoryId: "CAT05",
    brand: "Deli",
    stock: 30,
    rating: 4.8,
  },
];

// Khởi tạo database và dữ liệu ban đầu
export async function initDatabase() {
  const db = await getDatabase();

  // Tạo các bảng
  await db.execAsync(`
    PRAGMA foreign_keys = ON;
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      fullName TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      role TEXT NOT NULL DEFAULT 'USER'
        CHECK (role IN ('USER', 'ADMIN')),
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      image TEXT
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL CHECK (price >= 0),
      image TEXT,
      categoryId TEXT,
      brand TEXT,
      stock INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      isFeatured INTEGER DEFAULT 0,
      FOREIGN KEY (categoryId)
        REFERENCES categories(id)
        ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS favorites (
      userId TEXT NOT NULL,
      productId TEXT NOT NULL,
      PRIMARY KEY (userId, productId),
      FOREIGN KEY (userId)
        REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (productId)
        REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      userId TEXT NOT NULL,
      productId TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (userId, productId),
      FOREIGN KEY (userId)
        REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (productId)
        REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT,
      totalAmount INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      recipientName TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId)
        REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId TEXT NOT NULL,
      productId TEXT,
      productName TEXT NOT NULL,
      unitPrice INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (orderId)
        REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS auth_sessions (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      userId TEXT NOT NULL,
      FOREIGN KEY (userId)
        REFERENCES users(id)
        ON DELETE CASCADE
    );
  `);


  
  // Thêm các danh mục ban đầu
  for (const category of initialCategories) {
    await db.runAsync(
      `INSERT OR IGNORE INTO categories (id, name)
       VALUES (?, ?)`,
      [category.id, category.name]
    );
  }

  // Thêm các sản phẩm ban đầu
  for (const product of initialProducts) {
    await db.runAsync(
      `INSERT OR IGNORE INTO products
       (id, name, description, price, categoryId,
        brand, stock, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product.id,
        product.name,
        product.description,
        product.price,
        product.categoryId,
        product.brand,
        product.stock,
        product.rating,
      ]
    );
  }

  // Tạo tài khoản Admin nếu chưa tồn tại
  const admin = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM users WHERE email = ?`,
    "admin@stationery.local"
  );

  if (!admin) {
    await db.runAsync(
      `INSERT INTO users
       (id, fullName, email, password, role)
       VALUES (?, ?, ?, ?, ?)`,
      [
        "ADMIN001",
        "Quản trị viên",
        "admin@stationery.local",
        "Admin@123",
        "ADMIN",
      ]
    );
  }

  console.log("Database initialized successfully!");

  return db;
}

export async function getCategories(): Promise<Category[]> {
  const db = await getDatabase();

  const categories = await db.getAllAsync<Category>(`
    SELECT id, name, image
    FROM categories
    ORDER BY id ASC
  `);

  console.log("Categories loaded:", categories);

  return categories;
}

export async function getProducts(): Promise<Product[]> {
  const db = await getDatabase();

  const products = await db.getAllAsync<Product>(`
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.image,
      p.categoryId,
      c.name AS categoryName,
      p.brand,
      p.stock,
      p.rating
    FROM products p
    LEFT JOIN categories c
      ON p.categoryId = c.id
    ORDER BY p.id ASC
  `);

  console.log("Products loaded:", products);

  return products;
}

// Lấy chi tiết một sản phẩm theo ID
export async function getProductById(
  id: string
): Promise<Product | null> {
  const db = await getDatabase();

  const product = await db.getFirstAsync<Product>(
    `
      SELECT
        p.id,
        p.name,
        p.description,
        p.price,
        p.image,
        p.categoryId,
        c.name AS categoryName,
        p.brand,
        p.stock,
        p.rating
      FROM products p
      LEFT JOIN categories c
        ON p.categoryId = c.id
      WHERE p.id = ?
    `,
    id
  );

  console.log("Product detail:", product);

  return product;
}
