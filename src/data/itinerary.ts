// src/data/itinerary.ts
import { attachmentsByFolder, type FileAttachmentMap } from './itinerary-attachments';

export interface ItineraryItem {
  id: string;
  date: string;      // YYYY-MM-DD
  time: string;      // HH:MM
  location: string;
  activity: string;
  category: 'Travel' | 'Food' | 'Event' | 'Stay';
  isReserved: boolean;
  note?: string;

  /**
   * ✅ 最穩的附件對應方式：直接指定資料夾名稱
   * 必須 100% 等於 public/itinerary-assets 底下的資料夾名
   */
  attachmentFolder?: keyof FileAttachmentMap;

  /**
   * 由 attachmentFolder 自動帶出（UI用）
   */
  attachments?: FileAttachmentMap[string];
}

const withAttachments = (items: ItineraryItem[]): ItineraryItem[] => {
  return items.map((item) => {
    if (!item.attachmentFolder) return item;
    return {
      ...item,
      attachments: attachmentsByFolder[item.attachmentFolder],
    };
  });
};

export const itineraryData: ItineraryItem[] = withAttachments([
  // ===== 2025-12-31 =====
  {
    id: '2025-12-31-01',
    date: '2025-12-31',
    time: '13:05',
    location: 'Kaohsiung Intl. Airport → Narita Airport',
    activity: '飛往東京成田機場',
    category: 'Travel',
    isReserved: true,
    note: '五人機票（PDF 共 5 份，以你實際資料夾為準）',
    attachmentFolder: '2025-12-31__飛往東京成田機場',
  },
  {
    id: '2025-12-31-02',
    date: '2025-12-31',
    time: '20:30',
    location: '東京東日本橋凱富飯店',
    activity: '入住 東京東日本橋凱富飯店',
    category: 'Stay',
    isReserved: true,
    note: '入住憑證（PDF 2 份）',
    attachmentFolder: '2025-12-31__入住-東京東日本橋凱富飯店',
  },

  // ===== 2026-01-01 =====
  {
    id: '2026-01-01-01',
    date: '2026-01-01',
    time: '11:20',
    location: 'SYMPHONY TOKYO BAY',
    activity: '東京灣遊船午餐',
    category: 'Food',
    isReserved: true,
    note: '預約單（PDF 3 份：1P / 2P_1 / 2P_2）',
    attachmentFolder: '2026-01-01__東京灣遊船午餐',
  },

  // ===== 2026-01-03 =====
  {
    id: '2026-01-03-01',
    date: '2026-01-03',
    time: '16:00',
    location: '伊勢丹 新宿店',
    activity: '伊勢丹 新宿店',
    category: 'Travel',
    isReserved: true,
    note: '龍騰卡（QR 5 張）',
    attachmentFolder: '2026-01-03__伊勢丹-新宿店',
  },

  // ===== 2026-01-05 =====
  {
    id: '2026-01-05-01',
    date: '2026-01-05',
    time: '16:00',
    location: 'I.A.S.S SUPERIOR LOUNGE 希和 -NOA-',
    activity: '貴賓室體驗 (希和 -NOA-)',
    category: 'Event',
    isReserved: true,
    note: '入場券（QR 5 張）',
    attachmentFolder: '2026-01-05__貴賓室體驗-希和--noa-',
  },
]);
