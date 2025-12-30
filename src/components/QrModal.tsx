// src/components/QrModal.tsx
'use client';

import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrls: string[];
  currentIndex: number;
  onNavigate: (newIndex: number) => void;
}

export default function QrModal({ isOpen, onClose, imageUrls, currentIndex, onNavigate }: QrModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === 'ArrowRight' && currentIndex < imageUrls.length - 1) onNavigate(currentIndex + 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, currentIndex, imageUrls.length, onNavigate]);

  if (!isOpen || !imageUrls[currentIndex]) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white hover:text-[#FF0000] transition-colors"
      >
        <X size={32} strokeWidth={1.5} />
      </button>

      <div 
        className="relative w-full max-w-2xl flex flex-col items-center" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation - Left */}
        {imageUrls.length > 1 && (
          <button
            onClick={() => currentIndex > 0 && onNavigate(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="absolute left-0 md:-left-16 top-1/2 -translate-y-1/2 p-2 text-white disabled:opacity-20 hover:text-[#FF0000] transition-colors"
          >
            <ChevronLeft size={40} strokeWidth={1} />
          </button>
        )}

        {/* Image Container */}
        <div className="bg-white p-4 md:p-8 max-h-[80vh] overflow-auto">
          <img 
            src={imageUrls[currentIndex]} 
            alt="QR Code" 
            className="max-w-full h-auto object-contain mx-auto" 
          />
        </div>

        {/* Navigation - Right */}
        {imageUrls.length > 1 && (
          <button
            onClick={() => currentIndex < imageUrls.length - 1 && onNavigate(currentIndex + 1)}
            disabled={currentIndex === imageUrls.length - 1}
            className="absolute right-0 md:-right-16 top-1/2 -translate-y-1/2 p-2 text-white disabled:opacity-20 hover:text-[#FF0000] transition-colors"
          >
            <ChevronRight size={40} strokeWidth={1} />
          </button>
        )}

        {/* Pagination Indicator */}
        {imageUrls.length > 1 && (
          <div className="mt-6 text-white font-mono text-sm tracking-widest">
            {String(currentIndex + 1).padStart(2, '0')} / {String(imageUrls.length).padStart(2, '0')}
          </div>
        )}
      </div>
    </div>
  );
}
