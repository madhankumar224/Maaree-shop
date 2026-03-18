"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { chatbotAPI } from "@/lib/api";
import { fakeStoreAPI } from "@/lib/fakestore";
import { useApp } from "@/lib/store";
import type { Product } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "bot";
  text?: string;
  products?: Product[];
  order?: {
    _id: string;
    status: string;
    totalPrice: number;
    items: { name: string; quantity: number; price: number }[];
    createdAt: string;
  };
  suggestions?: string[];
}

const FAQ: Record<string, string> = {
  shipping:
    "We offer free standard shipping on orders over $50. Standard delivery takes 5-7 business days. Express shipping (2-3 days) is available for $9.99.",
  return:
    "You can return any item within 30 days of delivery for a full refund. Items must be in original condition with tags attached. Start a return from your Orders page.",
  payment:
    "We accept Visa, Mastercard, American Express, PayPal, and Apple Pay. All transactions are secured with 256-bit SSL encryption.",
  delivery:
    "Standard delivery: 5-7 business days. Express delivery: 2-3 business days. Same-day delivery is available in select cities for orders placed before 12 PM.",
  contact:
    "You can reach us at support@maaree.com or call 1-800-MAAREE (1-800-622-733). Our support team is available Mon-Fri, 9 AM - 6 PM EST.",
};

const SUGGESTIONS = ["Top Deals", "New Arrivals", "Track Order", "Contact Support"];

