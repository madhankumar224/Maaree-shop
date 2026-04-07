const express = require("express");
const nodemailer = require("nodemailer");
const { body, validationResult } = require("express-validator");

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("subject").trim().notEmpty().withMessage("Subject is required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, email, subject, message } = req.body;

    try {
      await transporter.sendMail({
        from: `"Maaree Contact Form" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
        replyTo: email,
        subject: `Contact: ${subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #C07A5E;">New Contact Form Message</h2>
            <hr style="border: 1px solid #F5EDE4;" />
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr style="border: 1px solid #F5EDE4;" />
            <h3>Message:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
            <hr style="border: 1px solid #F5EDE4;" />
            <p style="color: #999; font-size: 12px;">Sent from Maaree Contact Form</p>
          </div>
        `,
      });

      res.json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Email send error:", error);
      res.status(500).json({ message: "Failed to send email. Please try again." });
    }
  }
);

module.exports = router;
