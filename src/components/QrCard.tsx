// src/components/QrCard.tsx
'use client';

import { useState } from 'react';
import type { Attachment } from '@/data/itinerary-attachments';

interface QrCardProps {
  attachment: Attachment;
  onClick: () => void;
}

export default function QrCard({ attachment, onClick }: QrCardProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    // 【請求項目 1】在 console 印出錯誤資訊
    console.error(`[QR Card Error] Failed to load image.
      - URL (encoded): ${attachment.url}
      - File: ${attachment.file}`);
  };

  return (
    <div
      className="border border-gray-200 p-2 flex flex-col items-center justify-between aspect-square cursor-pointer hover:bg-swiss-offwhite hover:shadow-sm transition-all duration-200 rounded-md"
      onClick={(e) => {
        e.stopPropagation();
        if (!hasError) onClick();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick()}}
    >
      <div className="w-full h-full flex items-center justify-center">
        {hasError ? (
          // 【請求項目 3】圖片載入失敗的 fallback UI
          <div className="text-center text-swiss-red text-xs font-semibold">
            <p>Image</p>
            <p>Not Found</p>
          </div>
        ) : (
          <img
            src={attachment.url}
            alt={attachment.label}
            className="w-full h-full object-contain"
            onError={handleError}
            loading="lazy"
          />
        )}
      </div>
      <span className="mt-2 text-xs text-center text-swiss-black truncate w-full">{attachment.label}</span>
      
      {/* 【請求項目 3】開發模式下顯示 URL 方便肉眼比對 */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          className="mt-1 text-[9px] text-gray-400 break-all w-full leading-tight" 
          title={attachment.url}
          onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(attachment.url); console.log('URL copied to clipboard'); }}
        >
          URL: ...{attachment.url.slice(-40)}
        </div>
      )}
    </div>
  );
}