export default function ChatBot() {
  const { addToCart, openProductModal } = useApp();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hasOpened, setHasOpened] = useState(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing, scrollToBottom]);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const addMessage = useCallback((msg: Omit<Message, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }]);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    if (!hasOpened) {
      setHasOpened(true);
      addMessage({
        role: "bot",
        text: "Hi \u{1F44B} Welcome to our store! How can I help you today?",
        suggestions: SUGGESTIONS,
      });
    }
  };

  const parseIntent = (text: string) => {
    const lower = text.toLowerCase().trim();

    // Order tracking
    const orderMatch = lower.match(/(?:track|order|status)\s*(?:#?\s*)([a-f0-9]{4,24})/i);
    if (orderMatch) return { type: "track" as const, orderId: orderMatch[1] };
    if (lower.match(/track|order status|where.?s my order/)) return { type: "track_prompt" as const };

    // FAQ
    if (lower.match(/ship|shipping|delivery time|how long/)) return { type: "faq" as const, topic: "shipping" };
    if (lower.match(/return|refund|exchange/)) return { type: "faq" as const, topic: "return" };
    if (lower.match(/pay|payment|credit card|visa|paypal/)) return { type: "faq" as const, topic: "payment" };
    if (lower.match(/deliver|delivery|when.*arrive|arrival/)) return { type: "faq" as const, topic: "delivery" };
    if (lower.match(/contact|support|help|email|phone|call/)) return { type: "faq" as const, topic: "contact" };

    // Recommendations
    if (lower.match(/recommend|suggest|best|top pick|popular/)) {
      const catMatch = lower.match(/(?:for|in)\s+(\w+(?:\s+\w+)?)/);
      return { type: "recommend" as const, category: catMatch?.[1] || "" };
    }

    // Quick suggestions
    if (lower === "top deals" || lower.match(/deal|sale|discount|cheap|budget/))
      return { type: "deals" as const };
    if (lower === "new arrivals" || lower.match(/new|latest|newest|recent|just in/))
      return { type: "new_arrivals" as const };

    // Price-based search
    const priceUnder = lower.match(/under\s*\$?\s*(\d+)/);
    const priceRange = lower.match(/(\d+)\s*(?:to|-)\s*\$?\s*(\d+)/);

    // Product search (default)
    const searchParams: { q?: string; minPrice?: string; maxPrice?: string; category?: string } = {};

    // Extract price constraints
    if (priceUnder) {
      searchParams.maxPrice = priceUnder[1];
    } else if (priceRange) {
      searchParams.minPrice = priceRange[1];
      searchParams.maxPrice = priceRange[2];
    }

    // Clean search query - remove price parts and common filler words
    let query = lower
      .replace(/under\s*\$?\s*\d+/g, "")
      .replace(/\d+\s*(?:to|-)\s*\$?\s*\d+/g, "")
      .replace(/\$\d+/g, "")
      .replace(/(?:show|find|get|search|i want|i need|i'm looking for|looking for|show me|give me)\s*/g, "")
      .replace(/(?:a |an |the |some |any )/g, "")
      .trim();

    if (query) searchParams.q = query;

    if (searchParams.q || searchParams.minPrice || searchParams.maxPrice) {
      return { type: "search" as const, params: searchParams };
    }

    // Greeting
    if (lower.match(/^(hi|hello|hey|good morning|good evening|howdy|sup)/))
      return { type: "greeting" as const };

    if (lower.match(/^(thank|thanks|thx)/))
      return { type: "thanks" as const };

    return { type: "unknown" as const };
  };

  const processMessage = async (text: string) => {
    addMessage({ role: "user", text });
    setInput("");
    setTyping(true);

    const intent = parseIntent(text);

    try {
      switch (intent.type) {
        case "search": {
          // Try DummyJSON API first (since that's the main product source)
          const data = await fakeStoreAPI.getAll({
            search: intent.params.q || "",
            limit: "6",
          });
          let products = data.products;

          // Apply price filters client-side
          if (intent.params.maxPrice) {
            products = products.filter((p) => p.price <= Number(intent.params.maxPrice));
          }
          if (intent.params.minPrice) {
            products = products.filter((p) => p.price >= Number(intent.params.minPrice));
          }

          if (products.length > 0) {
            addMessage({
              role: "bot",
              text: `I found ${products.length} product${products.length > 1 ? "s" : ""} for you:`,
              products,
            });
          } else {
            addMessage({
              role: "bot",
              text: "Sorry, I couldn't find any products matching your search. Try different keywords or browse our categories!",
              suggestions: ["Top Deals", "New Arrivals"],
            });
          }
          break;
        }

        case "recommend": {
          const data = await fakeStoreAPI.getAll({
            search: intent.category || "",
            limit: "6",
            sort: "rating",
          });
          if (data.products.length > 0) {
            addMessage({
              role: "bot",
              text: intent.category
                ? `Here are top recommendations for "${intent.category}":`
                : "Here are our top-rated products:",
              products: data.products,
            });
          } else {
            addMessage({
              role: "bot",
              text: "I couldn't find specific recommendations. Here's what's popular:",
              suggestions: ["Top Deals", "New Arrivals"],
            });
          }
          break;
        }

        case "deals": {
          const data = await fakeStoreAPI.getAll({ limit: "6", sort: "price_asc" });
          addMessage({
            role: "bot",
            text: "Here are our best deals right now:",
            products: data.products,
          });
          break;
        }

        case "new_arrivals": {
          const data = await fakeStoreAPI.getAll({ limit: "6" });
          addMessage({
            role: "bot",
            text: "Check out our newest arrivals:",
            products: data.products,
          });
          break;
        }

        case "track": {
          try {
            const order = await chatbotAPI.trackOrder(intent.orderId);
            addMessage({
              role: "bot",
              text: "Here's your order status:",
              order: {
                _id: order._id,
                status: order.status,
                totalPrice: order.totalPrice,
                items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
                createdAt: order.createdAt,
              },
            });
          } catch {
            addMessage({
              role: "bot",
              text: `I couldn't find an order with ID "${intent.orderId}". Please double-check and try again.`,
            });
          }
          break;
        }

        case "track_prompt": {
          addMessage({
            role: "bot",
            text: "Please provide your order ID. For example: \"Track my order abc123\"",
          });
          break;
        }

        case "faq": {
          addMessage({
            role: "bot",
            text: FAQ[intent.topic] || "I can help with shipping, returns, payments, and delivery. What would you like to know?",
          });
          break;
        }

        case "greeting": {
          addMessage({
            role: "bot",
            text: "Hello! I'm here to help you shop. You can ask me to find products, track orders, or answer questions about shipping and returns.",
            suggestions: SUGGESTIONS,
          });
          break;
        }

        case "thanks": {
          addMessage({
            role: "bot",
            text: "You're welcome! Let me know if there's anything else I can help with.",
            suggestions: SUGGESTIONS,
          });
          break;
        }

        default: {
          addMessage({
            role: "bot",
            text: "Sorry, I didn't understand that. Can you rephrase your question? You can ask me to search for products, track orders, or answer FAQs.",
            suggestions: SUGGESTIONS,
          });
        }
      }
    } catch {
      addMessage({
        role: "bot",
        text: "Oops! Something went wrong. Please try again in a moment.",
        suggestions: SUGGESTIONS,
      });
    } finally {
      setTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    processMessage(input.trim());
  };

  const handleSuggestion = (suggestion: string) => {
    processMessage(suggestion);
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      quantity: 1,
      countInStock: product.countInStock,
    });
    addMessage({
      role: "bot",
      text: `"${product.name}" has been added to your cart!`,
    });
  };

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-terracotta text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center group"
          aria-label="Open chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {/* Pulse animation */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse border-2 border-white" />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-32px)] h-[560px] max-h-[calc(100vh-48px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-warm-border animate-[slideUp_0.3s_ease-out]"
        >
          {/* Header */}
          <div className="bg-terracotta text-white px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm">MAAREE Assistant</h3>
                <p className="text-[11px] text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full inline-block" />
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#faf9f7]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] ${msg.role === "user" ? "" : ""}`}>
                  {/* Text bubble */}
                  {msg.text && (
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                        msg.role === "user"
                          ? "bg-terracotta text-white rounded-br-md"
                          : "bg-white text-warm-text shadow-sm border border-warm-border/50 rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                  )}

                  {/* Product cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {msg.products.map((product) => (
                        <div
                          key={product._id}
                          className="bg-white rounded-xl border border-warm-border/50 shadow-sm overflow-hidden flex gap-3 p-2.5"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg shrink-0 cursor-pointer hover:opacity-80 transition"
                            onClick={() => openProductModal(product._id)}
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-[12px] font-medium text-warm-text truncate cursor-pointer hover:text-terracotta transition"
                              onClick={() => openProductModal(product._id)}
                            >
                              {product.name}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-yellow-500 text-[11px]">{"★".repeat(Math.round(product.rating))}</span>
                              <span className="text-[10px] text-warm-muted">{product.rating}</span>
                            </div>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[13px] font-bold text-terracotta">${product.price.toFixed(2)}</span>
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="text-[10px] bg-terracotta text-white px-2.5 py-1 rounded-full hover:bg-terracotta/90 transition font-medium"
                              >
                                Add to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Order tracking card */}
                  {msg.order && (
                    <div className="mt-2 bg-white rounded-xl border border-warm-border/50 shadow-sm p-3.5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-warm-muted">
                          Order #{msg.order._id.slice(-8).toUpperCase()}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full capitalize ${
                            statusColor[msg.order.status] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {msg.order.status}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {msg.order.items.map((item, i) => (
                          <div key={i} className="flex justify-between text-[12px]">
                            <span className="text-warm-text truncate mr-2">
                              {item.name} x{item.quantity}
                            </span>
                            <span className="text-warm-muted shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-warm-border/50 mt-2 pt-2 flex justify-between">
                        <span className="text-[12px] font-semibold text-warm-text">Total</span>
                        <span className="text-[12px] font-bold text-terracotta">${msg.order.totalPrice.toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] text-warm-muted mt-1.5">
                        Ordered on {new Date(msg.order.createdAt).toLocaleDateString("en-US", {
                          year: "numeric", month: "short", day: "numeric",
                        })}
                      </p>

                      {/* Status timeline */}
                      <div className="flex items-center gap-1 mt-3">
                        {["pending", "processing", "shipped", "delivered"].map((step, i) => {
                          const steps = ["pending", "processing", "shipped", "delivered"];
                          const currentIdx = steps.indexOf(msg.order!.status);
                          const isActive = i <= currentIdx;
                          const isCancelled = msg.order!.status === "cancelled";
                          return (
                            <div key={step} className="flex items-center flex-1">
                              <div
                                className={`w-3 h-3 rounded-full shrink-0 ${
                                  isCancelled
                                    ? "bg-red-300"
                                    : isActive
                                    ? "bg-terracotta"
                                    : "bg-gray-200"
                                }`}
                              />
                              {i < 3 && (
                                <div
                                  className={`flex-1 h-0.5 ${
                                    isCancelled
                                      ? "bg-red-200"
                                      : i < currentIdx
                                      ? "bg-terracotta"
                                      : "bg-gray-200"
                                  }`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-1">
                        {["Pending", "Processing", "Shipped", "Delivered"].map((label) => (
                          <span key={label} className="text-[8px] text-warm-muted">{label}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick suggestions */}
                  {msg.suggestions && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {msg.suggestions.map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSuggestion(s)}
                          className="text-[11px] px-3 py-1.5 rounded-full border border-terracotta/30 text-terracotta hover:bg-terracotta hover:text-white transition-colors font-medium"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-warm-border/50">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-warm-muted/60 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-warm-muted/60 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-warm-muted/60 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-warm-border bg-white shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 text-[13px] px-4 py-2.5 rounded-full bg-[#f5f3f0] border-none outline-none focus:ring-2 focus:ring-terracotta/30 placeholder:text-warm-muted/60 text-warm-text"
                disabled={typing}
              />
              <button
                type="submit"
                disabled={typing || !input.trim()}
                className="w-9 h-9 bg-terracotta text-white rounded-full flex items-center justify-center hover:bg-terracotta/90 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                aria-label="Send message"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

    </>
  );
}
