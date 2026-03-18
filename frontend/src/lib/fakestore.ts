import type { Product } from "./api";

const BASE = "https://dummyjson.com";

interface DummyProduct {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
  reviews?: { rating: number; comment: string; reviewerName: string }[];
}

function mapProduct(p: DummyProduct): Product {
  // Capitalize category nicely
  const cat = p.category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    _id: String(p.id),
    name: p.title,
    description: p.description,
    price: p.price,
    image: p.thumbnail,
    category: cat,
    countInStock: p.stock,
    rating: Math.round(p.rating * 10) / 10,
    numReviews: p.reviews?.length ?? Math.floor(Math.random() * 80) + 5,
  };
}

export const fakeStoreAPI = {
  getAll: async (params?: Record<string, string>) => {
    const limit = parseInt(params?.limit || "12");
    const page = parseInt(params?.page || "1");
    const skip = (page - 1) * limit;
    const search = params?.search || "";
    const category = params?.category || "";
    const sort = params?.sort || "newest";

    let url: string;

    if (search) {
      url = `${BASE}/products/search?q=${encodeURIComponent(search)}&limit=${limit}&skip=${skip}`;
    } else if (category) {
      url = `${BASE}/products/category/${encodeURIComponent(category.toLowerCase().replace(/ /g, "-"))}?limit=${limit}&skip=${skip}`;
    } else {
      url = `${BASE}/products?limit=${limit}&skip=${skip}`;
    }

    // Add sorting
    if (sort === "price_asc") {
      url += `&sortBy=price&order=asc`;
    } else if (sort === "price_desc") {
      url += `&sortBy=price&order=desc`;
    } else if (sort === "rating") {
      url += `&sortBy=rating&order=desc`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch products");
    const data = await res.json();

    const products: Product[] = (data.products || []).map(mapProduct);
    const total: number = data.total || products.length;
    const pages = Math.ceil(total / limit);

    return { products, pages, total };
  },

  getById: async (id: string) => {
    const res = await fetch(`${BASE}/products/${id}`);
    if (!res.ok) throw new Error("Product not found");
    const data: DummyProduct = await res.json();
    return mapProduct(data);
  },

  getCategories: async () => {
    const res = await fetch(`${BASE}/products/category-list`);
    if (!res.ok) throw new Error("Failed to fetch categories");
    const cats: string[] = await res.json();
    // Return nicely formatted category names (limit to popular ones)
    return cats.slice(0, 12).map((c: string) =>
      c.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    );
  },
};
