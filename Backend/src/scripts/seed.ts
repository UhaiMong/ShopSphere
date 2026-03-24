/**
 * Seed Script — Development Only
 *
 * Run: npx tsx src/scripts/seed.ts
 *
 * Creates:
 *   - 1 superadmin user
 *   - 1 regular user
 *   - Root categories + sub-categories
 *   - 12 sample products
 *
 * Safe to run multiple times — checks for existing data first.
 */

import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import mongoose from "mongoose";
import { User } from "../models/User.model";
import { Category } from "../models/Category.model";
import { Product } from "../models/Product.model";

const MONGO_URI = process.env.MONGO_URI!;

// Seed Data
const ADMIN = {
  name: "Super Admin",
  email: "uhaimong.me@gmail.com",
  passwordHash: "Admin@885",
  role: "superadmin" as const,
  isVerified: true,
  isActive: true,
};

const TEST_USER = {
  name: "Uhai Mong(test)",
  email: "uhaimong.ai@gmail.com",
  passwordHash: "Admin@885",
  role: "user" as const,
  isVerified: true,
  isActive: true,
};

const CATEGORIES = [
  {
    name: "Electronics",
    description: "Gadgets, devices and accessories",
    icon: "💻",
    children: [
      { name: "Smartphones", icon: "📱" },
      { name: "Laptops", icon: "💻" },
      { name: "Audio", icon: "🎧" },
      { name: "Accessories", icon: "🔌" },
    ],
  },
  {
    name: "Clothing",
    description: "Fashion for men, women and kids",
    icon: "👕",
    children: [
      { name: "Men's Fashion", icon: "👔" },
      { name: "Women's Fashion", icon: "👗" },
      { name: "Kids", icon: "🧒" },
    ],
  },
  {
    name: "Home & Garden",
    description: "Everything for your home",
    icon: "🏠",
    children: [
      { name: "Furniture", icon: "🛋️" },
      { name: "Kitchen", icon: "🍳" },
    ],
  },
  {
    name: "Books",
    description: "Books, eBooks and stationery",
    icon: "📚",
    children: [],
  },
];

// Helpers
const makeProducts = (categoryMap: Record<string, mongoose.Types.ObjectId>) => [
  {
    name: "iPhone 15 Pro Max",
    description:
      "Apple iPhone 15 Pro Max with A17 Pro chip, 48MP camera system, and titanium design. The most powerful iPhone ever made with incredible battery life.",
    shortDescription: "Apple A17 Pro · 48MP · Titanium · 5G",
    price: 119900,
    comparePrice: 129900,
    category: categoryMap["Smartphones"],
    brand: "Apple",
    stock: 50,
    sku: "APL-IP15PM-256",
    tags: ["smartphone", "apple", "iphone", "5g"],
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800",
    ],
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description:
      "Samsung Galaxy S24 Ultra with Snapdragon 8 Gen 3, 200MP camera, built-in S Pen, and 5000mAh battery.",
    shortDescription: "Snapdragon 8 Gen 3 · 200MP · S Pen",
    price: 109900,
    comparePrice: 119900,
    category: categoryMap["Smartphones"],
    brand: "Samsung",
    stock: 35,
    tags: ["smartphone", "samsung", "android", "5g"],
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1707558854200-bcb70e5de3aa?w=800",
    ],
  },
  {
    name: 'MacBook Pro 14" M3',
    description:
      "Apple MacBook Pro 14-inch with M3 chip, 16GB unified memory, and 512GB SSD. Up to 18 hours of battery life.",
    shortDescription: 'Apple M3 · 16GB RAM · 512GB SSD · 14"',
    price: 199900,
    comparePrice: 219900,
    category: categoryMap["Laptops"],
    brand: "Apple",
    stock: 20,
    tags: ["laptop", "apple", "macbook", "m3"],
    isFeatured: true,
    images: [
      "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800",
    ],
  },
  {
    name: "Sony WH-1000XM5",
    description:
      "Industry-leading noise canceling headphones with 30-hour battery life, multipoint connection, and crystal clear hands-free calling.",
    shortDescription: "ANC · 30hr battery · Multipoint",
    price: 34900,
    comparePrice: 39900,
    category: categoryMap["Audio"],
    brand: "Sony",
    stock: 60,
    tags: ["headphones", "sony", "anc", "wireless"],
    isFeatured: false,
    images: [
      "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800",
    ],
  },
  {
    name: "Apple AirPods Pro (2nd Gen)",
    description:
      "Active Noise Cancellation, Adaptive Transparency, and Personalized Spatial Audio. MagSafe charging case with up to 30 hours total listening time.",
    shortDescription: "ANC · Spatial Audio · MagSafe",
    price: 24900,
    comparePrice: 27900,
    category: categoryMap["Audio"],
    brand: "Apple",
    stock: 80,
    tags: ["earbuds", "apple", "airpods", "anc"],
    images: [
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800",
    ],
  },
  {
    name: "USB-C Hub 7-in-1",
    description:
      "7-in-1 USB-C hub with 4K HDMI, 3x USB-A 3.0, SD card reader, 100W PD charging.",
    shortDescription: "4K HDMI · 100W PD · 7 ports",
    price: 3999,
    comparePrice: 4999,
    category: categoryMap["Accessories"],
    brand: "Anker",
    stock: 120,
    tags: ["usb-c", "hub", "accessory"],
    images: [
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800",
    ],
  },
  {
    name: "Men's Oxford Shirt",
    description:
      "Classic slim-fit Oxford shirt made from 100% premium cotton. Perfect for office or casual wear.",
    shortDescription: "100% Cotton · Slim Fit · Machine Washable",
    price: 2999,
    comparePrice: 3999,
    category: categoryMap["Men's Fashion"],
    brand: "ShopSphere Basics",
    stock: 200,
    tags: ["shirt", "men", "cotton", "formal"],
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800",
    ],
    variants: [
      { sku: "SHIRT-S", size: "S", stock: 40, price: 2999 },
      { sku: "SHIRT-M", size: "M", stock: 60, price: 2999 },
      { sku: "SHIRT-L", size: "L", stock: 60, price: 2999 },
      { sku: "SHIRT-XL", size: "XL", stock: 40, price: 2999 },
    ],
  },
  {
    name: "Floral Summer Dress",
    description:
      "Lightweight floral print dress in breathable fabric. Perfect for summer outings.",
    shortDescription: "Floral Print · Lightweight · Summer",
    price: 3499,
    comparePrice: 4999,
    category: categoryMap["Women's Fashion"],
    brand: "ShopSphere Basics",
    stock: 150,
    tags: ["dress", "women", "summer", "floral"],
    images: [
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800",
    ],
  },
  {
    name: "Ergonomic Office Chair",
    description:
      "Lumbar support, adjustable armrests, breathable mesh back. Supports up to 150kg.",
    shortDescription: "Mesh Back · Lumbar Support · Adjustable",
    price: 29999,
    comparePrice: 39999,
    category: categoryMap["Furniture"],
    brand: "ErgoComfort",
    stock: 25,
    tags: ["chair", "office", "ergonomic", "furniture"],
    isFeatured: true,
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800"],
  },
  {
    name: "Non-Stick Cookware Set (5-Piece)",
    description:
      "Premium non-stick pans and pots with granite coating. Dishwasher safe, induction compatible.",
    shortDescription: "Granite Coating · Induction Safe · 5pc",
    price: 8999,
    comparePrice: 12999,
    category: categoryMap["Kitchen"],
    brand: "CookPro",
    stock: 45,
    tags: ["cookware", "kitchen", "non-stick"],
    images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"],
  },
  {
    name: "Atomic Habits",
    description:
      "An Easy & Proven Way to Build Good Habits & Break Bad Ones by James Clear. #1 New York Times bestseller.",
    shortDescription: "James Clear · Hardcover · 320 pages",
    price: 1299,
    comparePrice: 1599,
    category: categoryMap["Books"],
    brand: "Avery",
    stock: 300,
    tags: ["book", "self-help", "habits", "productivity"],
    images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800"],
  },
  {
    name: "Kids Learning Tablet",
    description:
      'Kid-safe 8" tablet with parental controls, 50+ educational apps, shockproof case. Ages 3-12.',
    shortDescription: '8" Display · 50+ Apps · Shockproof · Ages 3-12',
    price: 9999,
    comparePrice: 12999,
    category: categoryMap["Kids"],
    brand: "LeapPad",
    stock: 70,
    tags: ["tablet", "kids", "educational", "learning"],
    isFeatured: true,
    images: ["https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800"],
  },
];

