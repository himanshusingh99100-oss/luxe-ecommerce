"use client";

import React, { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { fetchApi } from "@/utils/api";
import { SlidersHorizontal, ArrowUpDown, Search, Grid, List, X, ShoppingBag, Heart, ShieldAlert } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import Link from "next/link";
import { useCurrency } from "@/context/CurrencyContext";

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();

  // Search parameters from URL
  const querySearch = searchParams.get("search") || "";
  const queryCategory = searchParams.get("category") || "";

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [searchVal, setSearchVal] = useState(querySearch);
  const [activeCategory, setActiveCategory] = useState(queryCategory);
  const [sortOption, setSortOption] = useState("default");
  const [priceRange, setPriceRange] = useState(2000);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    setSearchVal(querySearch);
  }, [querySearch]);

  useEffect(() => {
    setActiveCategory(queryCategory);
  }, [queryCategory]);

  // Fetch initial catalog data
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const catData = await fetchApi("get", "/categories");
        setCategories(catData);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };
    loadCategories();
  }, []);

  // Fetch products whenever filters or search parameters change
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        let endpoint = "/products?limit=50";
        if (activeCategory) {
          endpoint += `&category=${activeCategory}`;
        }
        if (searchVal) {
          endpoint += `&search=${encodeURIComponent(searchVal)}`;
        }
        const data = await fetchApi("get", endpoint);
        
        let list = data.products || data;

        // Apply price client filter if needed
        list = list.filter((p: any) => p.price <= priceRange);

        // Apply sorting
        if (sortOption === "price-low") {
          list = [...list].sort((a, b) => a.price - b.price);
        } else if (sortOption === "price-high") {
          list = [...list].sort((a, b) => b.price - a.price);
        } else if (sortOption === "rating") {
          list = [...list].sort((a, b) => b.ratings - a.ratings);
        }

        setProducts(list);
      } catch (err) {
        console.error("Failed to load products:", err);
        setError("We are experiencing issues fetching products from the luxury catalog. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [activeCategory, searchVal, sortOption, priceRange]);

  const handleClearFilters = () => {
    setSearchVal("");
    setActiveCategory("");
    setSortOption("default");
    setPriceRange(2000);
    router.push("/catalog");
  };

  const handleCategorySelect = (slug: string) => {
    setActiveCategory(slug);
    router.push(slug ? `/catalog?category=${slug}` : "/catalog");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121212] text-gray-800 dark:text-[#EAEAEA] flex flex-col justify-between selection:bg-blue-100 dark:selection:bg-blue-950/40">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-24 md:py-32 w-full space-y-8">
        
        {/* Banner Section */}
        <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 rounded-[32px] p-8 md:p-12 shadow-sm dark:shadow-none relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-3 max-w-lg">
            <span className="text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-widest block">Collection Catalogue</span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-955 dark:text-white">Luxury Essentials</h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Discover carefully curated, minimal items designed for comfort, utility, and modern luxury.
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full border border-blue-100 dark:border-blue-900/50 flex items-center space-x-1">
            <span>{products.length} Products Found</span>
          </div>
        </div>

        {/* Toolbar controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-150 dark:border-gray-800 pb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-2xl flex items-center space-x-2 text-xs font-bold uppercase tracking-wider focus:outline-none"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
            <div className="relative hidden md:block w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search catalog..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-white rounded-2xl pl-11 pr-4 py-3 text-xs focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-2xl px-3 py-2">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
              >
                <option value="default">Default Sort</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>

            <div className="hidden sm:flex border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden bg-white dark:bg-[#1C1C1E]">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2.5 focus:outline-none ${viewMode === "grid" ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2.5 focus:outline-none ${viewMode === "list" ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
          
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block space-y-8 bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 p-6 rounded-[32px] shadow-sm dark:shadow-none">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-sm text-gray-955 dark:text-white uppercase tracking-wider">Catalog Filters</h3>
              <button onClick={handleClearFilters} className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                Reset All
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Category</h4>
              <div className="space-y-1.5">
                <button
                  onClick={() => handleCategorySelect("")}
                  className={`w-full text-left py-1 text-xs font-semibold hover:text-[#004AC6] transition-colors block ${
                    !activeCategory ? "text-[#004AC6]" : "text-gray-550 dark:text-gray-400"
                  }`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => handleCategorySelect(cat.slug || cat._id)}
                    className={`w-full text-left py-1 text-xs font-semibold hover:text-[#004AC6] transition-colors block ${
                      activeCategory === cat.slug || activeCategory === cat._id
                        ? "text-[#004AC6]"
                        : "text-gray-555 dark:text-gray-400"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                <span>Max Price</span>
                <span className="text-gray-900 dark:text-white font-bold">{formatPrice(priceRange)}</span>
              </div>
              <input
                type="range"
                min="10"
                max="2000"
                step="50"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-1 bg-gray-150 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </aside>

          {/* Catalog Listing */}
          <div className="lg:col-span-3">
            {error ? (
              <div className="text-center py-20 bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 rounded-[32px] p-6 max-w-md mx-auto space-y-4">
                <ShieldAlert className="w-8 h-8 text-red-500 mx-auto" />
                <h3 className="font-bold text-lg text-gray-950 dark:text-white">API Load Failure</h3>
                <p className="text-gray-450 text-xs leading-relaxed">
                  {error}
                </p>
                <button
                  onClick={() => router.refresh()}
                  className="bg-blue-600 text-white text-xs font-bold uppercase tracking-wider py-3 px-5 rounded-2xl shadow-sm"
                >
                  Retry Loading
                </button>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 rounded-3xl animate-pulse"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 rounded-[32px] p-6 max-w-md mx-auto space-y-4">
                <Search className="w-8 h-8 text-gray-300 mx-auto" />
                <h3 className="font-bold text-lg text-gray-950 dark:text-white">No items found</h3>
                <p className="text-gray-450 text-xs leading-relaxed">
                  Try adjusting filters or clearing your search queries to see more items.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="bg-blue-600 text-white text-xs font-bold uppercase tracking-wider py-3 px-5 rounded-2xl shadow-sm"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {products.map((p) => (
                  <div key={p._id} className={viewMode === "list" ? "bg-white dark:bg-[#1C1C1E] p-4 rounded-3xl border border-gray-150 dark:border-gray-800 flex justify-between items-center shadow-sm dark:shadow-none" : ""}>
                    {viewMode === "list" ? (
                      <>
                        <Link href={`/products/${p._id}`} className="flex gap-4 items-center flex-1">
                          <img src={p.images?.[0]} alt="" className="w-20 h-20 object-cover rounded-2xl border dark:border-gray-800 flex-shrink-0" />
                          <div className="space-y-1">
                            <h3 className="font-bold text-sm text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{p.title}</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{p.category?.name || "Collection"}</p>
                            <p className="text-sm font-bold text-gray-950 dark:text-white">{formatPrice(p.price)}</p>
                          </div>
                        </Link>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <button
                            onClick={() => toggleWishlist(p._id)}
                            className={`p-2.5 rounded-xl border transition-all ${
                              isInWishlist(p._id)
                                ? "bg-red-550 border-red-550 text-white"
                                : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-400 hover:text-red-550 hover:bg-red-50/50"
                            }`}
                          >
                            <Heart className="w-4 h-4" />
                          </button>
                          {p.stock > 0 ? (
                            <button
                              onClick={() => addToCart({
                                product: p._id,
                                title: p.title,
                                image: p.images[0],
                                price: p.price,
                                quantity: 1,
                                maxStock: p.stock
                              })}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl flex items-center space-x-1"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-2.5 py-1.5 rounded-xl border border-red-100 dark:border-red-900/50 uppercase">Sold Out</span>
                          )}
                        </div>
                      </>
                    ) : (
                      <ProductCard product={p} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filters Slide-over Menu */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 flex justify-start lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="bg-[#FAF9F6] dark:bg-[#121212] w-80 h-full z-10 p-6 flex flex-col justify-between border-r border-gray-150 dark:border-gray-800 shadow-xl overflow-y-auto relative"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-sm tracking-wider uppercase text-gray-900 dark:text-white">Catalog Filters</h3>
                  <button onClick={() => setShowMobileFilters(false)} className="p-1 hover:bg-gray-150 dark:hover:bg-gray-800 rounded-lg">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="relative w-full">
                  <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search catalog..."
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    className="w-full bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 text-gray-850 dark:text-white rounded-2xl pl-11 pr-4 py-3 text-xs focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>

                {/* Categories */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Category</h4>
                  <div className="space-y-1.5 bg-white dark:bg-[#1C1C1E] p-4 rounded-2xl border border-gray-200/60 dark:border-gray-800">
                    <button
                      onClick={() => handleCategorySelect("")}
                      className={`w-full text-left py-1 text-xs font-semibold block ${
                        !activeCategory ? "text-[#004AC6]" : "text-gray-550 dark:text-gray-400"
                      }`}
                    >
                      All Products
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => handleCategorySelect(cat.slug || cat._id)}
                        className={`w-full text-left py-1 text-xs font-semibold block ${
                          activeCategory === cat.slug || activeCategory === cat._id
                            ? "text-[#004AC6]"
                            : "text-gray-550 dark:text-gray-400"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    <span>Max Price</span>
                    <span className="text-gray-900 dark:text-white font-bold">{formatPrice(priceRange)}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="2000"
                    step="50"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full h-1 bg-gray-150 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </div>

              <div className="border-t border-gray-150 dark:border-gray-800 pt-6 flex gap-3">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 font-bold text-xs uppercase py-3.5 rounded-xl bg-white dark:bg-gray-800"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 bg-blue-600 text-white font-bold text-xs uppercase py-3.5 rounded-xl"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
