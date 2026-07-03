"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import { ShoppingBag, User, Heart, Search, Menu, X, ShieldAlert, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useCurrency, SUPPORTED_CURRENCIES } from "../context/CurrencyContext";

export default function Navbar() {
  const { user } = useAuth();
  const { cartItems } = useCart();
  const { wishlist } = useWishlist();
  
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrencyByCode } = useCurrency();
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
          scrolled
            ? "bg-white/80 dark:bg-[#121212]/85 backdrop-blur-md shadow-sm dark:shadow-none border-b border-gray-100 dark:border-gray-800 py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-widest text-[#004AC6] uppercase">Royal</span>
            <span className="text-xl font-light tracking-widest text-gray-900 dark:text-white uppercase">Elegance</span>
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Link href="/" className="hover:text-gray-950 dark:hover:text-white transition-colors">Home</Link>
            <Link href="/catalog" className="hover:text-gray-950 dark:hover:text-white transition-colors">Catalog</Link>
            <Link href="/cart" className="hover:text-gray-950 dark:hover:text-white transition-colors">Cart</Link>
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 px-3 py-1 rounded-xl flex items-center space-x-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
            {/* Currency Selector */}
            <div className="relative hidden md:block">
              <select
                value={currency.code}
                onChange={(e) => setCurrencyByCode(e.target.value)}
                className="bg-transparent border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 rounded-xl px-2 py-1.5 focus:outline-none cursor-pointer"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="text-gray-900 bg-white dark:bg-[#1e1e1e] dark:text-[#EAEAEA]">
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-450 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all hidden md:block"
              aria-label="Toggle Theme"
            >
              {mounted && theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-gray-600 dark:text-gray-450 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-xl transition-all"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              href="/account"
              className="p-2 text-gray-600 dark:text-gray-350 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-850/50 rounded-xl transition-all relative hidden sm:block"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </Link>

            <Link
              href="/cart"
              className="p-2 text-gray-600 dark:text-gray-350 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-850/50 rounded-xl transition-all relative flex items-center"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#004AC6] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </Link>

            <Link
              href="/account"
              className="p-2 text-gray-600 dark:text-gray-350 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-855/50 rounded-xl transition-all flex items-center hidden sm:block"
            >
              <User className="w-5 h-5" />
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-350 hover:text-gray-950 dark:hover:text-white hover:bg-gray-100/50 dark:hover:bg-gray-855/50 rounded-xl transition-all md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* SEARCH OVERLAY */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-20 px-6">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="bg-white dark:bg-[#1C1C1E] rounded-3xl p-6 max-w-xl w-full border border-gray-100 dark:border-gray-800 shadow-2xl dark:shadow-none relative"
            >
              <div className="flex items-center space-x-3 border-b border-gray-100 dark:border-gray-800 pb-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-base focus:outline-none placeholder:text-gray-400 font-medium text-gray-800 dark:text-[#EAEAEA] bg-transparent"
                  autoFocus
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1 hover:bg-gray-150 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="mt-4 flex justify-end">
                <Link
                  href={`/catalog?search=${searchQuery}`}
                  onClick={() => setSearchOpen(false)}
                  className="bg-blue-600 text-white font-semibold text-xs px-4 py-2 rounded-xl"
                >
                  Search Catalog
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="bg-white dark:bg-[#1C1C1E] w-72 h-full z-10 p-6 flex flex-col justify-between border-l border-gray-100 dark:border-gray-800 shadow-xl"
            >
              <div>
                <div className="flex justify-between items-center mb-8">
                  <span className="font-bold text-sm tracking-wider uppercase text-gray-900 dark:text-white">Navigation</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <nav className="space-y-4 flex flex-col font-medium text-lg text-gray-800 dark:text-[#EAEAEA]">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 transition-colors">Home</Link>
                  <Link href="/catalog" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 transition-colors">Catalog Shop</Link>
                  <Link href="/cart" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 transition-colors">My Cart</Link>
                  <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 transition-colors">My Account</Link>
                  {user?.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 px-4 py-2.5 rounded-2xl flex items-center space-x-2 text-base font-bold"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}
                </nav>
              </div>

              {/* Preferences inside mobile drawer */}
              <div className="border-t border-gray-150 dark:border-gray-800 pt-4 mt-4 space-y-3">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Preferences</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Theme mode</span>
                  <button
                    onClick={toggleTheme}
                    className="px-3 py-1.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center text-xs font-bold uppercase focus:outline-none"
                  >
                    {mounted && theme === "dark" ? <Sun className="w-3.5 h-3.5 mr-1" /> : <Moon className="w-3.5 h-3.5 mr-1" />}
                    <span>{mounted ? theme : "light"}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Currency</span>
                  <select
                    value={currency.code}
                    onChange={(e) => setCurrencyByCode(e.target.value)}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.symbol} {c.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-gray-150 dark:border-gray-800 pt-6">
                <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase mb-1">Signed in as</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name || "Guest Session"}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
