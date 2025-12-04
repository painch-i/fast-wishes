import { Tag } from "antd";
import React from "react";
import { PublicWishCard } from "../../components";
import type { Wish } from "../../components";
import "./BabyWishlistDemoPage.css";

const demoOwnerId = "demo-baby-parent";

const demoWishes: Wish[] = [
  {
    id: 101,
    name: "Convertible crib with organic mattress",
    description: "Greenguard-certified crib that turns into a toddler bed to grow with baby.",
    price: "399",
    currency: "USD",
    status: "available",
    is_public: true,
    is_reserved: false,
    price_is_approx: false,
    priority: 1,
    tag: "nursery",
    url: "https://example.com/crib",
    created_at: "2024-12-01T10:00:00Z",
    user_id: demoOwnerId,
    emoji: "🛏️",
    images: [
      {
        id: 201,
        created_at: "2024-12-01T10:00:00Z",
        wish_id: 101,
        storage_object_name: "demo/crib.jpg",
        url: "https://images.unsplash.com/photo-1504151932400-72d4384f04b3?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: 102,
    name: "Video baby monitor with night vision",
    description: "Secure HD monitor with breathing alerts and a flexible floor stand.",
    price: "249",
    currency: "USD",
    status: "available",
    is_public: true,
    is_reserved: false,
    price_is_approx: false,
    priority: 1,
    tag: "tech",
    url: "https://example.com/monitor",
    created_at: "2024-12-01T10:05:00Z",
    user_id: demoOwnerId,
    emoji: "📡",
    images: [
      {
        id: 202,
        created_at: "2024-12-01T10:05:00Z",
        wish_id: 102,
        storage_object_name: "demo/monitor.jpg",
        url: "https://images.unsplash.com/photo-1582719478248-54e9f2af4c93?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: 203,
        created_at: "2024-12-01T10:06:00Z",
        wish_id: 102,
        storage_object_name: "demo/monitor-detail.jpg",
        url: "https://images.unsplash.com/photo-1527443224154-d7aa3ffda1c4?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: 103,
    name: "Ergonomic baby carrier",
    description: "Breathable mesh carrier that supports newborns up to 33 lbs with hip-healthy positioning.",
    price: "189",
    currency: "USD",
    status: "available",
    is_public: true,
    is_reserved: false,
    price_is_approx: false,
    priority: 2,
    tag: "on-the-go",
    url: "https://example.com/carrier",
    created_at: "2024-12-01T10:10:00Z",
    user_id: demoOwnerId,
    emoji: "🤱",
    images: [
      {
        id: 204,
        created_at: "2024-12-01T10:10:00Z",
        wish_id: 103,
        storage_object_name: "demo/carrier.jpg",
        url: "https://images.unsplash.com/photo-1495197359483-d092478c170a?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: 104,
    name: "Smart sound machine",
    description: "White noise, lullabies, and sunrise light to help baby wind down and wake gently.",
    price: "89",
    currency: "USD",
    status: "available",
    is_public: true,
    is_reserved: false,
    price_is_approx: false,
    priority: 2,
    tag: "sleep",
    url: "https://example.com/sound-machine",
    created_at: "2024-12-01T10:15:00Z",
    user_id: demoOwnerId,
    emoji: "🎶",
    images: [
      {
        id: 205,
        created_at: "2024-12-01T10:15:00Z",
        wish_id: 104,
        storage_object_name: "demo/sound-machine.jpg",
        url: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
  {
    id: 105,
    name: "Newborn essentials basket",
    description: "Swaddles, muslin blankets, nail file, and gentle skincare in one grab-and-go kit.",
    price: "120",
    currency: "USD",
    status: "available",
    is_public: true,
    is_reserved: false,
    price_is_approx: false,
    priority: 3,
    tag: "care",
    url: "https://example.com/essentials",
    created_at: "2024-12-01T10:20:00Z",
    user_id: demoOwnerId,
    emoji: "🧴",
    images: [
      {
        id: 206,
        created_at: "2024-12-01T10:20:00Z",
        wish_id: 105,
        storage_object_name: "demo/essentials.jpg",
        url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
      },
    ],
  },
];

const badges = [
  "Baby registry ready",
  "Free to share",
  "English copy",
  "Screenshot friendly",
];

export const BabyWishlistDemoPage: React.FC = () => {
  return (
    <div className="demo-page">
      <header className="demo-hero">
        <div>
          <p className="eyebrow">Demo – Baby shower campaign</p>
          <h1>Your modern baby wishlist</h1>
          <p className="lead">
            Show parents-to-be how effortless gifting can be. Share a curated, English-first
            wishlist that feels warm, organized, and ready for screenshots.
          </p>
          <div className="badge-row">
            {badges.map((label) => (
              <Tag key={label} className="pill">{label}</Tag>
            ))}
          </div>
        </div>
        <div className="hero-note">
          <p>Tip for ads</p>
          <strong>Use this page to capture clean visuals without showing real data.</strong>
        </div>
      </header>

      <section className="demo-grid" aria-label="Demo baby wishlist">
        {demoWishes.map((wish) => (
          <PublicWishCard key={wish.id} wish={wish} />
        ))}
      </section>
    </div>
  );
};

