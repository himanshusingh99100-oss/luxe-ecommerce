"use client";

import React from "react";
import { ShieldCheck, Award, Leaf } from "lucide-react";
import { motion } from "framer-motion";

export default function BrandStory() {
  return (
    <section className="py-20 bg-white dark:bg-[#121212] border-y border-gray-200/50 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Visual Brand Image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative h-[450px] rounded-[32px] overflow-hidden shadow-lg dark:shadow-none border border-gray-100 dark:border-gray-800"
        >
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80"
            alt="Craftsmanship workshop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-8 left-8 text-white max-w-sm">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Our Heritage</span>
            <p className="text-xl font-bold mt-2 leading-tight">Meticulous detail. High-grade materials. Built for generations.</p>
          </div>
        </motion.div>

        {/* Text Story Column */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <span className="text-[#004AC6] text-xs font-bold uppercase tracking-widest">Brand Story</span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-950 dark:text-white leading-tight">
              Honoring Minimal Design & Swiss Precision
            </h2>
            <p className="text-gray-550 dark:text-gray-400 leading-relaxed text-sm md:text-base font-normal">
              At Royal Elegance, we challenge the culture of fast disposal. We believe in crafting select daily essentials that speak through their quality, material weight, and quiet details. Every product in our collections is designed in-house, sourcing sustainable materials and utilizing master watchmakers and leather craftsmen.
            </p>
          </div>

          {/* Pillars List */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            {[
              { icon: ShieldCheck, title: "Authenticity", desc: "100% verified materials." },
              { icon: Award, title: "Mastery", desc: "Swiss quartz precision." },
              { icon: Leaf, title: "Conscious", desc: "Eco-leather wraps." }
            ].map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <div key={i} className="space-y-2.5 p-5 bg-gray-55/50 dark:bg-[#1C1C1E] border border-gray-200/50 dark:border-gray-800 rounded-2xl">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 w-11 h-11 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">{pillar.title}</h4>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium leading-relaxed">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
