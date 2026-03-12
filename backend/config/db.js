const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

const connectDB = async () => {
  try {
    // Try connecting to the configured MongoDB URI first
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  } catch {
    // Fall back to in-memory MongoDB
    console.log("Local MongoDB not found, starting in-memory server...");
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log("MongoDB in-memory server started");

    // Auto-seed the in-memory database
    await seedDatabase();
  }
};

async function seedDatabase() {
  const User = require("../models/User");
  const Product = require("../models/Product");

  const userCount = await User.countDocuments();
  if (userCount > 0) return;

  console.log("Seeding database...");

  await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123",
    isAdmin: true,
  });

  await User.create({
    name: "Test User",
    email: "user@example.com",
    password: "user123",
    isAdmin: false,
  });

  await Product.insertMany([
    {
      name: "Wireless Bluetooth Headphones",
      description: "Premium noise-cancelling wireless headphones with 30-hour battery life, comfortable over-ear design, and crystal-clear audio quality.",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      category: "Electronics",
      countInStock: 25,
      rating: 4.5,
      numReviews: 128,
    },
    {
      name: "Minimalist Leather Watch",
      description: "Elegant minimalist watch with genuine leather strap, Japanese quartz movement, and water-resistant design.",
      price: 149.99,
      image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500",
      category: "Accessories",
      countInStock: 15,
      rating: 4.7,
      numReviews: 89,
    },
    {
      name: "Organic Cotton T-Shirt",
      description: "Soft and sustainable organic cotton t-shirt. Available in multiple colors. Machine washable and pre-shrunk.",
      price: 29.99,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
      category: "Clothing",
      countInStock: 50,
      rating: 4.3,
      numReviews: 256,
    },
    {
      name: "Stainless Steel Water Bottle",
      description: "Double-walled vacuum insulated water bottle. Keeps drinks cold for 24 hours or hot for 12 hours. BPA-free.",
      price: 34.99,
      image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500",
      category: "Home",
      countInStock: 40,
      rating: 4.6,
      numReviews: 312,
    },
    {
      name: "Mechanical Keyboard",
      description: "RGB mechanical gaming keyboard with Cherry MX switches, programmable keys, and aluminum frame.",
      price: 119.99,
      image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500",
      category: "Electronics",
      countInStock: 20,
      rating: 4.8,
      numReviews: 175,
    },
    {
      name: "Canvas Backpack",
      description: "Durable canvas backpack with laptop compartment, multiple pockets, and adjustable padded straps.",
      price: 59.99,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
      category: "Accessories",
      countInStock: 30,
      rating: 4.4,
      numReviews: 198,
    },
    {
      name: "Ceramic Pour-Over Coffee Set",
      description: "Handcrafted ceramic pour-over coffee dripper with matching mug. Perfect for coffee enthusiasts.",
      price: 44.99,
      image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500",
      category: "Home",
      countInStock: 18,
      rating: 4.2,
      numReviews: 67,
    },
    {
      name: "Running Shoes",
      description: "Lightweight running shoes with responsive cushioning, breathable mesh upper, and durable rubber outsole.",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      category: "Clothing",
      countInStock: 35,
      rating: 4.6,
      numReviews: 421,
    },
    {
      name: "Wireless Charging Pad",
      description: "Fast wireless charging pad compatible with all Qi-enabled devices. Slim profile with LED indicator.",
      price: 24.99,
      image: "https://images.unsplash.com/photo-1591815302525-756a9bcc3425?w=500",
      category: "Electronics",
      countInStock: 45,
      rating: 4.1,
      numReviews: 156,
    },
    {
      name: "Scented Soy Candle Set",
      description: "Set of 3 hand-poured soy candles in lavender, vanilla, and eucalyptus. 40-hour burn time each.",
      price: 39.99,
      image: "https://images.unsplash.com/photo-1602607753643-1ade9e1b3e35?w=500",
      category: "Home",
      countInStock: 22,
      rating: 4.5,
      numReviews: 93,
    },
    {
      name: "Sunglasses - Classic Aviator",
      description: "Classic aviator sunglasses with polarized lenses, UV400 protection, and lightweight metal frame.",
      price: 64.99,
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
      category: "Accessories",
      countInStock: 28,
      rating: 4.3,
      numReviews: 144,
    },
    {
      name: "Yoga Mat Premium",
      description: "Non-slip premium yoga mat with alignment lines. Extra thick cushioning for joint protection. Includes carry strap.",
      price: 49.99,
      image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500",
      category: "Fitness",
      countInStock: 33,
      rating: 4.7,
      numReviews: 287,
    },
  ]);

  console.log("Database seeded!");
  console.log("Admin: admin@example.com / admin123");
  console.log("User:  user@example.com / user123");
}

module.exports = connectDB;
