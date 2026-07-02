"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import { useCart } from "../../hooks/useCart";
import { fetchApi } from "../../utils/api";
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "../../context/CurrencyContext";

export default function CartPage() {
  const { formatPrice } = useCurrency();
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discount,
    shippingCharges,
    subtotal,
    total
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Load recommended products
  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const res = await fetchApi("get", "/products?limit=4");
        setRecommendations(res.products || res);
      } catch (err) {
        console.error(err);
      }
    };
    loadRecommendations();
  }, []);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);
    if (!couponCode) return;
    try {
      const msg = await applyCoupon(couponCode);
      setCouponSuccess(msg);
      setCouponCode("");
    } catch (err: any) {
      setCouponError(err.message || "Failed to apply coupon");
    }
  };

  // Shipping progress math
  const freeShippingLimit = 150;
  const progressPercent = Math.min(100, (subtotal / freeShippingLimit) * 100);
  const neededForFreeShipping = Math.max(0, freeShippingLimit - subtotal);

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121212] text-gray-800 dark:text-[#EAEAEA] flex flex-col justify-between selection:bg-blue-100 pb-20 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-24 md:py-32 w-full space-y-16">
        <div>
          <span className="text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-widest block">Your Selection</span>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mt-2">Shopping Bag</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 rounded-[32px] p-8 space-y-6 max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg text-gray-950 dark:text-white">Your Cart is Empty</h3>
              <p className="text-gray-400 text-sm">Explore our curated catalog collections and discover premium essentials.</p>
            </div>
            <Link
              href="/catalog"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-2xl inline-block shadow-lg shadow-blue-600/10"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Free Shipping Progress bar */}
              <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 p-6 rounded-3xl shadow-sm dark:shadow-none space-y-3">
                <div className="flex justify-between text-xs md:text-sm font-semibold text-gray-850 dark:text-gray-200">
                  {neededForFreeShipping > 0 ? (
                    <p>Add <span className="text-[#004AC6] dark:text-blue-400 font-bold">{formatPrice(neededForFreeShipping)}</span> more for complimentary shipping</p>
                  ) : (
                    <p className="text-green-700 dark:text-green-400 font-bold flex items-center space-x-1">
                      <span>✓ You qualify for complimentary shipping</span>
                    </p>
                  )}
                  <span className="text-gray-400">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Items Container with animation */}
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {cartItems.map((item) => (
                    <motion.div
                      key={`${item.product}-${item.color}-${item.size}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 p-6 rounded-3xl shadow-sm dark:shadow-none flex flex-col sm:flex-row gap-6 items-center justify-between"
                    >
                      <div className="flex items-center space-x-4 self-start sm:self-center">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-20 h-20 object-cover rounded-2xl border border-gray-100 dark:border-gray-800"
                        />
                        <div>
                          <h3 className="font-bold text-sm md:text-base text-gray-900 dark:text-[#EAEAEA] leading-snug">{item.title}</h3>
                          <div className="flex flex-wrap gap-x-3 text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-1">
                            {item.color && <span>Color: {item.color}</span>}
                            {item.size && <span>Size: {item.size}</span>}
                          </div>
                          <p className="text-sm font-bold text-gray-909 dark:text-white mt-2">{formatPrice(item.price)}</p>
                        </div>
                      </div>

                      {/* Quantity Controls & Trash */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-100 dark:border-gray-850">
                        <div className="flex border border-gray-250 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-800 max-w-[110px] w-full">
                          <button
                            onClick={() => updateQuantity(item.product, item.quantity - 1, item.color, item.size)}
                            className="px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold focus:outline-none text-xs text-gray-700 dark:text-gray-300"
                          >
                            -
                          </button>
                          <span className="w-full text-center py-1.5 font-bold text-xs self-center text-gray-800 dark:text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product, item.quantity + 1, item.color, item.size)}
                            className="px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold focus:outline-none text-xs text-gray-700 dark:text-gray-300"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex items-center space-x-4">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">{formatPrice(item.price * item.quantity)}</span>
                          <button
                            onClick={() => removeFromCart(item.product, item.color, item.size)}
                            className="p-2 text-gray-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Column: Summary Card */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Order Summary */}
              <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 p-6 md:p-8 rounded-3xl shadow-sm dark:shadow-none space-y-6">
                <h3 className="font-bold text-lg text-gray-950 dark:text-white">Summary</h3>
                
                <div className="space-y-3 text-sm font-medium">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal:</span>
                    <span className="text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
                  </div>
                  
                  {appliedCoupon && (
                    <div className="flex justify-between text-blue-600 dark:text-blue-400 items-center">
                      <div className="flex items-center space-x-1.5">
                        <span>Coupon ({appliedCoupon.code}):</span>
                        <button onClick={removeCoupon} className="text-xs text-red-500 hover:underline">Remove</button>
                      </div>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-500">Shipping:</span>
                    <span className="text-gray-900 dark:text-white">{shippingCharges > 0 ? formatPrice(shippingCharges) : "Complimentary"}</span>
                  </div>

                  <div className="flex justify-between text-base font-bold text-gray-900 dark:text-white border-t border-gray-100 dark:border-gray-805 pt-4">
                    <span>Total:</span>
                    <span className="text-blue-600 dark:text-blue-400 text-lg">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Checkout Trigger */}
                <Link
                  href="/checkout"
                  className="w-full bg-[#004AC6] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/10 hover:scale-[1.01] transition-all block text-center"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center space-x-2 justify-center text-xs text-gray-400 font-semibold tracking-wide uppercase pt-2">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>Secure SSL Checkout</span>
                </div>
              </div>

              {/* Coupon Form */}
              <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 p-6 rounded-3xl shadow-sm dark:shadow-none space-y-4">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white font-semibold">Promo Campaign Code</h4>
                
                <form onSubmit={handleApplyCoupon} className="flex bg-gray-50 dark:bg-gray-800 border border-gray-250 dark:border-gray-700 rounded-2xl overflow-hidden focus-within:border-blue-600">
                  <input
                    type="text"
                    placeholder="Enter Code (e.g. LUXURY10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full bg-transparent px-4 py-3 text-xs focus:outline-none placeholder:text-gray-400 font-semibold text-gray-800 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 text-white font-bold text-xs uppercase tracking-wider px-4 py-3"
                  >
                    Apply
                  </button>
                </form>

                {couponError && <p className="text-red-650 text-xs font-semibold">{couponError}</p>}
                {couponSuccess && <p className="text-green-700 text-xs font-semibold">{couponSuccess}</p>}
              </div>

            </div>
          </div>
        )}

        {/* RECOMMENDED PRODUCTS */}
        {recommendations.length > 0 && (
          <section className="space-y-8 pt-10">
            <h2 className="text-2xl font-bold tracking-tight text-gray-950 dark:text-white pb-4 border-b border-gray-150 dark:border-gray-800">
              Recommended Essentials
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* MOBILE STICKY CHECKOUT BUTTON */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full z-45 bg-white/95 dark:bg-[#1C1C1E]/95 backdrop-blur-md border-t border-gray-150 dark:border-gray-800 p-4 flex gap-4 md:hidden shadow-lg dark:shadow-none items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cart Total</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">{formatPrice(total)}</span>
          </div>
          <Link
            href="/checkout"
            className="bg-[#004AC6] text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl flex items-center space-x-1.5 focus:outline-none shadow-md shadow-blue-200 dark:shadow-none"
          >
            <span>Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      <Footer />
    </div>
  );
}
