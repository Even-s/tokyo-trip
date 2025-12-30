'use client';

import { useState } from 'react';
import type { FileAttachmentMap } from '@/data/itinerary-attachments';
import QrCard from './QrCard';
import QrModal from './QrModal';

interface TicketAttachmentsProps {
  attachments?: FileAttachmentMap[string];
}

export default function TicketAttachments({ attachments }: TicketAttachmentsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCurrentIndex, setModalCurrentIndex] = useState(0);

  const qrAttachments = attachments?.qr || [];
  const pdfAttachments = attachments?.pdf || [];

  const handleQrClick = (index: number) => {
    setModalCurrentIndex(index);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (!qrAttachments.length && !pdfAttachments.length) {
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      {pdfAttachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {pdfAttachments.map((pdf, index) => (
            <a
              key={index}
              href={pdf.url}
              target="_blank"
              rel="noopener noreferrer"
              download={pdf.file}
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1 bg-gray-100 text-sm text-gray-800 rounded hover:bg-gray-300 hover:text-black transition-colors flex items-center gap-1"
            >
              <span className="text-swiss-red font-bold text-xs">PDF</span>
              {pdf.label}
            </a>
          ))}
        </div>
      )}

      {qrAttachments.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {qrAttachments.map((qr, index) => (
            <QrCard
              key={index}
              attachment={qr}
              onClick={() => handleQrClick(index)}
            />
          ))}
        </div>
      )}

      <QrModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        imageUrls={qrAttachments.map(qr => qr.url)}
        currentIndex={modalCurrentIndex}
        onNavigate={setModalCurrentIndex}
      />
    </div>
  );
}