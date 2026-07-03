"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Accordion, { AccordionItem } from "@/components/ui/Accordion";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { fetchApi } from "@/utils/api";
import { getDiscountPercentage } from "@/utils/helpers";
import { Heart, ShoppingBag, Star, ShieldAlert, Sparkles, MessageCircle, Truck, RotateCcw } from "lucide-react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useCurrency } from "@/context/CurrencyContext";

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  
  const [activeImage, setActiveImage] = useState("");
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Review form states
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadProductData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchApi("get", `/products/${id}`);
      setProduct(data.product);
      setReviews(data.reviews || []);
      setActiveImage(data.product.images[0]);
      
      if (data.product.colorVariants?.length > 0) {
        setSelectedColor(data.product.colorVariants[0]);
      }
      if (data.product.sizes?.length > 0) {
        setSelectedSize(data.product.sizes[0]);
      }

      // Load related products based on category ID
      const catId = data.product.category?._id || data.product.category;
      const related = await fetchApi("get", `/products?category=${catId}`);
      // Filter out current product
      const filtered = (related.products || related).filter((p: any) => p._id !== data.product._id);
      setRelatedProducts(filtered.slice(0, 4));
    } catch (err) {
      console.error("Failed to load product detail:", err);
      setError("Unable to load the premium product details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadProductData();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      product: product._id,
      title: product.title,
      image: product.images[0],
      price: product.price,
      quantity,
      color: selectedColor?.colorName,
      size: selectedSize,
      maxStock: product.stock
    });
    alert("Added to Cart!");
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to submit a review.");
      return;
    }
    setSubmittingReview(true);
    try {
      await fetchApi("post", `/products/${id}/reviews`, {
        name: user.name,
        rating: Number(reviewForm.rating),
        title: reviewForm.title,
        comment: reviewForm.comment
      });
      alert("Review submitted!");
      setReviewForm({ rating: 5, title: "", comment: "" });
      loadProductData();
    } catch (err: any) {
      alert(err.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121212] text-gray-800 dark:text-[#EAEAEA] flex flex-col justify-between animate-pulse">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-6 py-24 md:py-32 w-full space-y-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Image Gallery Skeleton */}
            <div className="lg:col-span-7 space-y-4">
              <div className="aspect-square bg-gray-200 dark:bg-gray-850 border border-gray-200/60 dark:border-gray-800 rounded-[32px]"></div>
              <div className="flex space-x-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-20 h-20 bg-gray-200 dark:bg-gray-850 border border-gray-200/60 dark:border-gray-800 rounded-2xl"></div>
                ))}
              </div>
            </div>

            {/* Right Column: Pricing & Options Skeleton */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-850 rounded w-24"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-850 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-850 rounded w-1/3"></div>
              </div>
              <div className="space-y-4 pt-4 border-t border-gray-250/20">
                <div className="h-6 bg-gray-200 dark:bg-gray-850 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-850 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-850 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-850 rounded w-2/3"></div>
              </div>
              <div className="space-y-4 pt-4 border-t border-gray-250/20">
                <div className="h-10 bg-gray-200 dark:bg-gray-850 rounded w-full"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-850 rounded w-full"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121212] text-gray-800 dark:text-[#EAEAEA] flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-6 py-24 md:py-32 w-full flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">API Load Error</h2>
            <p className="text-gray-500 dark:text-gray-400">{error}</p>
            <button
              onClick={() => loadProductData()}
              className="bg-[#004AC6] text-white font-bold py-3 px-6 rounded-2xl transition-all hover:bg-blue-700"
            >
              Retry Loading
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121212] text-gray-800 dark:text-[#EAEAEA] flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto px-6 py-24 md:py-32 w-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold">Product Not Found</h2>
            <p className="text-gray-500 dark:text-gray-400">The timepiece or accessory you are looking for does not exist or has been removed.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const discount = getDiscountPercentage(product.price, product.compareAtPrice);
  const inWishlist = isInWishlist(product._id);

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121212] text-gray-800 dark:text-[#EAEAEA] flex flex-col justify-between selection:bg-blue-100 pb-20 md:pb-0">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-24 md:py-32 w-full space-y-20">
        {/* PRODUCT LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-square bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 rounded-[32px] overflow-hidden relative shadow-sm dark:shadow-none">
              <img
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-out cursor-zoom-in"
              />
            </div>
            
            {/* Gallery thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
                {product.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all flex-shrink-0 focus:outline-none ${
                      activeImage === img ? "border-[#004AC6]" : "border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Pricing & Options */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <span className="text-blue-700 dark:text-blue-400 text-xs font-bold uppercase tracking-widest block">
                {product.category?.name || "General Collection"}
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                {product.title}
              </h1>

              {/* Rating stars */}
              <div className="flex items-center space-x-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(product.ratings) ? "fill-current" : "text-gray-300 dark:text-gray-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-550 dark:text-gray-450 font-medium">({product.numReviews} Customer reviews)</span>
              </div>
            </div>

            {/* Price section */}
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-bold text-gray-950 dark:text-white">{formatPrice(product.price)}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <>
                  <span className="text-lg text-gray-450 dark:text-gray-500 line-through font-medium">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                  <span className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-550 dark:text-gray-400 text-sm leading-relaxed font-normal">{product.description}</p>

            {/* COLOR SELECTOR */}
            {product.colorVariants?.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                  Chosen Color: <strong className="text-gray-800 dark:text-white">{selectedColor?.colorName}</strong>
                </span>
                <div className="flex space-x-2">
                  {product.colorVariants.map((col: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedColor(col)}
                      className={`w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center focus:outline-none ${
                        selectedColor?.colorName === col.colorName
                          ? "border-blue-600 scale-110 shadow-sm"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: col.colorHex }}
                      title={col.colorName}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* SIZE SELECTOR */}
            {product.sizes?.length > 0 && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                  Choose Size
                </span>
                <div className="flex space-x-2">
                  {product.sizes.map((sz: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedSize(sz)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all focus:outline-none ${
                        selectedSize === sz
                          ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
                          : "bg-white dark:bg-gray-800 border-gray-250 dark:border-gray-800 text-gray-650 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* QUANTITY & ACTIONS */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-150 dark:border-gray-800">
              <div className="flex border border-gray-250 dark:border-gray-850 rounded-2xl overflow-hidden bg-white dark:bg-gray-800 max-w-[140px] w-full self-start">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold focus:outline-none"
                >
                  -
                </button>
                <span className="w-full text-center py-3 font-semibold text-sm self-center text-gray-800 dark:text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold focus:outline-none"
                >
                  +
                </button>
              </div>

              {product.stock > 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-[#004AC6] hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-wider py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/10 hover:scale-[1.01] transition-all focus:outline-none"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Shopping Cart</span>
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 font-bold text-sm uppercase tracking-wider py-4 rounded-2xl flex items-center justify-center cursor-not-allowed"
                >
                  Out of Stock
                </button>
              )}

              <button
                onClick={() => toggleWishlist(product._id)}
                className={`p-4 rounded-2xl border transition-all focus:outline-none ${
                  inWishlist
                    ? "bg-red-550 border-red-550 text-white"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-red-550 hover:bg-red-50/55 dark:hover:bg-gray-750"
                }`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* ACCORDION (Specs, Delivery) */}
            <Accordion>
              <AccordionItem title="Specifications">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {product.specifications?.map((spec: any, i: number) => (
                    <div key={i} className="flex justify-between py-2.5">
                      <span className="text-gray-400 dark:text-gray-500 font-medium text-xs">{spec.name}</span>
                      <span className="text-gray-800 dark:text-white font-semibold text-xs text-right">{spec.value}</span>
                    </div>
                  ))}
                  {(!product.specifications || product.specifications.length === 0) && (
                    <p className="text-gray-400 dark:text-gray-550 text-xs py-2">No technical specs supplied.</p>
                  )}
                </div>
              </AccordionItem>
              <AccordionItem title="Delivery & Returns">
                <div className="space-y-4">
                  <div className="flex space-x-3 items-start">
                    <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white">Complimentary Shipping</h4>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Free standard shipping on all orders above $150. Delivers in 2-4 business days.</p>
                    </div>
                  </div>
                  <div className="flex space-x-3 items-start">
                    <RotateCcw className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-gray-900 dark:text-white">Return Policy</h4>
                      <p className="text-[11px] text-gray-400 dark:text-gray-550 mt-0.5">Complimentary returns inside 30 days of shipment receipt. Return authorization labels included.</p>
                    </div>
                  </div>
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* REVIEWS LIST */}
        <section className="space-y-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-955 dark:text-white pb-4 border-b border-gray-150 dark:border-gray-800">
            Reviews & Ratings
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            {/* Reviews list */}
            <div className="lg:col-span-2 space-y-6">
              {reviews.map((rev) => (
                <div key={rev._id} className="bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 p-6 rounded-2xl shadow-sm dark:shadow-none space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{rev.title || "Customer Review"}</h4>
                      <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Submitted by {rev.name} on {new Date(rev.createdAt).toLocaleDateString()}</p>
                    </div>
                    {/* Stars */}
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < rev.rating ? "fill-current" : "text-gray-250 dark:text-gray-700"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-550 dark:text-gray-400 text-xs md:text-sm leading-relaxed">{rev.comment}</p>
                </div>
              ))}

              {reviews.length === 0 && (
                <p className="text-gray-400 text-sm">No reviews have been written for this product. Be the first to share your experience.</p>
              )}
            </div>

            {/* Submit review */}
            {user ? (
              <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 p-6 rounded-[24px] shadow-sm dark:shadow-none space-y-4">
                <h3 className="font-bold text-sm text-gray-950 dark:text-white">Write a Review</h3>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase">Rating</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    className="w-full bg-gray-50 dark:bg-gray-805 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm focus:outline-none text-gray-800 dark:text-white"
                  >
                    {[5, 4, 3, 2, 1].map((r) => (
                      <option key={r} value={r} className="text-gray-900 bg-white dark:bg-gray-800 dark:text-white">{r} Stars</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-555 uppercase">Review Title</label>
                  <input
                    type="text"
                    required
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm focus:outline-none text-gray-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-555 uppercase">Commentary</label>
                  <textarea
                    rows={3}
                    required
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-sm focus:outline-none text-gray-800 dark:text-white"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-gray-900 hover:bg-gray-850 dark:bg-gray-800 text-white font-semibold text-xs py-3 rounded-xl transition-all"
                >
                  Submit Review
                </button>
              </form>
            ) : (
              <div className="bg-gray-50 dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 rounded-[24px] p-6 text-center">
                <p className="text-gray-550 dark:text-gray-400 text-xs">Please log in to write customer feedback.</p>
              </div>
            )}
          </div>
        </section>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <section className="space-y-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-955 dark:text-white pb-4 border-b border-gray-150 dark:border-gray-800">
              Related Essentials
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* MOBILE STICKY BOTTOM DRAWER */}
      <div className="fixed bottom-0 left-0 w-full z-45 bg-white/90 dark:bg-[#1C1C1E]/90 backdrop-blur-md border-t border-gray-150 dark:border-gray-800 p-4 flex gap-4 md:hidden shadow-lg dark:shadow-none items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{product.title.substring(0, 15)}...</span>
          <span className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{formatPrice(product.price)}</span>
        </div>
        <div className="flex gap-2">
          {product.stock > 0 ? (
            <button
              onClick={handleAddToCart}
              className="bg-[#004AC6] text-white font-bold text-xs uppercase tracking-wider px-5 py-3.5 rounded-2xl flex items-center space-x-1.5 focus:outline-none"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          ) : (
            <button
              disabled
              className="bg-gray-200 text-gray-400 font-bold text-xs uppercase py-3.5 px-4 rounded-2xl cursor-not-allowed"
            >
              Sold Out
            </button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
