import * as SQLite from "expo-sqlite";
import type { Product } from "../types/product";
import type { Category } from "../types/category";
import { initialCategories, initialProducts } from "./initialData";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

// Lấy hoặc mở kết nối SQLite
export function getDatabase() {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("stationery_store.db");
  }
  return dbPromise;
}

// Khởi tạo database, tạo bảng và chạy migration an toàn
export async function initDatabase() {
  const db = await getDatabase();

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
      role TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
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
      FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS favorites (
      userId TEXT NOT NULL,
      productId TEXT NOT NULL,
      PRIMARY KEY (userId, productId),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      userId TEXT NOT NULL,
      productId TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      PRIMARY KEY (userId, productId),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY NOT NULL,
      userId TEXT,
      totalAmount INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      recipientName TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      paymentMethod TEXT NOT NULL DEFAULT 'COD',
      paymentStatus TEXT NOT NULL DEFAULT 'UNPAID',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId TEXT NOT NULL,
      productId TEXT,
      productName TEXT NOT NULL,
      unitPrice INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS auth_sessions (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      userId TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Migration: kiểm tra và thêm các cột thanh toán nếu database cũ chưa có
  const tableInfo = await db.getAllAsync<{ name: string }>(
    "PRAGMA table_info(orders)"
  );
  const columnNames = tableInfo.map((col) => col.name);

  if (!columnNames.includes("paymentMethod")) {
    await db.runAsync(
      "ALTER TABLE orders ADD COLUMN paymentMethod TEXT NOT NULL DEFAULT 'COD'"
    );
  }

  if (!columnNames.includes("paymentStatus")) {
    await db.runAsync(
      "ALTER TABLE orders ADD COLUMN paymentStatus TEXT NOT NULL DEFAULT 'UNPAID'"
    );
  }

  // Thêm dữ liệu ban đầu nếu chưa có
  for (const category of initialCategories) {
    await db.runAsync(
      "INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)",
      [category.id, category.name]
    );
  }

  for (const product of initialProducts) {
    await db.runAsync(
      `INSERT OR IGNORE INTO products
       (id, name, description, price, categoryId, brand, stock, rating)
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

  // Tạo tài khoản Admin mặc định nếu chưa tồn tại
  const admin = await db.getFirstAsync<{ id: string }>(
    "SELECT id FROM users WHERE email = ?",
    "admin@stationery.local"
  );

  if (!admin) {
    await db.runAsync(
      `INSERT INTO users (id, fullName, email, password, role)
       VALUES (?, ?, ?, ?, ?)`,
      ["ADMIN001", "Quản trị viên", "admin@stationery.local", "Admin@123", "ADMIN"]
    );
  }

  return db;
}

// Lấy toàn bộ danh mục sản phẩm
export async function getCategories(): Promise<Category[]> {
  const db = await getDatabase();
  return db.getAllAsync<Category>(
    "SELECT id, name, image FROM categories ORDER BY id ASC"
  );
}

// Lấy toàn bộ sản phẩm kèm tên danh mục
export async function getProducts(): Promise<Product[]> {
  const db = await getDatabase();
  return db.getAllAsync<Product>(`
    SELECT
      p.id, p.name, p.description, p.price, p.image,
      p.categoryId, c.name AS categoryName, p.brand, p.stock, p.rating
    FROM products p
    LEFT JOIN categories c ON p.categoryId = c.id
    ORDER BY p.id ASC
  `);
}

// Lấy chi tiết một sản phẩm theo ID
export async function getProductById(id: string): Promise<Product | null> {
  const db = await getDatabase();
  return db.getFirstAsync<Product>(
    `
      SELECT
        p.id, p.name, p.description, p.price, p.image,
        p.categoryId, c.name AS categoryName, p.brand, p.stock, p.rating
      FROM products p
      LEFT JOIN categories c ON p.categoryId = c.id
      WHERE p.id = ?
    `,
    id
  );
}
