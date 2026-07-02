"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-white dark:bg-[#121212] border-t border-gray-200/60 dark:border-gray-800 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
        {/* Brand & Newsletter */}
        <div className="lg:col-span-2 space-y-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-widest text-[#004AC6] uppercase">Royal</span>
            <span className="text-xl font-light tracking-widest text-gray-900 dark:text-white uppercase">Elegance</span>
          </Link>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm leading-relaxed">
            Crafting premium minimal essentials inspired by modern design, classic architecture, and luxury Swiss precision.
          </p>

          <div className="pt-2">
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">Newsletter</p>
            {subscribed ? (
              <p className="text-[#004AC6] text-sm font-semibold">You have subscribed to our seasonal catalogs.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex max-w-md bg-gray-50 dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden focus-within:border-blue-600 focus-within:ring-1 focus-within:ring-blue-600">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent px-4 py-3 text-sm focus:outline-none placeholder:text-gray-400 text-gray-800 dark:text-[#EAEAEA]"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white p-3 flex items-center justify-center transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Links Column 1 */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Collections</h4>
          <ul className="space-y-2 text-sm text-gray-550 dark:text-gray-400">
            <li><Link href="/catalog?category=timepieces" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Luxury Timepieces</Link></li>
            <li><Link href="/catalog?category=audio" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Acoustic Audio</Link></li>
            <li><Link href="/catalog?category=leather" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Leather Goods</Link></li>
            <li><Link href="/catalog?category=eyewear" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Polarized Eyewear</Link></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Support</h4>
          <ul className="space-y-2 text-sm text-gray-550 dark:text-gray-400">
            <li><Link href="/account" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Order Status</Link></li>
            <li><Link href="/support" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Shipping & Returns</Link></li>
            <li><Link href="/faq" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Help Center / FAQ</Link></li>
            <li><Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact Support</Link></li>
          </ul>
        </div>

        {/* Links Column 3 */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Follow Us</h4>
          <div className="flex space-x-3">
            <a
              href="#"
              className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-450 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 rounded-xl transition-all"
              title="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
            </a>
            <a
              href="#"
              className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-455 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 rounded-xl transition-all"
              title="Twitter"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 0 1-2.825.775 4.958 4.958 0 0 0 2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 0 0-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 0 0-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 0 1-2.228-.616v.06a4.923 4.923 0 0 0 3.946 4.827 4.996 4.996 0 0 1-2.212.085 4.936 4.936 0 0 0 4.604 3.417 9.867 9.867 0 0 1-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 0 0 7.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0 0 24 4.59z"/></svg>
            </a>
            <a
              href="#"
              className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-455 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200 rounded-xl transition-all"
              title="Facebook"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 dark:text-gray-500 font-medium">
        <p>&copy; 2026 Royal Elegance Inc. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 sm:mt-0">
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
