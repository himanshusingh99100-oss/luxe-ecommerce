import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Inject token into headers automatically
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Local DB Keys
const PRODUCTS_KEY = "premium_mock_products";
const CATEGORIES_KEY = "premium_mock_categories";
const ORDERS_KEY = "premium_mock_orders";
const BANNERS_KEY = "premium_mock_banners";
const COUPONS_KEY = "premium_mock_coupons";
const MOCK_USERS_KEY = "premium_ecommerce_mock_users";

// Helper for check server connection
export const isServerOnline = async (): Promise<boolean> => {
  try {
    await axios.get(`${API_URL}/banners`, { timeout: 1000 });
    return true;
  } catch (error: any) {
    return false;
  }
};

// Initial Mock Seed Data
const INITIAL_CATEGORIES = [
  { _id: "cat-1", name: "Timepieces", slug: "timepieces", description: "Mechanical mastery and Swiss quartz precision.", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80" },
  { _id: "cat-2", name: "Audio Systems", slug: "audio", description: "Studio-fidelity wireless ANC playback.", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80" },
  { _id: "cat-3", name: "Leather Goods", slug: "leather", description: "Slim minimalist full-grain accessories.", image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80" },
  { _id: "cat-4", name: "Eyewear", slug: "eyewear", description: "UV400 polarized frames with acetate finish.", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80" }
];

const INITIAL_PRODUCTS = [
  {
    _id: "prod-1",
    title: "Chrono Classic Onyx",
    description: "Swiss quartz movement, sapphire double dome glass, and premium black leather strap.",
    price: 349.0,
    compareAtPrice: 420.0,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"],
    category: { _id: "cat-1", name: "Timepieces", slug: "timepieces" },
    stock: 25,
    colorVariants: [
      { colorName: "Onyx Black", colorHex: "#111111", imageIndex: 0, stock: 15 },
      { colorName: "Silver Mist", colorHex: "#CCCCCC", imageIndex: 0, stock: 10 }
    ],
    sizes: ["40mm", "42mm"],
    ratings: 4.8,
    numReviews: 12,
    specifications: [
      { name: "Movement", value: "Swiss Quartz" },
      { name: "Glass", value: "Sapphire Crystal" }
    ],
    isFeatured: true,
    isTrending: true
  },
  {
    _id: "prod-2",
    title: "Aura ANC Studio Headphones",
    description: "40mm custom electrodynamic drivers, hybrid active noise cancellation, 40h battery.",
    price: 299.0,
    compareAtPrice: 380.0,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80"],
    category: { _id: "cat-2", name: "Audio Systems", slug: "audio" },
    stock: 40,
    colorVariants: [
      { colorName: "Pure White", colorHex: "#FFFFFF", imageIndex: 0, stock: 20 },
      { colorName: "Titanium Grey", colorHex: "#555555", imageIndex: 0, stock: 20 }
    ],
    sizes: ["Standard"],
    ratings: 4.9,
    numReviews: 28,
    specifications: [
      { name: "Frequency", value: "10Hz - 22,000Hz" },
      { name: "Battery Life", value: "40 Hours" }
    ],
    isFeatured: true,
    isTrending: false
  },
  {
    _id: "prod-3",
    title: "Minimalist Slim Wallet",
    description: "Anodized aluminium frame wrapped in full-grain leather, supporting up to 12 RFID-protected cards.",
    price: 79.0,
    compareAtPrice: 95.0,
    images: ["https://images.unsplash.com/photo-1627123596236-e5d222af7a20?w=600&auto=format&fit=crop&q=80"],
    category: { _id: "cat-3", name: "Leather Goods", slug: "leather" },
    stock: 10,
    colorVariants: [
      { colorName: "Cognac Brown", colorHex: "#8B5A2B", imageIndex: 0, stock: 5 },
      { colorName: "Carbon Black", colorHex: "#222222", imageIndex: 0, stock: 5 }
    ],
    sizes: ["Slim"],
    ratings: 4.7,
    numReviews: 45,
    specifications: [
      { name: "Capacity", value: "1-12 Cards" },
      { name: "Security", value: "RFID Blocking" }
    ],
    isFeatured: false,
    isTrending: true
  },
  {
    _id: "prod-4",
    title: "Polarized Classic Sunglasses",
    description: "Hand-assembled acetate frames with uv400 scratch-resistant polarized lenses.",
    price: 159.0,
    compareAtPrice: 199.0,
    images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80"],
    category: { _id: "cat-4", name: "Eyewear", slug: "eyewear" },
    stock: 0, // Out of stock to test UI notifications
    colorVariants: [
      { colorName: "Tortoise Amber", colorHex: "#A0522D", imageIndex: 0, stock: 0 }
    ],
    sizes: ["Medium", "Large"],
    ratings: 4.6,
    numReviews: 18,
    specifications: [
      { name: "Frame", value: "Acetate" },
      { name: "Lenses", value: "Polarized UV400" }
    ],
    isFeatured: false,
    isTrending: false
  }
];

const INITIAL_BANNERS = [
  { _id: "ban-1", title: "Chrono Onyx Edition", subtitle: "Swiss quartz precision. Minimal elegance.", imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1600&auto=format&fit=crop&q=80", linkUrl: "/products/prod-1", position: "hero", isActive: true },
  { _id: "ban-2", title: "Aura Studio Sound", subtitle: "Zero ambient noise. Immense audio clarity.", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80", linkUrl: "/products/prod-2", position: "hero", isActive: true }
];

const INITIAL_COUPONS = [
  { _id: "cou-1", code: "LUXURY10", discountType: "percentage", discountAmount: 10, minOrderAmount: 100, expiryDate: "2028-12-31", isActive: true },
  { _id: "cou-2", code: "WELCOME50", discountType: "fixed", discountAmount: 50, minOrderAmount: 200, expiryDate: "2028-12-31", isActive: true }
];

// LocalStorage helpers to initialize mock tables
export const initMockDb = () => {
  if (typeof window !== "undefined") {
    if (!localStorage.getItem(PRODUCTS_KEY)) localStorage.setItem(PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
    if (!localStorage.getItem(CATEGORIES_KEY)) localStorage.setItem(CATEGORIES_KEY, JSON.stringify(INITIAL_CATEGORIES));
    if (!localStorage.getItem(BANNERS_KEY)) localStorage.setItem(BANNERS_KEY, JSON.stringify(INITIAL_BANNERS));
    if (!localStorage.getItem(COUPONS_KEY)) localStorage.setItem(COUPONS_KEY, JSON.stringify(INITIAL_COUPONS));
    if (!localStorage.getItem(ORDERS_KEY)) localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
  }
};

// Curated premium images for DummyJSON categories to ensure high-end aesthetics
const CATEGORY_IMAGES: Record<string, string> = {
  "mens-watches": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
  "womens-watches": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=80",
  "womens-jewellery": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80",
  "sunglasses": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80",
  "smartphones": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
  "laptops": "https://images.unsplash.com/photo-1496181130204-755241524eab?w=600&auto=format&fit=crop&q=80",
  "fragrances": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=80",
  "skin-care": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
  "beauty": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80",
  "furniture": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80",
  "home-decoration": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80",
  "mens-shirts": "https://images.unsplash.com/photo-1620012253295-c05cb1e7420b?w=600&auto=format&fit=crop&q=80",
  "womens-dresses": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80",
  "mens-shoes": "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
  "womens-shoes": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80"
};

// Maps DummyJSON product schema to the frontend's custom luxury eCommerce schema
const mapDummyProduct = (p: any) => {
  const compareAtPrice = p.discountPercentage > 0
    ? Number((p.price / (1 - p.discountPercentage / 100)).toFixed(2))
    : undefined;

  const categoryObj = typeof p.category === "string"
    ? {
        _id: p.category,
        name: p.category.charAt(0).toUpperCase() + p.category.slice(1).replace(/-/g, " "),
        slug: p.category
      }
    : p.category;

  const mappedReviews = p.reviews?.map((r: any, idx: number) => ({
    _id: `rev-${p.id}-${idx}`,
    name: r.reviewerName || "Anonymous Customer",
    rating: r.rating || 5,
    title: r.rating >= 4 ? "Excellent Quality" : "Average product",
    comment: r.comment || "",
    createdAt: r.date || new Date().toISOString()
  })) || [];

  return {
    _id: String(p.id),
    title: p.title,
    description: p.description,
    price: p.price,
    compareAtPrice,
    images: p.images && p.images.length > 0 ? p.images : [p.thumbnail],
    category: categoryObj,
    stock: p.stock,
    brand: p.brand || "Luxury Brand",
    ratings: p.rating || 5,
    numReviews: mappedReviews.length,
    colorVariants: [
      { colorName: "Onyx Black", colorHex: "#111111", imageIndex: 0, stock: p.stock > 0 ? Math.ceil(p.stock / 2) : 0 },
      { colorName: "Silver Mist", colorHex: "#CCCCCC", imageIndex: 0, stock: p.stock > 0 ? Math.floor(p.stock / 2) : 0 }
    ],
    sizes: p.category === "apparel" || p.category === "shoes" ? ["S", "M", "L", "XL"] : ["Standard"],
    specifications: [
      { name: "Brand", value: p.brand || "Luxury Brand" },
      { name: "Warranty", value: p.warrantyInformation || "1 Year Warranty" },
      { name: "Shipping", value: p.shippingInformation || "Ships in 3-5 days" }
    ],
    reviews: mappedReviews,
    isFeatured: p.rating > 4.5,
    isTrending: p.discountPercentage > 10
  };
};

// Intercept Axios calls with custom fallbacks if server offline
export const fetchApi = async (method: "get" | "post" | "put" | "delete", url: string, data?: any) => {
  initMockDb();

  // --- DUMMYJSON API INTERCEPTOR ---
  if (url.startsWith("/products") || url.startsWith("/categories")) {
    try {
      if (url.startsWith("/categories")) {
        const response = await axios.get("https://dummyjson.com/products/categories");
        const rawCats = response.data;
        const mappedCats = rawCats.map((c: any) => {
          if (typeof c === "string") {
            const name = c.charAt(0).toUpperCase() + c.slice(1).replace(/-/g, " ");
            const image = CATEGORY_IMAGES[c] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";
            return { _id: c, name, slug: c, description: `${name} collections.`, image };
          } else {
            const slug = c.slug || "";
            const name = c.name || (slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " "));
            const image = CATEGORY_IMAGES[slug] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";
            return { _id: slug, name, slug, description: `${name} collections.`, image };
          }
        });
        return mappedCats;
      }

      if (url.startsWith("/products")) {
        const singleMatch = url.match(/\/products\/([a-zA-Z0-9-]+)$/);
        const reviewMatch = url.match(/\/products\/([a-zA-Z0-9-]+)\/reviews$/);

        if (reviewMatch) {
          const prodId = reviewMatch[1];
          const localReviewsKey = `dummy_reviews_${prodId}`;
          const localReviews = JSON.parse(localStorage.getItem(localReviewsKey) || "[]");
          const newReview = {
            _id: `rev-${Date.now()}`,
            name: data.name || "Customer",
            rating: Number(data.rating),
            title: data.title || "Review",
            comment: data.comment,
            createdAt: new Date().toISOString()
          };
          localReviews.push(newReview);
          localStorage.setItem(localReviewsKey, JSON.stringify(localReviews));
          return { message: "Review submitted successfully", review: newReview };
        }

        if (singleMatch) {
          const prodId = singleMatch[1];
          const response = await axios.get(`https://dummyjson.com/products/${prodId}`);
          const mappedProd = mapDummyProduct(response.data);
          
          const localReviewsKey = `dummy_reviews_${prodId}`;
          const localReviews = JSON.parse(localStorage.getItem(localReviewsKey) || "[]");
          mappedProd.reviews = [...localReviews, ...mappedProd.reviews];
          mappedProd.numReviews = mappedProd.reviews.length;
          
          return { product: mappedProd, reviews: mappedProd.reviews };
        }

        // GET /products with query parsing
        const searchParams = new URLSearchParams(url.includes("?") ? url.split("?")[1] : "");
        const limit = searchParams.get("limit") || "100";
        const category = searchParams.get("category");
        const search = searchParams.get("search");

        let dummyUrl = "https://dummyjson.com/products";
        if (search) {
          dummyUrl = `https://dummyjson.com/products/search?q=${encodeURIComponent(search)}&limit=${limit}`;
        } else if (category) {
          dummyUrl = `https://dummyjson.com/products/category/${category}?limit=${limit}`;
        } else {
          dummyUrl = `https://dummyjson.com/products?limit=${limit}`;
        }

        const response = await axios.get(dummyUrl);
        const rawProducts = response.data.products || [];
        let mappedList = rawProducts.map(mapDummyProduct);

        // Multi-field local search safety to guarantee matches on title OR brand
        if (search) {
          const queryLower = search.toLowerCase();
          mappedList = mappedList.filter((p: any) => 
            p.title.toLowerCase().includes(queryLower) || 
            (p.brand && p.brand.toLowerCase().includes(queryLower))
          );
        }

        // Filter category locally if both parameters were present
        if (search && category) {
          mappedList = mappedList.filter((p: any) => p.category?.slug === category);
        }

        return { products: mappedList };
      }
    } catch (apiError) {
      console.error("DummyJSON API Error, falling back to local fallback:", apiError);
      // Allow it to fall back to the offline simulation tables below
    }
  }

  const online = await isServerOnline();
  if (online) {
    const config = { method, url, data };
    const response = await api(config);
    return response.data;
  }

  // FALLBACK SIMULATION ENGINE
  console.warn(`[Offline Fallback] Simulating ${method.toUpperCase()} ${url}`);
  
  const getTable = (key: string) => JSON.parse(localStorage.getItem(key) || "[]");
  const saveTable = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

  // --- PRODUCTS ---
  if (url.startsWith("/products")) {
    const products = getTable(PRODUCTS_KEY);
    
    // GET single product: /products/:id
    const singleMatch = url.match(/\/products\/([a-zA-Z0-9-]+)$/);
    if (method === "get" && singleMatch) {
      const prodId = singleMatch[1];
      const prod = products.find((p: any) => p._id === prodId);
      if (!prod) throw new Error("Product not found");
      return { product: prod, reviews: [] };
    }

    // POST review: /products/:id/reviews
    const reviewMatch = url.match(/\/products\/([a-zA-Z0-9-]+)\/reviews$/);
    if (method === "post" && reviewMatch) {
      const prodId = reviewMatch[1];
      const prodIndex = products.findIndex((p: any) => p._id === prodId);
      if (prodIndex === -1) throw new Error("Product not found");
      
      const newReview = {
        _id: `rev-${Date.now()}`,
        name: data.name || "Customer",
        rating: Number(data.rating),
        title: data.title || "",
        comment: data.comment,
        createdAt: new Date().toISOString()
      };
      
      // Recalculate rating
      const oldRatingsSum = products[prodIndex].ratings * products[prodIndex].numReviews;
      products[prodIndex].numReviews += 1;
      products[prodIndex].ratings = parseFloat(((oldRatingsSum + newReview.rating) / products[prodIndex].numReviews).toFixed(1));
      
      saveTable(PRODUCTS_KEY, products);
      return { message: "Review submitted successfully", review: newReview };
    }

    // Admin CRUD: POST /products
    if (method === "post") {
      const newProd = {
        _id: `prod-${Date.now()}`,
        ...data,
        ratings: 0,
        numReviews: 0
      };
      const cats = getTable(CATEGORIES_KEY);
      const categoryObj = cats.find((c: any) => c._id === newProd.category) || { name: "General", slug: "general" };
      newProd.category = categoryObj;
      
      products.push(newProd);
      saveTable(PRODUCTS_KEY, products);
      return newProd;
    }

    // Admin CRUD: PUT /products/:id
    const putMatch = url.match(/\/products\/([a-zA-Z0-9-]+)$/);
    if (method === "put" && putMatch) {
      const prodId = putMatch[1];
      const idx = products.findIndex((p: any) => p._id === prodId);
      if (idx === -1) throw new Error("Product not found");

      const cats = getTable(CATEGORIES_KEY);
      const categoryObj = data.category ? (cats.find((c: any) => c._id === data.category) || products[idx].category) : products[idx].category;
      
      products[idx] = {
        ...products[idx],
        ...data,
        category: categoryObj
      };
      saveTable(PRODUCTS_KEY, products);
      return products[idx];
    }

    // Admin CRUD: DELETE /products/:id
    const delMatch = url.match(/\/products\/([a-zA-Z0-9-]+)$/);
    if (method === "delete" && delMatch) {
      const prodId = delMatch[1];
      const filtered = products.filter((p: any) => p._id !== prodId);
      saveTable(PRODUCTS_KEY, filtered);
      return { message: "Product removed" };
    }

    // GET products listing (with pagination, filters, search)
    if (method === "get") {
      let filtered = [...products];
      
      // Simple Search Mock
      const search = new URLSearchParams(url.split("?")[1] || "").get("search");
      if (search) {
        filtered = filtered.filter(
          (p: any) => p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())
        );
      }

      // Category filter Mock
      const catSlug = new URLSearchParams(url.split("?")[1] || "").get("category");
      if (catSlug) {
        filtered = filtered.filter((p: any) => p.category.slug === catSlug || p.category._id === catSlug);
      }

      return {
        products: filtered,
        page: 1,
        pages: 1,
        total: filtered.length
      };
    }
  }

  // --- CATEGORIES ---
  if (url.startsWith("/categories")) {
    const categories = getTable(CATEGORIES_KEY);

    if (method === "get") {
      return categories;
    }

    if (method === "post") {
      const newCat = {
        _id: `cat-${Date.now()}`,
        ...data
      };
      categories.push(newCat);
      saveTable(CATEGORIES_KEY, categories);
      return newCat;
    }

    // Category CRUD
    const catIdMatch = url.match(/\/categories\/id\/([a-zA-Z0-9-]+)$/);
    if (catIdMatch) {
      const catId = catIdMatch[1];
      if (method === "put") {
        const idx = categories.findIndex((c: any) => c._id === catId);
        if (idx !== -1) {
          categories[idx] = { ...categories[idx], ...data };
          saveTable(CATEGORIES_KEY, categories);
          return categories[idx];
        }
      }
      if (method === "delete") {
        const filtered = categories.filter((c: any) => c._id !== catId);
        saveTable(CATEGORIES_KEY, filtered);
        return { message: "Category deleted" };
      }
    }
  }

  // --- BANNERS ---
  if (url.startsWith("/banners")) {
    const banners = getTable(BANNERS_KEY);
    if (method === "get") return banners;
    if (method === "post") {
      const b = { _id: `ban-${Date.now()}`, ...data, isActive: true };
      banners.push(b);
      saveTable(BANNERS_KEY, banners);
      return b;
    }
    const banIdMatch = url.match(/\/banners\/([a-zA-Z0-9-]+)$/);
    if (banIdMatch) {
      const banId = banIdMatch[1];
      if (method === "put") {
        const idx = banners.findIndex((b: any) => b._id === banId);
        if (idx !== -1) {
          banners[idx] = { ...banners[idx], ...data };
          saveTable(BANNERS_KEY, banners);
          return banners[idx];
        }
      }
      if (method === "delete") {
        const filtered = banners.filter((b: any) => b._id !== banId);
        saveTable(BANNERS_KEY, filtered);
        return { message: "Banner deleted" };
      }
    }
  }

  // --- COUPONS ---
  if (url.startsWith("/coupons")) {
    const coupons = getTable(COUPONS_KEY);
    
    if (url.includes("/apply") && method === "post") {
      const { code, cartAmount } = data;
      const found = coupons.find((c: any) => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
      if (!found) throw new Error("Invalid or inactive coupon code");
      if (cartAmount < found.minOrderAmount) {
        throw new Error(`Minimum order of $${found.minOrderAmount} required`);
      }
      return found;
    }

    if (method === "get") return coupons;
    if (method === "post") {
      const c = { _id: `cou-${Date.now()}`, ...data, code: data.code.toUpperCase(), isActive: true, usedCount: 0 };
      coupons.push(c);
      saveTable(COUPONS_KEY, coupons);
      return c;
    }
    const coupIdMatch = url.match(/\/coupons\/([a-zA-Z0-9-]+)$/);
    if (coupIdMatch) {
      const coupId = coupIdMatch[1];
      if (method === "put") {
        const idx = coupons.findIndex((c: any) => c._id === coupId);
        if (idx !== -1) {
          coupons[idx] = { ...coupons[idx], ...data };
          saveTable(COUPONS_KEY, coupons);
          return coupons[idx];
        }
      }
      if (method === "delete") {
        const filtered = coupons.filter((c: any) => c._id !== coupId);
        saveTable(COUPONS_KEY, filtered);
        return { message: "Coupon deleted" };
      }
    }
  }

  // --- ORDERS ---
  if (url.startsWith("/orders")) {
    const orders = getTable(ORDERS_KEY);

    if (url.includes("/myorders") && method === "get") {
      const userStr = localStorage.getItem("user");
      const userId = userStr ? JSON.parse(userStr)._id : null;
      return orders.filter((o: any) => o.user === userId || o.user?._id === userId);
    }

    if (method === "get") {
      return orders;
    }

    if (method === "post") {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : { _id: "guest-id", name: "Guest" };
      
      const newOrder = {
        _id: `ord-${Date.now()}`,
        user: user,
        orderItems: data.orderItems,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentMethod === "COD" ? "Pending" : "Paid",
        orderStatus: "Processing",
        subtotal: data.orderItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0),
        discount: data.discount || 0,
        shippingCharges: data.shippingCharges || 0,
        total: data.orderItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0) - (data.discount || 0) + (data.shippingCharges || 0),
        createdAt: new Date().toISOString(),
        paymentId: data.paymentId || `mock-pay-${Date.now()}`
      };

      orders.unshift(newOrder);
      saveTable(ORDERS_KEY, orders);

      // Reduce local product stock
      const products = getTable(PRODUCTS_KEY);
      data.orderItems.forEach((item: any) => {
        const idx = products.findIndex((p: any) => p._id === item.product);
        if (idx !== -1) {
          products[idx].stock = Math.max(0, products[idx].stock - item.quantity);
        }
      });
      saveTable(PRODUCTS_KEY, products);

      return newOrder;
    }

    // Status updates
    const ordStatusMatch = url.match(/\/orders\/([a-zA-Z0-9-]+)\/status$/);
    if (ordStatusMatch && method === "put") {
      const ordId = ordStatusMatch[1];
      const idx = orders.findIndex((o: any) => o._id === ordId);
      if (idx !== -1) {
        orders[idx].orderStatus = data.orderStatus || orders[idx].orderStatus;
        orders[idx].paymentStatus = data.paymentStatus || orders[idx].paymentStatus;
        saveTable(ORDERS_KEY, orders);
        return orders[idx];
      }
    }
  }

  // --- ANALYTICS ---
  if (url.startsWith("/analytics")) {
    const orders = getTable(ORDERS_KEY);
    const products = getTable(PRODUCTS_KEY);
    const categories = getTable(CATEGORIES_KEY);
    const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || "[]");

    const totalRevenue = orders.reduce((sum: number, o: any) => (o.paymentStatus === "Paid" ? sum + o.total : sum), 0);
    
    // Group monthly (simplified)
    const monthlySales = [
      { name: "Jul 2026", sales: parseFloat(totalRevenue.toFixed(2)), orders: orders.length }
    ];

    // Group categories
    const categorySales = categories.map((cat: any) => {
      const catOrders = orders.filter((o: any) => o.orderItems.some((item: any) => {
        const prod = products.find((p: any) => p._id === item.product);
        return prod && (prod.category.slug === cat.slug || prod.category._id === cat._id);
      }));
      
      const rev = catOrders.reduce((sum: number, o: any) => sum + o.total, 0);
      return {
        categoryName: cat.name,
        revenue: rev,
        quantity: catOrders.length,
        value: totalRevenue > 0 ? parseFloat(((rev * 100) / totalRevenue).toFixed(2)) : 0
      };
    });

    return {
      summary: {
        totalRevenue,
        totalOrders: orders.length,
        totalUsers: users.length,
        totalProducts: products.length,
        totalCategories: categories.length
      },
      monthlySales,
      categorySales,
      bestsellingProducts: [],
      recentOrders: orders.slice(0, 5)
    };
  }

  throw new Error("Local mock route not defined");
};

export default api;
