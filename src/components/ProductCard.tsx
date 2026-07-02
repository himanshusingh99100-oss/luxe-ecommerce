"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import { getDiscountPercentage } from "../utils/helpers";
import { ShoppingBag, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useCurrency } from "../context/CurrencyContext";

interface ProductCardProps {
  product: {
    _id: string;
    title: string;
    price: number;
    compareAtPrice?: number;
    images: string[];
    category?: { name: string; slug: string };
    stock: number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();

  const discount = getDiscountPercentage(product.price, product.compareAtPrice);
  const inWishlist = isInWishlist(product._id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      product: product._id,
      title: product.title,
      image: product.images[0],
      price: product.price,
      quantity: 1,
      maxStock: product.stock
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group relative bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl dark:hover:shadow-none transition-all duration-500 flex flex-col justify-between"
    >
      {/* Visual Header */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-gray-900">
        <Link href={`/products/${product._id}`}>
          <img
            src={product.images[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        </Link>

        {/* Badges */}
        {discount > 0 && (
          <span className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full shadow-sm">
            {discount}% OFF
          </span>
        )}

        {product.stock === 0 && (
          <span className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full shadow-sm">
            Out of Stock
          </span>
        )}

        {/* Wishlist toggle */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product._id);
          }}
          className={`absolute top-4 right-4 p-2.5 rounded-full border shadow-sm transition-all focus:outline-none ${
            inWishlist
              ? "bg-red-550 border-red-550 text-white"
              : "bg-white/85 dark:bg-gray-800/85 border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-red-550 hover:bg-white dark:hover:bg-gray-850"
          }`}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? "fill-current" : ""}`} />
        </button>

        {/* Add shortcut drawer */}
        {product.stock > 0 && (
          <div className="absolute bottom-4 left-4 right-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={handleQuickAdd}
              className="w-full bg-white/95 dark:bg-[#2C2C2E]/95 backdrop-blur-xs text-gray-900 dark:text-white font-semibold text-xs py-3 rounded-2xl flex items-center justify-center space-x-1.5 shadow-md hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all focus:outline-none border border-transparent dark:border-gray-800"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Quick Add to Cart</span>
            </button>
          </div>
        )}
      </div>

      {/* Info Body */}
      <div className="p-6">
        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest block">
          {product.category?.name || "General"}
        </span>
        <Link href={`/products/${product._id}`} className="mt-2 block">
          <h3 className="font-bold text-sm md:text-base text-gray-900 dark:text-[#F3F4F6] group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
            {product.title}
          </h3>
        </Link>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-base font-bold text-gray-950 dark:text-white">{formatPrice(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-gray-400 dark:text-gray-550 line-through font-medium">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
