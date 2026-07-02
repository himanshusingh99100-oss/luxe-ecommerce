"use client";

import React, { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function Newsletter() {
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
    <section className="py-20 max-w-7xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-tr from-[#004AC6]/95 to-[#004AC6] text-white rounded-[32px] p-8 md:p-16 text-center space-y-6 shadow-xl shadow-blue-600/10 relative overflow-hidden"
      >
        {/* Subtle Background Glows */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
          <Mail className="w-5 h-5" />
        </div>

        <div className="max-w-xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Exclusive Privileges</span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Subscribe to the Seasons</h2>
          <p className="text-blue-100 text-sm md:text-base font-light leading-relaxed">
            Gain early access to limited edition drops, seasonal catalogs, and member-only pricing campaigns.
          </p>
        </div>

        {subscribed ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-white text-base font-bold bg-white/10 border border-white/20 px-6 py-3 rounded-2xl max-w-sm mx-auto inline-block"
          >
            Welcome. Check your inbox for updates.
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubscribe}
            className="flex max-w-md mx-auto bg-white rounded-2xl overflow-hidden shadow-md focus-within:ring-2 focus-within:ring-white/50"
          >
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-gray-800 px-5 py-4 text-sm focus:outline-none placeholder:text-gray-400 font-medium"
            />
            <button
              type="submit"
              className="bg-gray-900 hover:bg-gray-850 text-white font-bold text-xs uppercase tracking-wider px-6 py-4 flex items-center space-x-1.5 transition-colors focus:outline-none"
            >
              <span>Join</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </motion.div>
    </section>
  );
}
