const express = require("express");
const { body, validationResult } = require("express-validator");
const Order = require("../models/Order");
const { auth, admin } = require("../middleware/auth");

const router = express.Router();

// POST /api/orders
router.post(
  "/",
  auth,
  [
    body("items").isArray({ min: 1 }).withMessage("At least one item required"),
    body("shippingAddress.fullName").trim().notEmpty(),
    body("shippingAddress.address").trim().notEmpty(),
    body("shippingAddress.city").trim().notEmpty(),
    body("shippingAddress.postalCode").trim().notEmpty(),
    body("shippingAddress.country").trim().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { items, shippingAddress } = req.body;

      // Build order items and calculate total from cart data
      let totalPrice = 0;
      const orderItems = [];

      for (const item of items) {
        if (!item.product || !item.name || !item.price || !item.quantity) {
          return res.status(400).json({ message: "Invalid item data" });
        }
        orderItems.push({
          product: String(item.product),
          name: item.name,
          image: item.image || "",
          price: Number(item.price),
          quantity: Number(item.quantity),
        });
        totalPrice += Number(item.price) * Number(item.quantity);
      }

      const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        totalPrice,
      });

      res.status(201).json(order);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// GET /api/orders/my - user's orders
router.get("/my", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!req.user.isAdmin && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/orders (admin) - all orders
router.get("/", auth, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/orders/:id/status (admin)
router.put("/:id/status", auth, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = req.body.status;
    if (req.body.status === "delivered") {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
