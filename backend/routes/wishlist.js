const express = require("express");
const Wishlist = require("../models/Wishlist");
const { auth } = require("../middleware/auth");

const router = express.Router();

// GET /api/wishlist - Get current user's wishlist
router.get("/", auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    res.json(wishlist ? wishlist.items : []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/wishlist - Add item to wishlist
router.post("/", auth, async (req, res) => {
  try {
    const { productId, name, price, image, category, rating, numReviews, countInStock } = req.body;
    if (!productId || !name) {
      return res.status(400).json({ message: "productId and name are required" });
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, items: [] });
    }

    // Don't add duplicates
    if (wishlist.items.some((i) => i.productId === productId)) {
      return res.json(wishlist.items);
    }

    wishlist.items.push({ productId, name, price, image, category, rating, numReviews, countInStock });
    await wishlist.save();
    res.status(201).json(wishlist.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/wishlist/:productId - Remove item from wishlist
router.delete("/:productId", auth, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      return res.json([]);
    }

    wishlist.items = wishlist.items.filter((i) => i.productId !== req.params.productId);
    await wishlist.save();
    res.json(wishlist.items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
