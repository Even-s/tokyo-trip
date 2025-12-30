import React, { useState, useMemo } from 'react';
import { Activity, TicketSlot } from '@/lib/types';
import { MapPin, ChevronDown, ChevronUp, ExternalLink, Image as ImageIcon, FileText, Smartphone, Mail, Plane, Info, Navigation } from 'lucide-react';
import { cn, buildGoogleMapsUrl, buildTripComFlightStatusUrl, openNissanRentacarApp } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { AIRLINE_CODES } from '@/config/airline-codes';

interface ItineraryCardProps {
  item: Activity;
  index: number;
  onQrClick?: (slots: TicketSlot[], index: number) => void;
}


// Shared button style for Map Targets and App Jump buttons to ensure visual consistency
const ACTION_BUTTON_CLASS = "flex items-center gap-2 px-4 py-3 border border-gray-200 hover:border-[#FF0000] hover:text-[#FF0000] transition-colors bg-white text-black min-h-[48px]";

// App Jump button style: Same dimensions as ACTION_BUTTON_CLASS but with black background
const APP_BUTTON_CLASS = "w-fit flex items-center gap-2 px-4 py-3 border border-black bg-black text-white hover:bg-[#FF0000] hover:border-[#FF0000] transition-colors min-h-[48px]";

