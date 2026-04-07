const https = require("https");

/**
 * SMS Notification Service
 *
 * Supports two providers:
 *   1. Twilio  (international, recommended) — set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 *   2. Fast2SMS (India only, free tier)     — set FAST2SMS_API_KEY
 *
 * If neither is configured, SMS is silently skipped (logged to console).
 */

// ─── Twilio ──────────────────────────────────────────────
function sendViaTwilio(to, message) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  const payload = new URLSearchParams({ To: to, From: from, Body: message }).toString();

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.twilio.com",
        path: `/2010-04-01/Accounts/${sid}/Messages.json`,
        method: "POST",
        headers: {
          Authorization: "Basic " + Buffer.from(`${sid}:${token}`).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              console.log("[SMS/Twilio] Sent to", to, "SID:", parsed.sid);
              resolve(parsed);
            } else {
              console.error("[SMS/Twilio] Error:", parsed.message);
              reject(new Error(parsed.message || "Twilio SMS failed"));
            }
          } catch {
            reject(new Error("Failed to parse Twilio response"));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

// ─── Fast2SMS (India) ────────────────────────────────────
function sendViaFast2SMS(phone, message) {
  const cleaned = phone.replace(/\D/g, "").replace(/^91/, "");

  const payload = JSON.stringify({
    route: "q",
    message,
    language: "english",
    flash: 0,
    numbers: cleaned,
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "www.fast2sms.com",
        path: "/dev/bulkV2",
        method: "POST",
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.return === true) {
              console.log("[SMS/Fast2SMS] Sent to", cleaned);
              resolve(parsed);
            } else {
              console.error("[SMS/Fast2SMS] Error:", parsed.message);
              reject(new Error(parsed.message || "Fast2SMS failed"));
            }
          } catch {
            reject(new Error("Failed to parse Fast2SMS response"));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

// ─── Unified send ────────────────────────────────────────
function sendSMS(phone, message) {
  // Ensure phone has country code for Twilio
  let normalized = phone.replace(/[\s\-()]/g, "");
  if (!normalized.startsWith("+")) {
    normalized = "+91" + normalized.replace(/^91/, ""); // default to India
  }

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    return sendViaTwilio(normalized, message);
  }

  if (process.env.FAST2SMS_API_KEY) {
    return sendViaFast2SMS(phone, message);
  }

  console.warn("[SMS] No SMS provider configured — skipping SMS to", normalized);
  console.warn("[SMS] Set TWILIO_* or FAST2SMS_API_KEY in .env to enable");
  return Promise.resolve({ skipped: true });
}

// ─── Pre-built messages ──────────────────────────────────
function sendLoginAlert(phone, userName) {
  const time = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const message = `Maaree Login Alert: Hi ${userName}, your account was logged into at ${time}. If this wasn't you, please secure your account immediately.`;
  return sendSMS(phone, message);
}

function sendWelcomeSMS(phone, userName) {
  const message = `Welcome to Maaree, ${userName}! Your account has been created successfully. Happy shopping!`;
  return sendSMS(phone, message);
}

function sendOrderSMS(phone, userName, orderId, total) {
  const message = `Hi ${userName}, your Maaree order #${orderId.slice(-8)} for Rs.${total} has been placed successfully! Track it in your account.`;
  return sendSMS(phone, message);
}

module.exports = { sendSMS, sendLoginAlert, sendWelcomeSMS, sendOrderSMS };
