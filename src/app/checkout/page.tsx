"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";
import { fetchApi } from "../../utils/api";
import { CheckCircle, CreditCard, Landmark, Truck, ArrowLeft, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCurrency } from "../../context/CurrencyContext";

export default function CheckoutPage() {
  const { formatPrice } = useCurrency();
  const { cartItems, clearCart, subtotal, discount, shippingCharges, total, appliedCoupon } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Shipping, 2: Payment, 3: Review, 4: Success
  const [createdOrder, setCreatedOrder] = useState<any>(null);

  // Form states
  const [shippingForm, setShippingForm] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
    phone: ""
  });

  const [paymentMethod, setPaymentMethod] = useState<"Stripe" | "Razorpay" | "COD">("Stripe");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvc: "" });
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Initialize form with saved address if user is logged in
  useEffect(() => {
    if (user && user.savedAddresses?.length > 0) {
      const defaultAddr = user.savedAddresses.find((a) => a.isDefault) || user.savedAddresses[0];
      setShippingForm({
        name: defaultAddr.name || user.name,
        street: defaultAddr.street || "",
        city: defaultAddr.city || "",
        state: defaultAddr.state || "",
        postalCode: defaultAddr.postalCode || "",
        country: defaultAddr.country || "United States",
        phone: defaultAddr.phone || ""
      });
    } else if (user) {
      setShippingForm((prev) => ({ ...prev, name: user.name }));
    }
  }, [user]);

  const selectSavedAddress = (addr: any) => {
    setShippingForm({
      name: addr.name,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
      phone: addr.phone
    });
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setSubmittingOrder(true);
    try {
      const orderPayload = {
        orderItems: cartItems.map((item) => ({
          product: item.product,
          title: item.title,
          image: item.image,
          quantity: item.quantity,
          color: item.color,
          size: item.size,
          price: item.price
        })),
        shippingAddress: shippingForm,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        shippingCharges,
        paymentId: paymentMethod === "COD" ? undefined : `sim-pay-${Date.now()}`
      };

      const orderData = await fetchApi("post", "/orders", orderPayload);
      setCreatedOrder(orderData);
      clearCart();
      setStep(4);
    } catch (err: any) {
      alert(err.message || "Failed to place order");
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-gray-800 flex flex-col justify-between selection:bg-blue-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-24 md:py-32 w-full">
        {step < 4 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Form Steps */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Stepper Indicators */}
              <div className="flex items-center space-x-4 border-b border-gray-150 pb-6">
                {[
                  { num: 1, label: "Shipping", icon: Truck },
                  { num: 2, label: "Billing", icon: CreditCard },
                  { num: 3, label: "Confirm", icon: CheckCircle }
                ].map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.num} className="flex items-center space-x-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        step === s.num
                          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                          : step > s.num
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-400"
                      }`}>
                        {step > s.num ? "✓" : s.num}
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        step === s.num ? "text-gray-900" : "text-gray-400"
                      }`}>{s.label}</span>
                      {s.num < 3 && <span className="text-gray-300 text-sm">/</span>}
                    </div>
                  );
                })}
              </div>

              {/* STEP 1: SHIPPING ADDRESS */}
              {step === 1 && (
                <div className="space-y-6">
                  {user && user.savedAddresses?.length > 0 && (
                    <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 p-6 rounded-3xl shadow-sm dark:shadow-none space-y-4">
                      <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Select Saved Address</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {user.savedAddresses.map((addr: any, i: number) => (
                          <button
                            key={addr._id || i}
                            type="button"
                            onClick={() => selectSavedAddress(addr)}
                            className="text-left border border-gray-200 dark:border-gray-800 hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/20 p-4 rounded-2xl transition-all space-y-1 focus:outline-none bg-transparent"
                          >
                            <p className="font-bold text-sm text-gray-900 dark:text-white">{addr.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{addr.street}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{addr.city}, {addr.state} {addr.postalCode}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleShippingSubmit} className="bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 p-6 md:p-8 rounded-[32px] shadow-sm dark:shadow-none space-y-4">
                    <h3 className="font-bold text-lg text-gray-950 dark:text-white">Shipping Details</h3>
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase">Receiver Full Name</label>
                      <input
                        type="text"
                        required
                        value={shippingForm.name}
                        onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-gray-850 dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 dark:text-gray-555 uppercase">Street Address</label>
                      <input
                        type="text"
                        required
                        placeholder="Suite, apartment, street name"
                        value={shippingForm.street}
                        onChange={(e) => setShippingForm({ ...shippingForm, street: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-gray-850 dark:text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-555 uppercase">City</label>
                        <input
                          type="text"
                          required
                          value={shippingForm.city}
                          onChange={(e) => setShippingForm({ ...shippingForm, city: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none text-gray-850 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-555 uppercase">State / Province</label>
                        <input
                          type="text"
                          required
                          value={shippingForm.state}
                          onChange={(e) => setShippingForm({ ...shippingForm, state: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none text-gray-850 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-555 uppercase">Postal Code</label>
                        <input
                          type="text"
                          required
                          value={shippingForm.postalCode}
                          onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none text-gray-850 dark:text-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-555 uppercase">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={shippingForm.phone}
                          onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none text-gray-850 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl flex items-center space-x-1"
                      >
                        <span>Select Billing Method</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>
              )}              {/* STEP 2: PAYMENT METHOD */}
              {step === 2 && (
                <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 p-6 md:p-8 rounded-[32px] shadow-sm dark:shadow-none space-y-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <button onClick={() => setStep(1)} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h3 className="font-bold text-lg text-gray-955 dark:text-white">Billing Method</h3>
                  </div>

                  {/* Payment selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: "Stripe", label: "Credit Card (Stripe)", icon: CreditCard },
                      { id: "Razorpay", label: "Razorpay / UPI", icon: Landmark },
                      { id: "COD", label: "Cash on Delivery", icon: Truck }
                    ].map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id as any)}
                          className={`flex flex-col items-center justify-center p-6 border rounded-2xl transition-all space-y-3 focus:outline-none bg-transparent ${
                            paymentMethod === m.id
                              ? "border-blue-600 bg-blue-50/20 text-blue-700 dark:text-blue-300 dark:bg-blue-950/20"
                              : "border-gray-200 dark:border-gray-800 hover:border-gray-450 dark:hover:border-gray-700 text-gray-500 dark:text-gray-400"
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                          <span className="text-xs font-bold uppercase tracking-wider">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Simulated Card inputs */}
                  {paymentMethod !== "COD" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="border border-gray-150 dark:border-gray-800 rounded-2xl p-6 bg-gray-50/20 dark:bg-gray-900/30 space-y-4 overflow-hidden"
                    >
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Card Number</label>
                        <input
                          type="text"
                          placeholder="4242 4242 4242 4242"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                          className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 font-mono text-gray-800 dark:text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Expiration</label>
                          <input
                            type="text"
                            placeholder="MM / YY"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none font-mono text-gray-800 dark:text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-550 uppercase">CVC Code</label>
                          <input
                            type="text"
                            placeholder="123"
                            value={cardDetails.cvc}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none font-mono text-gray-800 dark:text-white"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setStep(3)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-2xl flex items-center space-x-1"
                    >
                      <span>Review Purchase</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: ORDER REVIEW */}
              {step === 3 && (
                <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 p-6 md:p-8 rounded-[32px] shadow-sm dark:shadow-none space-y-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <button onClick={() => setStep(2)} className="p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <h3 className="font-bold text-lg text-gray-950 dark:text-white">Review Order Details</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-150">
                    <div className="space-y-1 text-sm font-medium">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Shipping Destination</p>
                      <p className="font-bold text-gray-900">{shippingForm.name}</p>
                      <p className="text-gray-550">{shippingForm.street}</p>
                      <p className="text-gray-550">{shippingForm.city}, {shippingForm.state} {shippingForm.postalCode}</p>
                      <p className="text-gray-400 font-semibold text-xs mt-1">Phone: {shippingForm.phone}</p>
                    </div>
                    <div className="space-y-1 text-sm font-medium">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Billing Method</p>
                      <p className="font-bold text-gray-900">{paymentMethod}</p>
                      <p className="text-gray-500">
                        {paymentMethod === "COD" ? "Cash validation on delivery" : "Instant online card authorization"}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handlePlaceOrder}
                      disabled={submittingOrder}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider px-8 py-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/10 hover:scale-[1.01] transition-all"
                    >
                      {submittingOrder ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Authorizing Transaction...</span>
                        </>
                      ) : (
                        <>
                          <span>Pay & Place Order ({formatPrice(total)})</span>
                          <CheckCircle className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Right Column: Checkout Summary Panel */}
            <div className="lg:col-span-4 bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 p-6 md:p-8 rounded-3xl shadow-sm dark:shadow-none space-y-6">
              <h3 className="font-bold text-lg text-gray-950 dark:text-white">Purchase Items</h3>
              
              <div className="divide-y divide-gray-50 dark:divide-gray-800 max-h-[40vh] overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={`${item.product}-${item.color}-${item.size}`} className="flex justify-between items-center py-3 text-sm">
                    <div className="flex items-center space-x-3 bg-transparent">
                      <img src={item.image} alt="" className="w-10 h-10 object-cover rounded-xl" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white truncate max-w-[140px]">{item.title}</p>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase">{item.quantity} units {item.color ? `| ${item.color}` : ""}</span>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 text-xs md:text-sm font-medium border-t border-gray-100 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Discount applied:</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping:</span>
                  <span>{shippingCharges > 0 ? formatPrice(shippingCharges) : "Complimentary"}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-100 pt-3">
                  <span>Grand Total:</span>
                  <span className="text-blue-600">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 justify-center text-xs text-gray-400 font-semibold tracking-wide uppercase pt-2 border-t border-gray-100">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>SSL Encrypted Checkout</span>
              </div>
            </div>

          </div>
        ) : (
          /* STEP 4: SUCCESS PAGE */
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-[#1C1C1E] border border-gray-200/60 dark:border-gray-800 rounded-[32px] p-8 md:p-16 text-center max-w-xl mx-auto space-y-6 shadow-xl dark:shadow-none"
          >
            <div className="w-16 h-16 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-3">
              <span className="text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-widest block">Transaction Approved</span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-950 dark:text-white">Thank you for your order</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                Order <span className="font-mono font-bold text-gray-800 dark:text-white">#{createdOrder?._id?.substring(0, 8).toUpperCase()}</span> has been confirmed. A receipt and shipping invoice was sent to your registered email.
              </p>
            </div>

            <div className="border border-gray-100 dark:border-gray-800 rounded-2xl p-6 bg-gray-50/50 dark:bg-gray-900/30 max-w-md mx-auto text-left text-sm space-y-2">
              <p className="font-bold text-gray-900 dark:text-white mb-3 border-b border-gray-200/50 dark:border-gray-800 pb-2">Delivery Summary</p>
              <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                <span>Shipped To:</span>
                <span className="text-gray-800 dark:text-white font-bold">{shippingForm.name}</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                <span>Billing Total:</span>
                <span className="text-[#004AC6] dark:text-blue-400 font-bold">{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                <span>Method:</span>
                <span className="text-gray-800 dark:text-white font-bold">{paymentMethod}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/account"
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-2xl transition-all"
              >
                Track Orders
              </Link>
              <Link
                href="/catalog"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-2xl shadow-md shadow-blue-200 transition-all"
              >
                Continue Shopping
              </Link>
            </div>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
