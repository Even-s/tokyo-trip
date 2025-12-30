'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { itineraryData } from '../lib/itinerary';
import { ItineraryCard } from '@/components/ItineraryCard';
import QrModal from '@/components/QrModal';
import { TicketSlot } from '@/lib/types';

export default function Home() {
  // 1. 資料分組邏輯
  const groupedByDate = useMemo(() => {
    return (itineraryData as any[]).reduce<Record<string, typeof itineraryData>>((acc, item) => {
      const date = item.date;
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});
  }, {});

  const days = Object.keys(groupedByDate);
  const [activeDay, setActiveDay] = useState(days[0]);
  
  // 2. QR Modal 全域狀態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSlots, setModalSlots] = useState<TicketSlot[]>([]);
  const [modalInitialIndex, setModalInitialIndex] = useState(0);

  const handleQrClick = (slots: TicketSlot[], index: number) => {
    setModalSlots(slots);
    setModalInitialIndex(index);
    setIsModalOpen(true);
  };

  // 3. 處理 Sticky Header 的日期切換
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-white text-black pb-32">
      {/* --- Swiss Typography Header --- */}
      <header className="pt-24 pb-12 px-4 md:px-8 max-w-screen-xl mx-auto">
        <div className="grid grid-cols-4 md:grid-cols-12 gap-4">
          <div className="col-span-4 md:col-span-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-9xl font-bold tracking-tighter leading-[0.85]"
            >
              TOKYO<br />
              TYPO<br />
              <span className="text-[#FF0000]">TRIP</span>
            </motion.h1>
          </div>
          <div className="col-span-4 md:col-span-4 flex flex-col justify-end items-start md:items-end mt-8 md:mt-0">
            <div className="text-right font-medium">
              <p className="text-sm tracking-widest uppercase mb-1 text-gray-500">2025.12.31 — 2026.01.05</p>
              <p className="text-lg font-bold">TOKYO, JAPAN</p>
            </div>
          </div>
        </div>
      </header>

      {/* --- Sticky Day Switcher --- */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-black">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8">
          <div className="flex overflow-x-auto no-scrollbar py-4 gap-8 md:gap-12 items-center">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => {
                  setActiveDay(day);
                  scrollToTop();
                }}
                className={`
                  whitespace-nowrap text-sm md:text-base font-bold tracking-widest uppercase transition-colors duration-300
                  ${activeDay === day ? 'text-[#FF0000]' : 'text-gray-400 hover:text-black'}
                `}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- Itinerary Content --- */}
      <section className="max-w-screen-xl mx-auto px-4 md:px-8 pt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDay}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Day Title */}
            <div className="mb-12 md:mb-20">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-black">
                {activeDay}
              </h2>
            </div>

            {/* List */}
            <div className="flex flex-col">
              {groupedByDate[activeDay]?.map((item, index) => (
                <ItineraryCard 
                  key={item.id} 
                  item={item} 
                  index={index} 
                  onQrClick={handleQrClick}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* --- Footer --- */}
      <footer className="py-20 text-center">
        <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
          Designed with International Typographic Style
        </p>
      </footer>

      {/* --- Global QR Modal --- */}
      <QrModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrls={modalSlots.map(s => s.value || '')}
        currentIndex={modalInitialIndex}
        onNavigate={setModalInitialIndex}
      />
    </main>
  );
}