export const ItineraryCard: React.FC<ItineraryCardProps> = ({ item, index, onQrClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleOpen = () => setIsOpen(!isOpen);

  const handleLinkClick = (e: React.MouseEvent) => e.stopPropagation();

  const handleNavigateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Specific destination for "開車到賽馬場"
    const destination = "中山競馬場 1 Chome-1-1 Kosaku, Funabashi, Chiba 273-0037日本";
    const placeId = "ChIJ4Q4RGRmBGGARqXPCxeMoczk"; // Nakayama Racecourse Place ID
    const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&destination_place_id=${placeId}&travelmode=driving`;

    // On mobile, location.href is often better for opening apps.
    // On desktop, window.open is standard for new tabs.
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = navUrl;
    } else {
      window.open(navUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const groupedSlots = useMemo(() => {
    return item.ticketSlots.reduce((acc, slot) => {
      const type = slot.type;
      if (!acc[type]) acc[type] = [];
      acc[type].push(slot);
      return acc;
    }, {} as Record<string, TicketSlot[]>);
  }, [item.ticketSlots]);

  return (
    <div 
      className="group relative w-full border-t border-black py-8 md:py-12 transition-colors hover:bg-gray-50 cursor-pointer"
      onClick={toggleOpen}
    >
      <div className="grid grid-cols-4 md:grid-cols-12 gap-4 md:gap-8">
        
        {/* Column 1: Time (Mobile: Col 1, Desktop: Col 1-3) */}
        <div className="col-span-1 md:col-span-3 flex flex-col">
          <span className="text-xl md:text-3xl font-bold tracking-tighter">
            {item.time.split(' - ')[0]}
          </span>
          {item.time.includes('-') && (
            <span className="text-xs md:text-sm text-gray-500 font-medium mt-1">
              — {item.time.split(' - ')[1]}
            </span>
          )}
        </div>

        {/* Column 2: Content (Mobile: Col 2-4, Desktop: Col 4-12) */}
        <div className="col-span-3 md:col-span-9 flex flex-col gap-4">
          
          {/* Header Info */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 flex-wrap">
               {/* Location Tag - Swiss Red */}
              {item.placeName && (
                <div className="flex items-center gap-1 text-[10px] md:text-xs font-bold uppercase tracking-[0.15em] text-[#FF0000]">
                  <MapPin size={12} strokeWidth={3} />
                  <span className="truncate max-w-[200px]">{item.location || item.placeName}</span>
                </div>
              )}
              {/* Status Chips */}
              {item.reservedLabel && !['LINK+驗證碼', 'LINK + 驗證碼', 'LINK_CODE'].includes(item.reservedLabel) && (
                <span className="px-1.5 py-0.5 border border-[#FF0000] text-[#FF0000] text-[9px] font-bold uppercase tracking-wider">
                  {item.reservedLabel}
                </span>
              )}
            </div>

            {/* 修正 1：標題字級與行高 */}
            <h3 className="text-2xl md:text-4xl font-bold leading-[1.1] tracking-tight text-black group-hover:text-[#FF0000] transition-colors duration-300">
              {item.title}
            </h3>
            
            {/* 修正 2：新增航班資訊顯示區塊 */}
            {item.flightInfo && (() => {
              const flightNo = `${item.flightInfo.airlineCode}${item.flightInfo.flightNumber}`;
              const trackerUrl = buildTripComFlightStatusUrl(flightNo);
              const displayContent = (
                <>
                  <Plane size={14} className="currentColor" />
                  <span>
                    航班：{AIRLINE_CODES[item.flightInfo.airlineCode] || item.flightInfo.airlineCode} {flightNo}
                  </span>
                  {trackerUrl && <ExternalLink size={10} className="opacity-50" />}
                </>
              );

              return trackerUrl ? (
                <a
                  href={trackerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 text-sm font-medium mt-2 w-fit cursor-pointer transition-colors text-black hover:text-[#FF0000] active:text-[#FF0000]"
                  title="Track Flight on Trip.com"
                >
                  {displayContent}
                </a>
              ) : (
                <div className="flex items-center gap-2 text-sm font-medium mt-2 w-fit text-gray-600 cursor-default">
                  {displayContent}
                </div>
              );
            })()}

            {/* Rich Description */}
            {item.description && (
              <p className="text-sm md:text-base leading-relaxed text-black/70 max-w-prose mt-3 mb-6">
                {item.description}
              </p>
            )}

            {/* Render notes here ONLY if it's NOT the special Ninja show notes */}
            {item.notes && !/^\d+$/.test(item.notes) && !item.title.includes('東京忍者＆歌舞伎表演') && (
              <p className="text-sm text-gray-500 mt-2 max-w-2xl leading-relaxed whitespace-pre-line">
                {item.notes}
              </p>
            )}
          </div>

          {/* Expand Indicator */}
          <div className="flex justify-end mt-4 md:mt-0 md:absolute md:right-0 md:top-12">
             {isOpen ? <ChevronUp className="text-black" /> : <ChevronDown className="text-gray-300 group-hover:text-black transition-colors" />}
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden w-full"
              >
                <div className="pt-8 md:pt-12 flex flex-col gap-12 border-t border-gray-100 mt-8">
                  
                  {/* A) Map Targets */}
                  {item.mapTargets.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-3 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">地圖</div>
                      <div className="md:col-span-9 flex flex-wrap gap-3">
                        {item.mapTargets.map((target, idx) => (
                          <a
                            key={idx}
                            href={buildGoogleMapsUrl(target)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleLinkClick}
                            className={ACTION_BUTTON_CLASS}
                          >
                            <MapPin size={14} />
                            <span className="text-sm font-bold">{target.label || target.query}</span>
                            <ExternalLink size={10} className="ml-1 opacity-50" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Special Navigation CTA for Nakayama Racecourse */}
                  {item.title === '開車到賽馬場' && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-3 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">導航</div>
                      <div className="md:col-span-9 flex flex-wrap gap-3">
                        <button
                          onClick={handleNavigateClick}
                          className={ACTION_BUTTON_CLASS}
                        >
                          <Navigation size={14} />
                          <span className="text-sm font-bold">汽車導航到中山競馬場</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Special Notes for Ninja Show - using the same style as Lake Kawaguchi */}
                  {item.title.includes('東京忍者＆歌舞伎表演') && item.notes && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                       <div className="md:col-span-3 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">注意事項</div>
                       <div className="md:col-span-9">
                          <div className="bg-gray-50 p-4 border border-gray-200 text-xs text-gray-600 leading-relaxed space-y-1">
                            <p className="font-bold text-black mb-2">注意事項 / Notes:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {/* Split notes string into list items */}
                              {item.notes.split('\n').map((line, index) => (
                                line.trim() && <li key={index}>{line.replace(/•\s*/, '')}</li>
                              ))}
                            </ul>
                          </div>
                       </div>
                    </div>
                  )}

                  {/* B) Info Links */}
                  {item.infoLinks && item.infoLinks.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-3 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">資訊</div>
                      <div className="md:col-span-9 flex flex-col gap-2">
                        {item.infoLinks.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleLinkClick}
                            className="flex items-center gap-3 p-4 border border-gray-200 hover:border-black transition-colors bg-white group/link"
                          >
                            <Info size={18} className="text-gray-400 group-hover/link:text-black" />
                            <span className="text-sm font-bold">{link.label}</span>
                            <ExternalLink size={12} className="ml-auto opacity-50" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* C) Tickets & Vouchers */}
                  {item.ticketSlots.length > 0 && (
                    <>
                      {/* 2.1 PDF 文件 */}
                      {groupedSlots['pdf'] && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-3 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">PDF 文件</div>
                          <div className="md:col-span-9 space-y-6">
                            <TicketGroupRenderer type="pdf" slots={groupedSlots['pdf']} activity={item} onQrClick={onQrClick} />
                          </div>
                        </div>
                      )}

                      {/* 2.2 QR Code */}
                      {groupedSlots['qr_image'] && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-3 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">QR Code</div>
                          <div className="md:col-span-9 space-y-6">
                            <TicketGroupRenderer type="qr_image" slots={groupedSlots['qr_image']} activity={item} onQrClick={onQrClick} />
                          </div>
                        </div>
                      )}

                      {/* 2.3 票券連結 (LINK / LINK_WITH_CODE / GMAIL) */}
                      {(groupedSlots['link_with_code'] || groupedSlots['link'] || groupedSlots['gmail']) && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-3 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">票券連結</div>
                          <div className="md:col-span-9 space-y-6">
                            {groupedSlots['link_with_code'] && <TicketGroupRenderer type="link_with_code" slots={groupedSlots['link_with_code']} activity={item} onQrClick={onQrClick} />}
                            {groupedSlots['link'] && <TicketGroupRenderer type="link" slots={groupedSlots['link']} activity={item} onQrClick={onQrClick} />}
                            {groupedSlots['gmail'] && <TicketGroupRenderer type="gmail" slots={groupedSlots['gmail']} activity={item} onQrClick={onQrClick} />}
                          </div>
                        </div>
                      )}

                      {/* 2.4 APP */}
                      {groupedSlots['app'] && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-3 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">APP</div>
                          <div className="md:col-span-9 space-y-6">
                            <TicketGroupRenderer type="app" slots={groupedSlots['app']} activity={item} onQrClick={onQrClick} />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components for Tickets (Swiss Style) ---

const TicketGroupRenderer: React.FC<{
  type: TicketSlot['type'];
  slots: TicketSlot[];
  activity: Activity;
  onQrClick?: (slots: TicketSlot[], index: number) => void;
}> = ({ type, slots, activity, onQrClick }) => {
  
  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  switch (type) {
    case 'pdf':
      return (
        <div className="flex flex-wrap gap-3">
          {slots.map(slot => (
            <a
              key={slot.id}
              href={slot.value || '#'}
              download
              target="_blank"
              rel="noopener noreferrer"
              onClick={stopProp}
              className={ACTION_BUTTON_CLASS}
            >
              <div className="flex items-center gap-2">
                <FileText size={14} />
                <span className="text-sm font-bold">{slot.label}</span>
              </div>
              <ExternalLink size={10} className="ml-1 opacity-50" />
            </a>
          ))}
        </div>
      );

    case 'qr_image':
      return (
        <div className="flex flex-col gap-4">
          {/* Special Notes for Lake Kawaguchi Ropeway */}
          {activity.title.includes('河口湖纜車') && (
            <div className="bg-gray-50 p-4 border border-gray-200 text-xs text-gray-600 leading-relaxed space-y-1">
              <p className="font-bold text-black mb-2">注意事項 / Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>只限 Mt. Fuji Panoramic Ropeway (Round-trip) 兌換使用</li>
                <li>請至售票處出示此憑證並掃描 QR code 兌換實體票券</li>
                <li>票券不可退費、不可延期 (No refund / extend)</li>
                <li>遺失或損毀不補發 (Not reissued)</li>
                <li>禁止轉售與轉讓 (Resale/transfer prohibited)</li>
              </ul>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {slots.map((slot, idx) => (
              <button
                key={slot.id}
                onClick={(e) => { stopProp(e); onQrClick?.(slots, idx); }}
                className="aspect-square flex flex-col items-center justify-center gap-2 border border-gray-200 hover:border-[#FF0000] bg-white transition-all p-4"
              >
                <ImageIcon size={24} className="text-gray-300" />
                <span className="text-xs font-bold text-center">{slot.label}</span>
                <span className="text-[9px] uppercase tracking-widest text-[#FF0000]">View QR</span>
              </button>
            ))}
          </div>
        </div>
      );

    case 'link_with_code':
      return (
        <div className="space-y-4">
          {slots.map(slot => {
            const data = slot.value || {};
            const [copied, setCopied] = useState(false);
            
            const handleOpenAndCopy = (e: React.MouseEvent) => {
              e.stopPropagation();
              // 1. Copy Code
              if (data.code) {
                navigator.clipboard.writeText(data.code);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
              }
              // 2. Open Link
              if (data.url) {
                window.open(data.url, '_blank', 'noopener,noreferrer');
              }
            };

            const handleCopyOnly = (e: React.MouseEvent) => {
              e.stopPropagation();
              if (data.code) {
                navigator.clipboard.writeText(data.code);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
              }
            };

            return (
              <div key={slot.id} className="border border-black p-6 bg-white flex flex-col gap-4" onClick={stopProp}>
                <div className="flex justify-between items-start">
                   <h4 className="font-bold text-lg">{data.serviceName || (['LINK+驗證碼', 'LINK + 驗證碼'].includes(slot.label) ? 'Voucher' : slot.label)}</h4>
                   {/* Toast / Hint */}
                   <AnimatePresence>
                     {copied && (
                       <motion.span 
                         initial={{ opacity: 0, y: 10 }} 
                         animate={{ opacity: 1, y: 0 }} 
                         exit={{ opacity: 0 }}
                         className="text-xs font-bold text-white bg-black px-2 py-1"
                       >
                         已複製驗證碼 {data.code}
                       </motion.span>
                    )}
                   </AnimatePresence>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4">
                    {data.url && (
                        <button 
                            onClick={handleOpenAndCopy}
                            className="flex-1 bg-black text-white py-3 px-4 font-bold hover:bg-[#FF0000] transition-colors text-center"
                        >
                            開啟票券連結
                        </button>
                    )}
                    {data.code && (
                        <button 
                            onClick={handleCopyOnly}
                            className="flex-1 border border-black text-black py-3 px-4 font-bold hover:bg-gray-100 transition-colors text-center"
                        >
                            複製驗證碼 ({data.code})
                        </button>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      );

    case 'app':
      return (
        <div className="flex flex-col gap-2">
          {slots.map((slot) => (
            <button
              key={slot.id}
              onClick={(e) => {
                e.stopPropagation();
                openNissanRentacarApp();
              }}
              className={APP_BUTTON_CLASS}
            >
              <Smartphone size={14} />
              <span className="text-sm font-bold">{slot.label}</span>
              <ExternalLink size={10} className="ml-1 opacity-50" />
            </button>
          ))}
        </div>
      );

    case 'gmail':
      return (
        <div className="flex flex-col gap-2">
          {slots.map(slot => (
            <a
              key={slot.id}
              href={slot.value?.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={stopProp}
              className={APP_BUTTON_CLASS}
            >
              <Mail size={14} />
              <span className="text-sm font-bold">
                {slot.label}
              </span>
              <ExternalLink size={10} className="ml-1 opacity-50" />
            </a>
          ))}
        </div>
      );
      
    case 'link':
      return (
        <div className="flex flex-wrap gap-3">
          {slots.map(slot => (
             <a
              key={slot.id}
              href={slot.value || '#'}
              target="_blank"
              rel="noopener noreferrer"
              onClick={stopProp}
              className={ACTION_BUTTON_CLASS}
             >
               <ExternalLink size={14} />
               <span className="text-sm font-bold">{slot.label}</span>
             </a>
          ))}
        </div>
      );

    default:
      return null;
  }
};