// Seed Runner
async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected\n");

  // Users
  console.log("👤 Seeding users...");
  const adminExists = await User.findOne({ email: ADMIN.email });
  if (!adminExists) {
    await User.create(ADMIN);
    console.log(`✅ Admin created: ${ADMIN.email} / Admin@123456`);
  } else {
    console.log(`⏭️  Admin already exists`);
  }

  const userExists = await User.findOne({ email: TEST_USER.email });
  if (!userExists) {
    await User.create(TEST_USER);
    console.log(`   ✅ Test user created: ${TEST_USER.email} / User@123456`);
  } else {
    console.log(`   ⏭️  Test user already exists`);
  }

  // ── Categories
  console.log("\n📂 Seeding categories...");
  const categoryMap: Record<string, mongoose.Types.ObjectId> = {};

  for (const cat of CATEGORIES) {
    let parent = await Category.findOne({ name: cat.name });
    if (!parent) {
      parent = await Category.create({
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        ancestors: [],
      });
      console.log(`   ✅ ${cat.name}`);
    } else {
      console.log(`   ⏭️  ${cat.name} exists`);
    }
    categoryMap[cat.name] = parent._id as mongoose.Types.ObjectId;

    for (const child of cat.children) {
      let childCat = await Category.findOne({ name: child.name });
      if (!childCat) {
        childCat = await Category.create({
          name: child.name,
          icon: child.icon,
          parent: parent._id,
          ancestors: [parent._id],
        });
        console.log(`      ✅ ${child.name}`);
      } else {
        console.log(`      ⏭️  ${child.name} exists`);
      }
      categoryMap[child.name] = childCat._id as mongoose.Types.ObjectId;
    }
  }

  // Products
  console.log("\n📦 Seeding products...");
  const products = makeProducts(categoryMap);

  for (const prod of products) {
    const exists = await Product.findOne({ name: prod.name });
    if (!exists) {
      await Product.create(prod);
      console.log(`   ✅ ${prod.name}`);
    } else {
      console.log(`   ⏭️  ${prod.name} exists`);
    }
  }

  // Done
  console.log(`
  🎉 Seed complete!

  Admin  → uhaimong.me@gmail.com / Admin@885
  User   → uhaimong.ai@gmail.com  / Admin@885
  `);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
