'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { itineraryData } from '../lib/itinerary';
import { ItineraryCard } from '../components/ItineraryCard';

export default function Home() {
  return (
    <main className="min-h-screen bg-swiss-white text-swiss-black selection:bg-swiss-red selection:text-white">
      {/* Header Section: Swiss Typography Header */}
      <header className="max-w-5xl mx-auto px-4 pt-20 pb-12 md:pt-32 md:pb-24">
        <div className="grid grid-cols-12 gap-4">
          {/* Title (Left aligned, spanning mostly) */}
          <div className="col-span-12 md:col-span-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9]"
            >
              TOKYO<br />
              TYPOGRAPHY<br />
              <span className="text-swiss-red">TRIP</span>
            </motion.h1>
          </div>

          {/* Meta Info (Right aligned or stacked on mobile) */}
          <div className="col-span-12 md:col-span-4 flex flex-col justify-end items-start md:items-end mt-8 md:mt-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-right"
            >
              <p className="font-mono text-sm md:text-base tracking-widest uppercase mb-1">
                2025.12.31 — 2026.01.05
              </p>
              <p className="font-bold text-sm md:text-base">
                TOKYO, JAPAN
              </p>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Itinerary List Section */}
      <section className="max-w-5xl mx-auto px-4 pb-32">
        <div className="flex flex-col">
          {itineraryData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <ItineraryCard item={item} index={index} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-xs font-mono text-gray-400">
        DESIGNED WITH SWISS STYLE
      </footer>
    </main>
  );
}