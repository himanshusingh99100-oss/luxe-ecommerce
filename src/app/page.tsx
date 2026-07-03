"use client";

import React, { useState, useEffect } from "react";
import { fetchApi } from "../utils/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HeroSlider from "../components/HeroSlider";
import CategoryPills from "../components/CategoryPills";
import ProductCard from "../components/ProductCard";
import FlashSale from "../components/FlashSale";
import BrandStory from "../components/BrandStory";
import Newsletter from "../components/Newsletter";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHomeContent = async () => {
      try {
        setError(null);
        const [bannersRes, categoriesRes, productsRes] = await Promise.all([
          fetchApi("get", "/banners"),
          fetchApi("get", "/categories"),
          fetchApi("get", "/products?limit=8")
        ]);

        setBanners(bannersRes);
        setCategories(categoriesRes);
        setProducts(productsRes.products || productsRes);
      } catch (err) {
        console.error("Failed to load home page catalogs:", err);
        setError("Unable to load premium collections. Please verify your connection and try again.");
      } finally {
        setLoading(false);
      }
    };
    loadHomeContent();
  }, []);

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category?.slug === selectedCategory || p.category?._id === selectedCategory)
    : products;

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121212] text-gray-800 dark:text-[#EAEAEA] flex flex-col justify-between selection:bg-blue-100 dark:selection:bg-blue-950/40">
      <Navbar />

      {/* Hero Visual Area */}
      {!loading && banners.length > 0 && <HeroSlider banners={banners} />}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12 md:py-20 w-full space-y-20">
        
        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/50 rounded-[32px] p-6 text-center text-red-700 dark:text-red-400 font-medium text-sm max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {/* Flash Sale Banner */}
        {!loading && products.length > 0 && (
          <FlashSale products={products.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price)} />
        )}

        {/* Categories Section */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <span className="text-[#004AC6] text-xs font-bold uppercase tracking-widest flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Curated Collections</span>
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-950 dark:text-white mt-2">
                Browse by Category
              </h2>
            </div>

            {!loading && categories.length > 0 && (
              <CategoryPills
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white border border-gray-200/50 rounded-3xl h-80"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-16 text-center">
                  <p className="text-gray-400 font-semibold text-sm">No items found in this collection.</p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Brand story */}
        <BrandStory />

        {/* Newsletter */}
        <Newsletter />
      </main>

      <Footer />
    </div>
  );
}
