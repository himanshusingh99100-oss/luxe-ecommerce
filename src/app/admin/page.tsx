"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { fetchApi } from "../../utils/api";
import { formatDate } from "../../utils/helpers";
import {
  LayoutDashboard,
  ShoppingBag,
  FolderOpen,
  Ticket,
  Image as ImageIcon,
  DollarSign,
  TrendingUp,
  Users,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Eye,
  LogOut,
  Calendar,
  Layers,
  Search,
  ChevronRight,
  Package
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "../../context/CurrencyContext";

export default function AdminDashboard() {
  const { formatPrice } = useCurrency();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"analytics" | "products" | "categories" | "banners" | "coupons" | "orders">("analytics");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for DB contents
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Search/Filter states
  const [prodSearch, setProdSearch] = useState("");

  // CRUD Form Triggers/States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    price: 0,
    compareAtPrice: 0,
    category: "",
    stock: 0,
    images: [""],
    sizes: ["Standard"],
    colorName: "",
    colorHex: ""
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
    image: ""
  });

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [couponForm, setCouponForm] = useState({
    code: "",
    discountType: "percentage",
    discountAmount: 0,
    minOrderAmount: 0,
    expiryDate: "",
    maxUses: 100
  });

  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
    position: "hero"
  });

  const [viewingOrder, setViewingOrder] = useState<any>(null);

  // Load all dashboard contents
  const loadData = async () => {
    setLoading(true);
    try {
      const [analytics, prodsRes, cats, bans, coups, ords] = await Promise.all([
        fetchApi("get", "/analytics/dashboard"),
        fetchApi("get", "/products?limit=100"),
        fetchApi("get", "/categories"),
        fetchApi("get", "/banners"),
        fetchApi("get", "/coupons"),
        fetchApi("get", "/orders")
      ]);

      setAnalyticsData(analytics);
      setProducts(prodsRes.products || prodsRes);
      setCategories(cats);
      setBanners(bans);
      setCoupons(coups);
      setOrders(ords);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch dashboard records. Verify if database is connected.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Basic role verification: normally we check user.role === 'admin'
    // For demo fallbacks, we let guest admin proceed but note profile role
    loadData();
  }, []);

  // PRODUCT CRUD HANDLERS
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: productForm.title,
        description: productForm.description,
        price: Number(productForm.price),
        compareAtPrice: productForm.compareAtPrice ? Number(productForm.compareAtPrice) : undefined,
        category: productForm.category,
        stock: Number(productForm.stock),
        images: productForm.images.filter(Boolean),
        sizes: productForm.sizes,
        colorVariants: productForm.colorName ? [{
          colorName: productForm.colorName,
          colorHex: productForm.colorHex || "#000000",
          imageIndex: 0,
          stock: Number(productForm.stock)
        }] : []
      };

      if (editingProduct) {
        await fetchApi("put", `/products/${editingProduct._id}`, payload);
      } else {
        await fetchApi("post", "/products", payload);
      }

      setShowProductModal(false);
      setEditingProduct(null);
      resetProductForm();
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to save product");
    }
  };

  const handleEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setProductForm({
      title: prod.title,
      description: prod.description,
      price: prod.price,
      compareAtPrice: prod.compareAtPrice || 0,
      category: prod.category?._id || prod.category || "",
      stock: prod.stock,
      images: prod.images.length > 0 ? prod.images : [""],
      sizes: prod.sizes.length > 0 ? prod.sizes : ["Standard"],
      colorName: prod.colorVariants?.[0]?.colorName || "",
      colorHex: prod.colorVariants?.[0]?.colorHex || ""
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await fetchApi("delete", `/products/${id}`);
        loadData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const resetProductForm = () => {
    setProductForm({
      title: "",
      description: "",
      price: 0,
      compareAtPrice: 0,
      category: categories[0]?._id || "",
      stock: 0,
      images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"],
      sizes: ["Standard"],
      colorName: "",
      colorHex: ""
    });
  };

  // CATEGORY CRUD HANDLERS
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await fetchApi("put", `/categories/id/${editingCategory._id}`, categoryForm);
      } else {
        await fetchApi("post", "/categories", categoryForm);
      }
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryForm({ name: "", slug: "", description: "", image: "" });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image: cat.image || ""
    });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await fetchApi("delete", `/categories/id/${id}`);
        loadData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // COUPON CRUD HANDLERS
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await fetchApi("put", `/coupons/${editingCoupon._id}`, couponForm);
      } else {
        await fetchApi("post", "/coupons", couponForm);
      }
      setShowCouponModal(false);
      setEditingCoupon(null);
      setCouponForm({ code: "", discountType: "percentage", discountAmount: 0, minOrderAmount: 0, expiryDate: "", maxUses: 100 });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditCoupon = (coup: any) => {
    setEditingCoupon(coup);
    setCouponForm({
      code: coup.code,
      discountType: coup.discountType,
      discountAmount: coup.discountAmount,
      minOrderAmount: coup.minOrderAmount,
      expiryDate: coup.expiryDate ? new Date(coup.expiryDate).toISOString().split("T")[0] : "",
      maxUses: coup.maxUses || 100
    });
    setShowCouponModal(true);
  };

  const handleDeleteCoupon = async (id: string) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      try {
        await fetchApi("delete", `/coupons/${id}`);
        loadData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // BANNER CRUD HANDLERS
  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await fetchApi("put", `/banners/${editingBanner._id}`, bannerForm);
      } else {
        await fetchApi("post", "/banners", bannerForm);
      }
      setShowBannerModal(false);
      setEditingBanner(null);
      setBannerForm({ title: "", subtitle: "", imageUrl: "", linkUrl: "", position: "hero" });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditBanner = (ban: any) => {
    setEditingBanner(ban);
    setBannerForm({
      title: ban.title,
      subtitle: ban.subtitle || "",
      imageUrl: ban.imageUrl,
      linkUrl: ban.linkUrl || "",
      position: ban.position
    });
    setShowBannerModal(true);
  };

  const handleDeleteBanner = async (id: string) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      try {
        await fetchApi("delete", `/banners/${id}`);
        loadData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // ORDER UPDATE HANDLERS
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await fetchApi("put", `/orders/${orderId}/status`, { orderStatus: status });
      setViewingOrder((prev: any) => (prev ? { ...prev, orderStatus: status } : null));
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Sidebar Items
  const menuItems = [
    { id: "analytics", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products CRUD", icon: ShoppingBag },
    { id: "categories", label: "Categories", icon: FolderOpen },
    { id: "banners", label: "Banners", icon: ImageIcon },
    { id: "coupons", label: "Coupons", icon: Ticket },
    { id: "orders", label: "Orders Manager", icon: Package }
  ];

  if (loading && !analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Entering Executive Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#FAF9F6] dark:bg-[#121212] text-gray-800 dark:text-[#EAEAEA] font-sans selection:bg-blue-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white dark:bg-[#1C1C1E] border-r border-gray-200/80 dark:border-gray-850 p-6 flex flex-col justify-between hidden md:flex sticky top-0 h-screen">
        <div>
          <div className="mb-10 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              E
            </div>
            <span className="text-lg font-bold uppercase tracking-widest text-gray-900 dark:text-white">Elegance</span>
          </div>

          <nav className="space-y-2 bg-transparent">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm bg-transparent ${
                    activeTab === item.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase">
              {user?.name?.substring(0, 2) || "AD"}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name || "Admin Mode"}</p>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium tracking-wide uppercase">{user?.role || "Administrator"}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors font-medium text-sm bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full bg-transparent">
        {/* HEADER */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white capitalize">
              {activeTab === "analytics" ? "Executive Performance" : `${activeTab} Management`}
            </h1>
            <p className="text-gray-500 dark:text-gray-450 text-sm mt-1">
              Admin console to monitor catalog items, discount campaigns, and logistics.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {activeTab === "products" && (
              <button
                onClick={() => {
                  resetProductForm();
                  setEditingProduct(null);
                  setShowProductModal(true);
                }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            )}
            {activeTab === "categories" && (
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ name: "", slug: "", description: "", image: "" });
                  setShowCategoryModal(true);
                }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            )}
            {activeTab === "coupons" && (
              <button
                onClick={() => {
                  setEditingCoupon(null);
                  setCouponForm({ code: "", discountType: "percentage", discountAmount: 0, minOrderAmount: 0, expiryDate: "", maxUses: 100 });
                  setShowCouponModal(true);
                }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Coupon</span>
              </button>
            )}
            {activeTab === "banners" && (
              <button
                onClick={() => {
                  setEditingBanner(null);
                  setBannerForm({ title: "", subtitle: "", imageUrl: "", linkUrl: "", position: "hero" });
                  setShowBannerModal(true);
                }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition-all shadow-sm text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Banner</span>
              </button>
            )}
          </div>
        </header>

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && analyticsData && (
          <div className="space-y-10">
            {/* STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Revenue", val: formatPrice(analyticsData.summary.totalRevenue), icon: DollarSign, color: "text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400" },
                { label: "Total Orders", val: analyticsData.summary.totalOrders, icon: ShoppingBag, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400" },
                { label: "Active Customers", val: analyticsData.summary.totalUsers, icon: Users, color: "text-purple-600 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400" },
                { label: "Products Catalog", val: analyticsData.summary.totalProducts, icon: Layers, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400" }
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-white dark:bg-[#1C1C1E] p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800 shadow-sm dark:shadow-none flex items-center justify-between">
                    <div>
                      <span className="text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</span>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.val}</p>
                    </div>
                    <div className={`p-4 rounded-2xl ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CHARTS GRAPH GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Sales Shares */}
              <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800 shadow-sm dark:shadow-none">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Category Revenue Share</span>
                </h3>
                <div className="space-y-4">
                  {analyticsData.categorySales?.map((item: any, i: number) => (
                    <div key={i} className="space-y-2 bg-transparent">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-gray-700 dark:text-gray-300">{item.categoryName}</span>
                        <span className="text-gray-500 dark:text-gray-400">{item.value}% ({formatPrice(item.revenue)})</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 dark:bg-blue-400 rounded-full"
                          style={{ width: `${item.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white dark:bg-[#1C1C1E] p-6 rounded-2xl border border-gray-200/60 dark:border-gray-800 shadow-sm dark:shadow-none">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Sales Entries</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500 font-semibold">
                        <th className="py-3">Order ID</th>
                        <th className="py-3">Customer</th>
                        <th className="py-3">Date</th>
                        <th className="py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-55 dark:divide-gray-800">
                      {analyticsData.recentOrders?.map((ord: any) => (
                        <tr key={ord._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                          <td className="py-3 font-semibold text-blue-600 dark:text-blue-400">{ord._id.substring(0, 8).toUpperCase()}</td>
                          <td className="py-3">{ord.user?.name || "Guest"}</td>
                          <td className="py-3 text-gray-550 dark:text-gray-400">{new Date(ord.createdAt).toLocaleDateString()}</td>
                          <td className="py-3 text-right font-bold">{formatPrice(ord.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS CRUD TAB */}
        {activeTab === "products" && (
          <div className="bg-white dark:bg-[#1C1C1E] rounded-2xl border border-gray-200/60 dark:border-gray-800 shadow-sm dark:shadow-none overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between gap-4">
              <div className="relative max-w-md w-full bg-transparent">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search catalog products..."
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-400 font-semibold">
                  <tr>
                    <th className="p-6">Product details</th>
                    <th className="py-4">Category</th>
                    <th className="py-4">Price</th>
                    <th className="py-4">Stock</th>
                    <th className="py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products
                    .filter((p) => p.title.toLowerCase().includes(prodSearch.toLowerCase()))
                    .map((prod) => (
                      <tr key={prod._id} className="hover:bg-gray-50/20">
                        <td className="p-6 flex items-center space-x-4">
                          <img
                            src={prod.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100"}
                            alt={prod.title}
                            className="w-12 h-12 object-cover rounded-xl border border-gray-100"
                          />
                          <div>
                            <span className="font-semibold text-gray-900">{prod.title}</span>
                            <div className="flex space-x-2 mt-1">
                              {prod.isFeatured && <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-medium">Featured</span>}
                              {prod.isTrending && <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded-full font-medium">Trending</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-4">{prod.category?.name || "General"}</td>
                        <td className="py-4 font-bold text-gray-900">{formatPrice(prod.price)}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${prod.stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {prod.stock} units
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => handleEditProduct(prod)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(prod._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CATEGORIES MANAGEMENT */}
        {activeTab === "categories" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <div key={cat._id} className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden shadow-sm flex flex-col justify-between">
                <div>
                  <img
                    src={cat.image || "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600"}
                    alt={cat.name}
                    className="w-full h-36 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-950">{cat.name}</h3>
                    <span className="text-gray-400 text-xs mt-1 block">Slug: {cat.slug}</span>
                    <p className="text-gray-500 text-sm mt-3 line-clamp-2">{cat.description || "No description provided."}</p>
                  </div>
                </div>
                <div className="p-6 pt-0 flex justify-end space-x-2 border-t border-gray-50 mt-4">
                  <button
                    onClick={() => handleEditCategory(cat)}
                    className="flex items-center space-x-1.5 text-xs text-blue-600 hover:bg-blue-50 font-bold px-3 py-2 rounded-xl"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat._id)}
                    className="flex items-center space-x-1.5 text-xs text-red-600 hover:bg-red-50 font-bold px-3 py-2 rounded-xl"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BANNERS TAB */}
        {activeTab === "banners" && (
          <div className="space-y-6">
            {banners.map((ban) => (
              <div key={ban._id} className="bg-white rounded-2xl border border-gray-200/60 overflow-hidden shadow-sm flex flex-col md:flex-row gap-6 p-6">
                <img
                  src={ban.imageUrl}
                  alt={ban.title}
                  className="w-full md:w-64 h-36 object-cover rounded-xl border border-gray-100"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg text-gray-950">{ban.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${ban.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {ban.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mt-2">{ban.subtitle}</p>
                    <div className="text-xs text-gray-400 mt-4 space-y-1">
                      <p>Link: <span className="text-blue-500">{ban.linkUrl}</span></p>
                      <p>Position: <span className="capitalize">{ban.position}</span></p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-50">
                    <button
                      onClick={() => handleEditBanner(ban)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs text-blue-600 font-bold hover:bg-blue-50 rounded-xl"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(ban._id)}
                      className="flex items-center space-x-1 px-3 py-1.5 text-xs text-red-600 font-bold hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* COUPONS TAB */}
        {activeTab === "coupons" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coup) => (
              <div key={coup._id} className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full flex items-center justify-center -mr-6 -mt-6"></div>
                
                <div>
                  <span className="text-blue-700 font-mono font-bold tracking-widest text-lg bg-blue-50 border border-blue-100 px-3 py-1 rounded-lg">
                    {coup.code}
                  </span>
                  <div className="mt-6 space-y-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {coup.discountType === "percentage" ? `${coup.discountAmount}% OFF` : `$${coup.discountAmount} OFF`}
                    </p>
                    <p className="text-xs text-gray-400">Min. Order: ${coup.minOrderAmount}</p>
                    <p className="text-xs text-gray-400">Expiry: {new Date(coup.expiryDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleEditCoupon(coup)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCoupon(coup._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ORDERS MANAGEMENT */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-400 font-semibold">
                  <tr>
                    <th className="p-6">Order ID</th>
                    <th className="py-4">Customer</th>
                    <th className="py-4">Method</th>
                    <th className="py-4">Total</th>
                    <th className="py-4">Ship Status</th>
                    <th className="py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-gray-50/20">
                      <td className="p-6 font-mono font-bold text-gray-900">{ord._id.substring(0, 8).toUpperCase()}</td>
                      <td className="py-4">{ord.user?.name || "Guest Customer"}</td>
                      <td className="py-4">{ord.paymentMethod}</td>
                      <td className="py-4 font-bold text-gray-900">{formatPrice(ord.total)}</td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          ord.orderStatus === "Delivered" ? "bg-green-100 text-green-800" :
                          ord.orderStatus === "Shipped" ? "bg-blue-100 text-blue-800" :
                          ord.orderStatus === "Cancelled" ? "bg-red-100 text-red-800" :
                          "bg-amber-100 text-amber-800"
                        }`}>
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => setViewingOrder(ord)}
                            className="flex items-center space-x-1 px-3 py-1.5 text-xs text-blue-600 font-bold hover:bg-blue-50 rounded-xl"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* PRODUCT CREATION/EDIT MODAL */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto border border-gray-100 shadow-xl"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">{editingProduct ? "Update Catalog Entry" : "New Catalog Entry"}</h3>
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Product Title</label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Price ($)</label>
                    <input
                      type="number"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Compare Price</label>
                    <input
                      type="number"
                      value={productForm.compareAtPrice}
                      onChange={(e) => setProductForm({ ...productForm, compareAtPrice: Number(e.target.value) })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Category</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Total Inventory Stock</label>
                    <input
                      type="number"
                      required
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Image URL</label>
                  <input
                    type="text"
                    required
                    value={productForm.images[0]}
                    onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Color Variant Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Cobalt Blue"
                      value={productForm.colorName}
                      onChange={(e) => setProductForm({ ...productForm, colorName: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Color Hex Code</label>
                    <input
                      type="text"
                      placeholder="e.g. #004AC6"
                      value={productForm.colorHex}
                      onChange={(e) => setProductForm({ ...productForm, colorHex: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Product Description</label>
                  <textarea
                    required
                    rows={3}
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  ></textarea>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="px-5 py-2.5 text-sm font-semibold hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm"
                  >
                    Save Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CATEGORY DIALOG */}
      <AnimatePresence>
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-100 shadow-xl"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">{editingCategory ? "Edit Category" : "Add Category"}</h3>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Category Name</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, "-") })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Slug</label>
                  <input
                    type="text"
                    required
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Image URL</label>
                  <input
                    type="text"
                    value={categoryForm.image}
                    onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Description</label>
                  <textarea
                    rows={2}
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="px-4 py-2 text-sm font-semibold hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COUPON DIALOG */}
      <AnimatePresence>
        {showCouponModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-100 shadow-xl"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">{editingCoupon ? "Edit Coupon" : "Add Coupon"}</h3>
              <form onSubmit={handleCouponSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Promo Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. WELCOME20"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Type</label>
                    <select
                      value={couponForm.discountType}
                      onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value as any })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Cash ($)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Discount Amt</label>
                    <input
                      type="number"
                      required
                      value={couponForm.discountAmount}
                      onChange={(e) => setCouponForm({ ...couponForm, discountAmount: Number(e.target.value) })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Min. Order Amount ($)</label>
                  <input
                    type="number"
                    value={couponForm.minOrderAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={couponForm.expiryDate}
                    onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCouponModal(false)}
                    className="px-4 py-2 text-sm font-semibold hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm"
                  >
                    Save Coupon
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BANNER DIALOG */}
      <AnimatePresence>
        {showBannerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full border border-gray-100 shadow-xl"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">{editingBanner ? "Edit Banner" : "Add Banner"}</h3>
              <form onSubmit={handleBannerSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Banner Title</label>
                  <input
                    type="text"
                    required
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Subtitle</label>
                  <input
                    type="text"
                    value={bannerForm.subtitle}
                    onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Image URL</label>
                  <input
                    type="text"
                    required
                    value={bannerForm.imageUrl}
                    onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Link URL</label>
                    <input
                      type="text"
                      value={bannerForm.linkUrl}
                      onChange={(e) => setBannerForm({ ...bannerForm, linkUrl: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase">Position</label>
                    <select
                      value={bannerForm.position}
                      onChange={(e) => setBannerForm({ ...bannerForm, position: e.target.value as any })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                    >
                      <option value="hero">Hero Slider</option>
                      <option value="side">Side Banner</option>
                      <option value="promo">Promo Footer</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBannerModal(false)}
                    className="px-4 py-2 text-sm font-semibold hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm"
                  >
                    Save Banner
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INSPECT ORDER MODAL */}
      <AnimatePresence>
        {viewingOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-xl w-full border border-gray-100 shadow-xl"
            >
              <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Order: #{viewingOrder._id.substring(0, 8).toUpperCase()}</h3>
                  <p className="text-xs text-gray-400 mt-1">Placed on {formatDate(viewingOrder.createdAt)}</p>
                </div>
                <button
                  onClick={() => setViewingOrder(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {/* Status Toggles */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-600">Order Logistics Status:</span>
                  <div className="flex gap-2">
                    {["Processing", "Shipped", "Delivered", "Cancelled"].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateOrderStatus(viewingOrder._id, st)}
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-all ${
                          viewingOrder.orderStatus === st
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cart Contents</h4>
                  <div className="space-y-2 border border-gray-100 rounded-2xl p-4 bg-gray-50/20">
                    {viewingOrder.orderItems?.map((item: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <div>
                          <p className="font-semibold text-gray-900">{item.title}</p>
                          <span className="text-[10px] text-gray-400 font-medium">Qty: {item.quantity} | {item.color} | {item.size}</span>
                        </div>
                        <span className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Shipping Address</h4>
                  <div className="text-sm border border-gray-100 rounded-2xl p-4 bg-gray-50/20 space-y-1">
                    <p className="font-bold text-gray-900">{viewingOrder.shippingAddress.name}</p>
                    <p>{viewingOrder.shippingAddress.street}</p>
                    <p>{viewingOrder.shippingAddress.city}, {viewingOrder.shippingAddress.state} {viewingOrder.shippingAddress.postalCode}</p>
                    <p>{viewingOrder.shippingAddress.country}</p>
                    <p className="text-xs text-gray-400 font-medium mt-1">Phone: {viewingOrder.shippingAddress.phone}</p>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-2 border-t border-gray-100 pt-4 text-sm font-medium">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal:</span>
                    <span>{formatPrice(viewingOrder.subtotal)}</span>
                  </div>
                  {viewingOrder.discount > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Discount Coupon:</span>
                      <span>-{formatPrice(viewingOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping:</span>
                    <span>{formatPrice(viewingOrder.shippingCharges)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-100 pt-2">
                    <span>Grand Total:</span>
                    <span className="text-blue-600">{formatPrice(viewingOrder.total)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
