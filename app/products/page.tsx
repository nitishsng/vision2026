"use client";
import React, { useState } from "react";
import Image from "next/image";

// -------------------- TYPES --------------------
interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  categories: string[];
  customizable: boolean;
}

// -------------------- COMPONENT --------------------
export default function ProductsPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // -------------------- PRODUCTS --------------------
const products: Product[] = [
  {
    id: 1,
    name: "Men's Square Metal Frame",
    description: "Lightweight metal frame ideal for office and daily wear.",
    price: "1000-1500",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90",
    categories: ["Men", "Metal Frame", "Office Wear", "Daily Use", "Lightweight"],
    customizable: true
  },
  {
    id: 2,
    name: "Men's Blue Cut Computer Glass",
    description: "Protects eyes from mobile, laptop, and tablet blue light.",
    price: "1200-1600",
    image: "https://images.unsplash.com/photo-1591076482161-42c1d040d89d",
    categories: ["Men", "Blue Cut", "Computer Glasses", "Digital Protection", "Daily Use"],
    customizable: true
  },
  {
    id: 3,
    name: "Cat-Eye Women's Frame",
    description: "Trendy cat-eye frame for fashion-conscious women and teenage girls.",
    price: "1500-2000",
    image: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30a55",
    categories: ["Women", "Girls", "Fashion", "Cat Eye", "Trendy"],
    customizable: false
  },
  {
    id: 4,
    name: "Pink Transparent Girls Frame",
    description: "Lightweight transparent frame designed for young girls.",
    price: "1000-1300",
    image: "https://images.unsplash.com/photo-1583394838374-41a8a4c20b08",
    categories: ["Girls", "Fashion", "Transparent Frame", "Lightweight", "Daily Use"],
    customizable: false
  },
  {
    id: 5,
    name: "Kids Flexible Frame",
    description: "Durable and flexible frame perfect for children’s active lifestyle.",
    price: "500-900",
    image: "https://images.unsplash.com/photo-1521120413309-31af86fc0321",
    categories: ["Children", "Boys", "Girls", "Flexible", "Durable", "Safe"],
    customizable: true
  },
  {
    id: 6,
    name: "Boys Blue Eyeglasses",
    description: "Comfortable and durable frame for boys with soft nose pads.",
    price: "800-1000",
    image: "https://images.unsplash.com/photo-1521093470119-a90f66cd0b48",
    categories: ["Boys", "Daily Use", "Durable", "Lightweight"],
    customizable: true
  },
  {
    id: 7,
    name: "Full-Rim Reading Glass",
    description: "Classic full-rim glasses ideal for reading books and newspapers.",
    price: "400-600",
    image: "https://images.unsplash.com/photo-1577803645773-f96470509666",
    categories: ["Reading Glasses", "Daily Use", "Budget", "Full Rim", "Comfort"],
    customizable: false
  },
  {
    id: 8,
    name: "Senior Comfort Frame",
    description: "Lightweight frame with soft nose pads, ideal for seniors.",
    price: "800-1000",
    image: "https://images.unsplash.com/photo-1583394838160-d3bd96359e91",
    categories: ["Senior", "Comfort", "Lightweight", "Daily Use"],
    customizable: true
  },
  {
    id: 9,
    name: "Polarized Outdoor Sunglasses",
    description: "Protects eyes from sun glare with polarized lenses.",
    price: "1800-2200",
    image: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb",
    categories: ["Sunglasses", "Outdoor", "Polarized", "UV Protection", "Travel"],
    customizable: false
  },
  {
    id: 10,
    name: "Women UV Sunglasses",
    description: "Fashionable sunglasses with UV400 protection for women.",
    price: "1500-1800",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083",
    categories: ["Women", "Sunglasses", "UV Protection", "Fashion", "Outdoor"],
    customizable: false
  },
  {
    id: 11,
    name: "Anti-Glare Lenses",
    description: "Reduces reflection for night driving and computer use.",
    price: "800-1000",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8",
    categories: ["Lenses", "Anti-Glare", "Computer Use", "Night Driving", "Daily Use"],
    customizable: false
  },
  {
    id: 12,
    name: "Blue Cut Lenses",
    description: "Protects eyes from harmful blue light for all ages.",
    price: "1200-1500",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
    categories: ["Lenses", "Blue Cut", "Men", "Women", "Boys", "Girls", "Digital Protection"],
    customizable: false
  },
  {
    id: 13,
    name: "Monthly Contact Lenses",
    description: "Comfortable hydrophilic soft lenses for monthly use.",
    price: "1400-1600",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
    categories: ["Contact Lenses", "Soft Lenses", "Clear Vision", "Monthly Use"],
    customizable: false
  },
  {
    id: 14,
    name: "Lens Cleaning Solution",
    description: "Non-alcohol solution for safe lens cleaning.",
    price: "150-250",
    image: "https://images.unsplash.com/photo-1603398938378-df7f86e35604",
    categories: ["Accessories", "Cleaning", "Safe for Lenses", "Maintenance"],
    customizable: false
  },
  {
    id: 15,
    name: "Microfiber Cleaning Cloth",
    description: "Soft cloth for scratch-free lens cleaning.",
    price: "50-100",
    image: "https://images.unsplash.com/photo-1607083204666-52a5a8fb4bbd",
    categories: ["Accessories", "Cleaning Cloth", "Scratch-Free", "Daily Use"],
    customizable: false
  },
  {
    id: 16,
    name: "Eye Lubricant Drops",
    description: "Relieves dryness and irritation for comfortable vision.",
    price: "150-250",
    image: "https://images.unsplash.com/photo-1603398938378-df7f86e35604",
    categories: ["Medicine", "Eye Drops", "Dryness Relief", "Irritation Relief"],
    customizable: false
  },
  {
    id: 17,
    name: "Kids Anti-UV Sunglasses",
    description: "Fun and protective sunglasses for boys and girls.",
    price: "700-1200",
    image: "https://images.unsplash.com/photo-1592878849124-6c4623c1c27f",
    categories: ["Kids", "Sunglasses", "UV Protection", "Boys", "Girls", "Outdoor"],
    customizable: false
  },
  {
    id: 18,
    name: "Men's Aviator Sunglasses",
    description: "Classic aviator sunglasses with UV protection for men.",
    price: "1600-2000",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f",
    categories: ["Men", "Sunglasses", "UV Protection", "Outdoor", "Fashion"],
    customizable: false
  },
  {
    id: 19,
    name: "Women Round Sunglasses",
    description: "Trendy round sunglasses for women with UV400 lenses.",
    price: "1500-1800",
    image: "https://images.unsplash.com/photo-1504208434309-cb69f4fe52b0",
    categories: ["Women", "Sunglasses", "Fashion", "UV Protection", "Outdoor"],
    customizable: false
  },
  {
    id: 20,
    name: "Blue Cut Kids Glasses",
    description: "Protects children’s eyes from blue light while using devices.",
    price: "800-1200",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7",
    categories: ["Boys", "Girls", "Blue Cut", "Digital Protection", "Kids", "School Use"],
    customizable: true
  }
];



  // -------------------- FILTERS --------------------
  const peopleCategories: string[] = ["Men", "Women", "Girls", "Boys", "Children", "Senior"];

  const typeCategories: string[] = [
    "Sunglasses", "Reading Glasses", "Computer Glasses",
    "Contact Lenses", "Lenses", "Accessories", "Medicine",
    "Blue Cut", "Daily Use", "Office", "Fashion", "Outdoor",
    "Comfort", "Unbreakable"
  ];

  const toggleCategory = (cat: string): void => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filteredProducts = selectedCategories.length === 0
    ? products
    : products.filter(p =>
        p.categories.some(cat => selectedCategories.includes(cat))
      );

  // -------------------- JSX --------------------
  return (
    <div className="min-h-screen bg-gray-50 py-3 px-4">

      <h1 className="text-2xl font-bold text-center mb-2">Eye Clinic Products</h1>

      {/* FILTERS */}
      <div className="space-y-1 mb-2">

        {/* Mobile Row 1 */}
        <div className="flex overflow-x-auto space-x-3 py-1 scrollbar-hide lg:hidden">
          {peopleCategories.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap transition ${
                selectedCategories.includes(cat)
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Mobile Row 2 */}
        <div className="flex overflow-x-auto space-x-3 py-1 scrollbar-hide lg:hidden">
          {typeCategories.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap transition ${
                selectedCategories.includes(cat)
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Desktop All-in-one */}
        <div className="hidden lg:flex overflow-x-auto space-x-3 py-1 md:py-2 scrollbar-hide">
          {[...peopleCategories, ...typeCategories].map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-4 py-2 rounded-full border text-sm whitespace-nowrap transition ${
                selectedCategories.includes(cat)
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            onClick={() => setSelectedProduct(product)}
            className="p-3 bg-white rounded-lg shadow cursor-pointer hover:shadow-lg transition"
          >
            <div className="relative w-full h-36 mb-2 rounded-lg overflow-hidden">
              <Image src={product.image} alt={product.name} fill className="object-cover" />
            </div>

            <h2 className="text-sm font-semibold">{product.name}</h2>
            <p className="font-bold text-teal-600 text-sm">₹{product.price}</p>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg w-11/12 sm:w-2/3 lg:w-1/2 shadow-xl relative">

            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-3 right-3 lg:mb-3 z-40 text-lg font-bold"
            >
              ✕
            </button>

            <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden">
              <Image
                src={selectedProduct.image}
                alt={selectedProduct.name}
                fill
                className="object-cover"
              />
            </div>

            <h2 className="text-xl font-semibold mb-2">{selectedProduct.name}</h2>
            <p className="text-teal-600 font-bold text-lg mb-2">₹{selectedProduct.price}</p>
            <p className="text-gray-700 mb-3">{selectedProduct.description}</p>

            <p className="text-sm text-gray-600 mb-3">
              Categories: {selectedProduct.categories.join(", ")}
            </p>

            <p
              className={`text-sm font-medium ${
                selectedProduct.customizable ? "text-green-600" : "text-red-600"
              }`}
            >
              {selectedProduct.customizable
                ? "Customization Available"
                : "Customization Not Available"}
            </p>

          </div>
        </div>
      )}
      
    </div>
  );
}
