"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import api, { isServerOnline } from "../utils/api";

export interface IAddress {
  _id?: string;
  name: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  wishlist: string[];
  savedAddresses: IAddress[];
  token?: string;
}

interface AuthContextType {
  user: IUser | null;
  loading: boolean;
  error: string | null;
  register: (name: string, email: string, password?: string) => Promise<IUser>;
  login: (email: string, password?: string) => Promise<IUser>;
  loginWithGoogle: (email: string, name: string, googleId: string) => Promise<IUser>;
  logout: () => void;
  updateProfile: (name: string, email: string, password?: string) => Promise<IUser>;
  addAddress: (address: Omit<IAddress, "_id">) => Promise<IAddress[]>;
  removeAddress: (id: string) => Promise<IAddress[]>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Core Mock Users for fallback demo
const MOCK_USERS_KEY = "premium_ecommerce_mock_users";
const DEFAULT_MOCK_USERS: IUser[] = [
  {
    _id: "mock-admin-id",
    name: "Alexander Mercer",
    email: "admin@premium.com",
    role: "admin",
    wishlist: [],
    savedAddresses: [
      {
        _id: "addr-1",
        name: "Alexander Mercer",
        street: "742 Evergreen Terrace",
        city: "Springfield",
        state: "OR",
        postalCode: "97477",
        country: "USA",
        phone: "+1 555-0199",
        isDefault: true
      }
    ]
  },
  {
    _id: "mock-customer-id",
    name: "Clara Vance",
    email: "customer@premium.com",
    role: "customer",
    wishlist: [],
    savedAddresses: [
      {
        _id: "addr-2",
        name: "Clara Vance",
        street: "221B Baker St",
        city: "London",
        state: "Greater London",
        postalCode: "NW1 6XE",
        country: "UK",
        phone: "+44 20 7946 0958",
        isDefault: true
      }
    ]
  }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize mock users database in localStorage if not exists
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!localStorage.getItem(MOCK_USERS_KEY)) {
        localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(DEFAULT_MOCK_USERS));
      }
      
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    }
  }, []);

  const clearError = () => setError(null);

  const getMockUsers = (): IUser[] => {
    const list = localStorage.getItem(MOCK_USERS_KEY);
    return list ? JSON.parse(list) : DEFAULT_MOCK_USERS;
  };

  const saveMockUsers = (users: IUser[]) => {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  };

  const handleAuthSuccess = (userData: IUser, token: string) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  // REGISTER
  const register = async (name: string, email: string, password?: string): Promise<IUser> => {
    setLoading(true);
    setError(null);
    try {
      const serverOnline = await isServerOnline();
      if (serverOnline) {
        const response = await api.post("/auth/register", { name, email, password });
        handleAuthSuccess(response.data, response.data.token);
        setLoading(false);
        return response.data;
      } else {
        // Fallback registration
        const users = getMockUsers();
        if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
          throw new Error("User already exists");
        }

        const newUser: IUser = {
          _id: `mock-user-${Date.now()}`,
          name,
          email,
          role: "customer",
          wishlist: [],
          savedAddresses: []
        };

        users.push(newUser);
        saveMockUsers(users);
        handleAuthSuccess(newUser, "mock-token-jwt-" + newUser._id);
        setLoading(false);
        return newUser;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Registration failed";
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  // LOGIN
  const login = async (email: string, password?: string): Promise<IUser> => {
    setLoading(true);
    setError(null);
    try {
      const serverOnline = await isServerOnline();
      if (serverOnline) {
        const response = await api.post("/auth/login", { email, password });
        handleAuthSuccess(response.data, response.data.token);
        setLoading(false);
        return response.data;
      } else {
        // Fallback login
        const users = getMockUsers();
        const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        
        // Simulating simple matching, accepting password verification
        if (found) {
          handleAuthSuccess(found, "mock-token-jwt-" + found._id);
          setLoading(false);
          return found;
        } else {
          throw new Error("Invalid email or password");
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  // GOOGLE LOGIN
  const loginWithGoogle = async (email: string, name: string, googleId: string): Promise<IUser> => {
    setLoading(true);
    setError(null);
    try {
      const serverOnline = await isServerOnline();
      if (serverOnline) {
        const response = await api.post("/auth/google", { email, name, googleId });
        handleAuthSuccess(response.data, response.data.token);
        setLoading(false);
        return response.data;
      } else {
        // Fallback google login
        const users = getMockUsers();
        let found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        
        if (!found) {
          found = {
            _id: `mock-google-user-${Date.now()}`,
            name,
            email,
            role: "customer",
            wishlist: [],
            savedAddresses: []
          };
          users.push(found);
          saveMockUsers(users);
        }
        
        handleAuthSuccess(found, "mock-token-google-" + found._id);
        setLoading(false);
        return found;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Google Authentication failed";
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // UPDATE PROFILE
  const updateProfile = async (name: string, email: string, password?: string): Promise<IUser> => {
    setLoading(true);
    setError(null);
    try {
      const serverOnline = await isServerOnline();
      if (serverOnline) {
        const response = await api.put("/auth/profile", { name, email, password });
        handleAuthSuccess(response.data, response.data.token);
        setLoading(false);
        return response.data;
      } else {
        if (!user) throw new Error("No authenticated user");
        const users = getMockUsers();
        const updatedUsers = users.map((u) => {
          if (u._id === user._id) {
            return { ...u, name, email };
          }
          return u;
        });
        saveMockUsers(updatedUsers);

        const updatedUser = { ...user, name, email };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setLoading(false);
        return updatedUser;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Profile update failed";
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  // ADD ADDRESS
  const addAddress = async (address: Omit<IAddress, "_id">): Promise<IAddress[]> => {
    setLoading(true);
    setError(null);
    try {
      const serverOnline = await isServerOnline();
      if (serverOnline) {
        const response = await api.post("/auth/address", address);
        if (user) {
          const updatedUser = { ...user, savedAddresses: response.data };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
        setLoading(false);
        return response.data;
      } else {
        if (!user) throw new Error("No authenticated user");
        const users = getMockUsers();
        
        const newAddressItem: IAddress = {
          ...address,
          _id: `mock-addr-${Date.now()}`
        };

        const updatedAddresses = [...user.savedAddresses];
        if (newAddressItem.isDefault) {
          updatedAddresses.forEach((addr) => {
            addr.isDefault = false;
          });
        }
        updatedAddresses.push(newAddressItem);

        const updatedUsers = users.map((u) => {
          if (u._id === user._id) {
            return { ...u, savedAddresses: updatedAddresses };
          }
          return u;
        });
        saveMockUsers(updatedUsers);

        const updatedUser = { ...user, savedAddresses: updatedAddresses };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setLoading(false);
        return updatedAddresses;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to add address";
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  // REMOVE ADDRESS
  const removeAddress = async (id: string): Promise<IAddress[]> => {
    setLoading(true);
    setError(null);
    try {
      const serverOnline = await isServerOnline();
      if (serverOnline) {
        const response = await api.delete(`/auth/address/${id}`);
        if (user) {
          const updatedUser = { ...user, savedAddresses: response.data };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
        setLoading(false);
        return response.data;
      } else {
        if (!user) throw new Error("No authenticated user");
        const users = getMockUsers();
        const updatedAddresses = user.savedAddresses.filter((addr) => addr._id !== id);

        const updatedUsers = users.map((u) => {
          if (u._id === user._id) {
            return { ...u, savedAddresses: updatedAddresses };
          }
          return u;
        });
        saveMockUsers(updatedUsers);

        const updatedUser = { ...user, savedAddresses: updatedAddresses };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setLoading(false);
        return updatedAddresses;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to remove address";
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        loginWithGoogle,
        logout,
        updateProfile,
        addAddress,
        removeAddress,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
