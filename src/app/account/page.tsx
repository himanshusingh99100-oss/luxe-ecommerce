"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import { useAuth } from "../../hooks/useAuth";
import { useWishlist } from "../../hooks/useWishlist";
import { fetchApi } from "../../utils/api";
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Lock,
  Mail,
  Plus,
  Trash2,
  CheckCircle,
  Truck,
  Package,
  Calendar,
  KeyRound
} from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";

export default function AccountPage() {
  const { formatPrice } = useCurrency();
  const { user, login, register, logout, updateProfile, addAddress, removeAddress, error, clearError } = useAuth();
  const { wishlist } = useWishlist();

  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist" | "addresses">("orders");

  // Form states
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [profileForm, setProfileForm] = useState({ name: "", email: "", password: "" });
  
  const [addressForm, setAddressForm] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
    phone: "",
    isDefault: false
  });

  const [orders, setOrders] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Sync profile form when user changes
  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name, email: user.email, password: "" });
      loadOrders();
      loadWishlistItems();
    }
  }, [user]);

  // Load orders
  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await fetchApi("get", "/orders/myorders");
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Load wishlist products
  const loadWishlistItems = async () => {
    if (wishlist.length === 0) {
      setWishlistProducts([]);
      return;
    }
    setLoadingWishlist(true);
    try {
      const list = [];
      for (const id of wishlist) {
        try {
          const res = await fetchApi("get", `/products/${id}`);
          list.push(res.product);
        } catch (err) {
          console.error(err);
        }
      }
      setWishlistProducts(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  // Trigger reloading wishlist when ID list changes
  useEffect(() => {
    if (user) {
      loadWishlistItems();
    }
  }, [wishlist, user]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(loginForm.email, loginForm.password);
    } catch (err: any) {
      // Handled by AuthContext
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await register(registerForm.name, registerForm.email, registerForm.password);
    } catch (err: any) {
      // Handled by AuthContext
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm.name, profileForm.email, profileForm.password || undefined);
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to update profile");
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAddress(addressForm);
      setAddressForm({
        name: "",
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "United States",
        phone: "",
        isDefault: false
      });
      alert("Shipping address saved successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to add address");
    }
  };

  const handleRemoveAddress = async (id: string) => {
    if (confirm("Are you sure you want to delete this address?")) {
      try {
        await removeAddress(id);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // --- RENDERS ---
  
  // GUEST VIEW (Login/Register Forms)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121212] text-gray-800 dark:text-[#EAEAEA] flex flex-col justify-between selection:bg-blue-100">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-24 md:py-32 px-6 bg-transparent">
          <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 p-8 md:p-12 rounded-[32px] max-w-md w-full shadow-lg dark:shadow-none space-y-6">
            <div className="text-center">
              <span className="text-[#004AC6] dark:text-blue-400 text-xs font-bold uppercase tracking-widest block">Welcome</span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-950 dark:text-white mt-2">
                {authMode === "login" ? "Sign In" : "Create Account"}
              </h2>
            </div>

            {error && <p className="text-red-655 dark:text-red-400 bg-red-50 dark:bg-red-950/20 text-xs font-semibold p-3.5 rounded-xl border border-red-100 dark:border-red-950/30">{error}</p>}

            {authMode === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      required
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type="password"
                      required
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#004AC6] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none transition-all focus:outline-none"
                >
                  Sign In
                </button>

                <p className="text-center text-xs text-gray-400 mt-4 font-medium">
                  New to Royal Elegance?{" "}
                  <button type="button" onClick={() => setAuthMode("register")} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                    Create Account
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-555 uppercase">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      required
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-555 uppercase">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                    <input
                      type="password"
                      required
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-blue-500 text-gray-800 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#004AC6] hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none transition-all focus:outline-none"
                >
                  Create Account
                </button>

                <p className="text-center text-xs text-gray-400 mt-4 font-medium">
                  Already have an account?{" "}
                  <button type="button" onClick={() => setAuthMode("login")} className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                    Sign In
                  </button>
                </p>
              </form>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // SIGNED IN USER VIEW
  const tabItems = [
    { id: "orders", label: "My Orders", icon: ShoppingBag },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "profile", label: "Profile", icon: User }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-[#121212] text-gray-800 dark:text-[#EAEAEA] flex flex-col justify-between selection:bg-blue-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-24 md:py-32 w-full space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[#004AC6] dark:text-blue-400 text-xs font-bold uppercase tracking-widest block">Client Portal</span>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mt-2">Welcome, {user.name}</h1>
          </div>
          <button
            onClick={logout}
            className="text-red-655 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold text-xs uppercase tracking-wider border border-red-100 dark:border-red-900/40 px-4 py-2.5 rounded-xl transition-all"
          >
            Sign Out
          </button>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-gray-150 dark:border-gray-800 overflow-x-auto pb-1 scrollbar-none">
          {tabItems.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-4 font-bold text-sm tracking-wide uppercase border-b-2 transition-all whitespace-nowrap focus:outline-none ${
                  activeTab === tab.id
                    ? "border-[#004AC6] text-[#004AC6] dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENTS */}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            {loadingOrders ? (
              <p className="text-gray-400 text-sm animate-pulse">Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6">
                <Package className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-semibold">No orders found.</p>
                <p className="text-xs text-gray-400 mt-1">Explore our catalogs and check out items to create orders.</p>
              </div>
            ) : (
              orders.map((ord) => (
                <div key={ord._id} className="bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-none space-y-6">
                  {/* Order header summary */}
                  <div className="flex flex-col sm:flex-row justify-between border-b border-gray-100 dark:border-gray-850 pb-4 gap-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm font-medium bg-transparent">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Order ID</p>
                        <p className="font-mono font-bold text-gray-900 dark:text-white mt-1">#{ord._id.substring(0, 8).toUpperCase()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Placed Date</p>
                        <p className="text-gray-800 dark:text-gray-200 mt-1">{new Date(ord.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Total Amount</p>
                        <p className="text-[#004AC6] dark:text-blue-400 font-bold mt-1">{formatPrice(ord.total)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Logistics Status</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase inline-block mt-1 ${
                          ord.orderStatus === "Delivered" ? "bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400" :
                          ord.orderStatus === "Cancelled" ? "bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400" :
                          "bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400"
                        }`}>{ord.orderStatus}</span>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-gray-50 dark:divide-gray-800 bg-transparent">
                    {ord.orderItems?.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center py-4 text-sm font-medium">
                        <div className="flex items-center space-x-4 bg-transparent">
                          <img src={item.image} alt="" className="w-12 h-12 object-cover rounded-xl" />
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white leading-snug">{item.title}</p>
                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mt-1 block">Qty: {item.quantity} {item.color ? `| ${item.color}` : ""}</span>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* WISHLIST TAB */}
        {activeTab === "wishlist" && (
          <div className="space-y-6">
            {loadingWishlist ? (
              <p className="text-gray-400 text-sm animate-pulse">Loading wishlist...</p>
            ) : wishlistProducts.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 rounded-3xl p-6">
                <Heart className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-semibold">Wishlist is empty.</p>
                <p className="text-xs text-gray-400 mt-1">Check out our products and tap the heart icon to save favourites.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistProducts.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADDRESSES TAB */}
        {activeTab === "addresses" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
            
            {/* List addresses */}
            <div className="lg:col-span-2 space-y-4 bg-transparent">
              {user.savedAddresses?.map((addr) => (
                <div key={addr._id} className="bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 p-6 rounded-3xl shadow-sm dark:shadow-none flex justify-between items-start">
                  <div className="space-y-1.5 text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <p className="font-bold text-gray-900 dark:text-white">{addr.name}</p>
                      {addr.isDefault && <span className="bg-blue-50 dark:bg-blue-950/20 text-[#004AC6] dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Default</span>}
                    </div>
                    <p className="text-gray-550 dark:text-gray-400">{addr.street}</p>
                    <p className="text-gray-550 dark:text-gray-400">{addr.city}, {addr.state} {addr.postalCode}</p>
                    <p className="text-gray-550 dark:text-gray-400">{addr.country}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-semibold mt-1">Phone: {addr.phone}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveAddress(addr._id || "")}
                    className="p-2 text-gray-400 hover:text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {(!user.savedAddresses || user.savedAddresses.length === 0) && (
                <p className="text-gray-400 text-sm">No saved shipping destinations found.</p>
              )}
            </div>

            {/* Create Address Form */}
            <form onSubmit={handleAddressSubmit} className="bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 p-6 rounded-[24px] shadow-sm dark:shadow-none space-y-4">
              <h3 className="font-bold text-sm text-gray-950 dark:text-white">Add Shipping Destination</h3>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={addressForm.name}
                  onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs focus:outline-none text-gray-800 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Street Address</label>
                <input
                  type="text"
                  required
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs focus:outline-none text-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">City</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs focus:outline-none text-gray-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase">State</label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs focus:outline-none text-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-555 uppercase">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs focus:outline-none text-gray-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-gray-555 uppercase">Phone</label>
                  <input
                    type="text"
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs focus:outline-none text-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-800 dark:bg-gray-800"
                />
                <label htmlFor="isDefault" className="text-xs font-semibold text-gray-500 dark:text-gray-450 cursor-pointer select-none">
                  Set as default address
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-850 dark:bg-gray-800 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all"
              >
                Save Destination
              </button>
            </form>
          </div>
        )}

        {/* PROFILE DETAILS TAB */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 p-6 md:p-8 rounded-[32px] max-w-lg shadow-sm dark:shadow-none space-y-4">
            <h3 className="font-bold text-lg text-gray-950 dark:text-white">Update Profile Details</h3>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none text-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none text-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase">New Password (Leave blank to keep current)</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={profileForm.password}
                  onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none text-gray-800 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none transition-all focus:outline-none"
            >
              Save Profile
            </button>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
