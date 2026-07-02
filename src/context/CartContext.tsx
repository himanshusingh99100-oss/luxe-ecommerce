"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { fetchApi } from "../utils/api";

export interface ICartItem {
  product: string; // Product ID
  title: string;
  image: string;
  price: number;
  quantity: number;
  color?: string;
  size?: string;
  maxStock: number;
}

interface ICoupon {
  code: string;
  discountType: "percentage" | "fixed";
  discountAmount: number;
}

interface CartContextType {
  cartItems: ICartItem[];
  addToCart: (item: ICartItem) => void;
  removeFromCart: (productId: string, color?: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, color?: string, size?: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<string>;
  removeCoupon: () => void;
  appliedCoupon: ICoupon | null;
  discount: number;
  shippingCharges: number;
  subtotal: number;
  total: number;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<ICartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<ICoupon | null>(null);
  const [shippingCharges, setShippingCharges] = useState<number>(0);

  // Load cart from localStorage on init
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    }
  }, []);

  // Save cart changes
  const saveCart = (items: ICartItem[]) => {
    setCartItems(items);
    localStorage.setItem("cart", JSON.stringify(items));
  };

  // Add Item
  const addToCart = (item: ICartItem) => {
    const existingIndex = cartItems.findIndex(
      (i) => i.product === item.product && i.color === item.color && i.size === item.size
    );

    let updatedCart = [...cartItems];

    if (existingIndex > -1) {
      const newQty = updatedCart[existingIndex].quantity + item.quantity;
      updatedCart[existingIndex].quantity = Math.min(newQty, item.maxStock);
    } else {
      updatedCart.push(item);
    }

    saveCart(updatedCart);
  };

  // Remove Item
  const removeFromCart = (productId: string, color?: string, size?: string) => {
    const updatedCart = cartItems.filter(
      (item) => !(item.product === productId && item.color === color && item.size === size)
    );
    saveCart(updatedCart);
  };

  // Update Quantity
  const updateQuantity = (productId: string, quantity: number, color?: string, size?: string) => {
    const updatedCart = cartItems.map((item) => {
      if (item.product === productId && item.color === color && item.size === size) {
        return { ...item, quantity: Math.min(Math.max(1, quantity), item.maxStock) };
      }
      return item;
    });
    saveCart(updatedCart);
  };

  // Clear Cart
  const clearCart = () => {
    saveCart([]);
    setAppliedCoupon(null);
  };

  // Apply Coupon
  const applyCoupon = async (code: string): Promise<string> => {
    try {
      const couponData = await fetchApi("post", "/coupons/apply", {
        code,
        cartAmount: subtotal
      });
      setAppliedCoupon(couponData);
      return `Coupon applied: ${couponData.code}`;
    } catch (error: any) {
      setAppliedCoupon(null);
      const msg = error.response?.data?.message || error.message || "Failed to apply coupon";
      throw new Error(msg);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Math Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // Calculate discount
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === "percentage") {
      discount = (subtotal * appliedCoupon.discountAmount) / 100;
    } else {
      discount = appliedCoupon.discountAmount;
    }
  }

  // Free shipping above $150
  useEffect(() => {
    if (subtotal > 0 && subtotal < 150) {
      setShippingCharges(15);
    } else {
      setShippingCharges(0);
    }
  }, [subtotal]);

  const total = Math.max(0, subtotal - discount + shippingCharges);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        appliedCoupon,
        discount,
        shippingCharges,
        subtotal,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
