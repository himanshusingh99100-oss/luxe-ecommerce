"use client";

import React from "react";

interface CategoryPillsProps {
  categories: Array<{ _id: string; name: string; slug: string }>;
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export default function CategoryPills({
  categories,
  selectedCategory,
  onSelectCategory
}: CategoryPillsProps) {
  return (
    <div className="flex items-center space-x-3 overflow-x-auto pb-4 scrollbar-none">
      <button
        onClick={() => onSelectCategory("")}
        className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap focus:outline-none ${
          selectedCategory === ""
            ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
            : "bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        }`}
      >
        All Products
      </button>

      {categories.map((cat) => (
        <button
          key={cat._id}
          onClick={() => onSelectCategory(cat.slug)}
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap focus:outline-none ${
            selectedCategory === cat.slug
              ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none"
              : "bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
