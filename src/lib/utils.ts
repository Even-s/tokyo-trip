import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { MapTarget, TicketSlot, TicketType, Activity, InfoLink } from "./types";
import { AIRLINE_CODES } from '@/config/airline-codes';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 產生用於匹配附件的正規化 Key
 * @param date - 日期字串 e.g., "2025/12/31 (三)"
 * @param title - 行程標題
 */
export function normalizeActivityKey(date: string, title: string): string {
  // 正規化日期: YYYY/M/D -> YYYY-MM-DD
  const datePart = date.split(' ')[0];
  const [year, month, day] = datePart.split('/');
  const normalizedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  
  // 正規化標題: trim, 全形空白 -> 半形, 移除所有空白和標點符號
  const normalizedTitle = title
    .trim()
    .replace(/　/g, ' ')
    .replace(/\s+/g, '') // remove all spaces
    .replace(/[（()）、-]/g, ''); // More robust removal of punctuation

  return `${normalizedDate}|${normalizedTitle}`;
}

/**
 * 產生用於檔案路徑的 Activity ID (URL-safe slug)
 * 例如: "2025-12-31__自宅出發"
 */
export function buildActivityId(date: string, title: string): string {
  // 移除括號內的星期幾，例如 "2025/12/31 (三)" -> "2025/12/31"
  const cleanDate = date.split(' ')[0].replace(/\//g, '-');
  const slug = title.substring(0, 30); // 截斷以避免過長

  const str = `${cleanDate}__${slug}`;
  
  // 轉為 Slug: 小寫、移除特殊符號、空白轉 dash
  return str.toLowerCase()
    .replace(/[\s()（）]+/g, '-') // 移除空白和括號
    .replace(/[^\w\u4e00-\u9fa5\-]+/g, '') // 保留英數、中文、Dash
    .replace(/-+/g, '-')          // 移除重複 Dash
    .replace(/^-|-$/g, '');       // 移除頭尾 Dash
}

/**
 * 正規化地點顯示名稱
 * 規則：統一將「我家」顯示為「家」
 */
export function normalizePlaceLabel(label?: string): string {
  if (!label) return '';
  const trimmed = label.trim();
  if (trimmed === '我家') return '家';
  return trimmed;
}

/**
 * 正規化用於描述匹配的 Key
 */
export function normalizeForDescriptionMatch(s: string): string {
  if (!s) return '';
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, '') // 去除括號內容
    .replace(/[\s-－—&・／:：]+/g, '') // 去除所有空白、破折號、符號
    .replace(/[^\w\u4e00-\u9fa5\u3040-\u30ff\u31f0-\u31ff]+/g, ''); // 只保留中/日/英文字母數字
}

/**
 * 解析地圖連結
 * 支援格式：
 * 1. 單一 URL
 * 2. 逗號分隔字串: "URL, Label, URL2, Label2, Note"
 * 3. 陣列: ["URL, Label", "URL2"]
 */
export function parseMapTargets(rawMapLink: string | ReadonlyArray<string> | undefined, fallbackPlaceName?: string): { mapTargets: MapTarget[], infoLinks: InfoLink[] } {
  if (!rawMapLink) {
    return {
      mapTargets: fallbackPlaceName ? [{ query: fallbackPlaceName, label: fallbackPlaceName }] : [],
      infoLinks: []
    };
  }

  const rawItems = Array.isArray(rawMapLink) ? rawMapLink : [rawMapLink];
  const targets: MapTarget[] = [];
  const infoLinks: InfoLink[] = [];

  // Terminal code mapping
  const TERMINAL_MAP: Record<string, string> = {
    'T1': '成田機場 第一航廈',
    'T2': '成田機場 第二航廈',
    'T3': '成田機場 第三航廈',
  };

  rawItems.forEach(item => {
    // 先用逗號切分，並過濾空字串
    const tokens = item.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      
      if (token.startsWith('http')) {
        // 是一個 URL
        const isMapUrl = token.includes('maps.app.goo.gl') || token.includes('google.com/maps');

        if (isMapUrl) {
          const target: MapTarget = { url: token };
          // 檢查下一個 token 是否為 Label (非 URL)
          if (i + 1 < tokens.length && !tokens[i + 1].startsWith('http')) {
            const rawLabel = tokens[i + 1];
            target.label = TERMINAL_MAP[rawLabel] || rawLabel;
            i++; // 跳過下一個 token
          } else {
            // 若沒有 label，嘗試使用 fallback
            target.label = fallbackPlaceName || '地圖';
          }
          targets.push(target);
        } else {
          // 非地圖 URL -> Info Link
          // 預設 label 為 "行程介紹" 或 "相關連結"，除非下一個 token 是 label
          infoLinks.push({ label: '行程介紹', url: token });
        }
      } else {
        // 獨立的非 URL token，視為地點查詢或備註
        // 這裡我們只將其視為 query target，若它看起來像地點
        // 簡單過濾掉一些明顯不是地點的雜訊 (如航班號)，但這很難完美，先全收
        const rawLabel = token;
        const label = TERMINAL_MAP[rawLabel] || rawLabel;
        targets.push({ query: token, label: label });
      }
    }
  });

  // 如果解析完沒有任何 URL target，但有 fallbackPlaceName，補一個 query
  if (targets.length === 0 && fallbackPlaceName) {
    targets.push({ query: fallbackPlaceName, label: fallbackPlaceName });
  }

  // Audit log (Dev only)
  if (process.env.NODE_ENV !== 'production') {
    targets.forEach(t => {
      if (t.label && ['T1', 'T2', 'T3'].includes(t.label)) {
        console.warn(`[Map Label] Unresolved terminal label: ${t.label}`);
      }
    });
  }

  return { mapTargets: targets, infoLinks };
}

/**
 * 建立 Google Maps 的開啟連結
 */
export function buildGoogleMapsUrl(target: MapTarget | string | { query: string; lat?: number; lng?: number; placeId?: string }): string {
  const baseUrl = "https://www.google.com/maps/search/?api=1";

  if (typeof target === 'string') {
     return `${baseUrl}&query=${encodeURIComponent(target)}`;
  }

  // Handle MapTarget interface
  if ('url' in target && target.url) return target.url;
  if ('query' in target && target.query) return `${baseUrl}&query=${encodeURIComponent(target.query)}`;
  
  // Handle legacy object structure if passed (though types suggest MapTarget is primary now)
  if ('placeId' in target && target.placeId) return `${baseUrl}&query=${encodeURIComponent(target.query)}&query_place_id=${target.placeId}`;
  if ('lat' in target && target.lat !== undefined && target.lng !== undefined) return `${baseUrl}&query=${target.lat},${target.lng}`;

  return "#";
}

/**
 * 解析 "LINK+驗證碼" 格式的文字
 */
export function parseLinkWithCode(text: string): { serviceName?: string; reservationId?: string; url?: string; code?: string; rawText: string } {
  const serviceNameMatch = text.match(/【(.*?)】/);
  const reservationIdMatch = text.match(/預約(\w+)/);
  const urlMatch = text.match(/(https?:\/\/\S+)/);
  const codeMatch = text.match(/驗證碼(\d{4,8})/);

  return {
    serviceName: serviceNameMatch ? serviceNameMatch[1].trim() : undefined,
    reservationId: reservationIdMatch ? reservationIdMatch[1] : undefined,
    url: urlMatch ? urlMatch[0].replace(/。$/, '') : undefined, // 移除結尾句號
    code: codeMatch ? codeMatch[1] : undefined,
    rawText: text,
  };
}

/**
 * 解析相關格式 (Ticket Info)
 */
export function parseTicketInfo(
  rawRelatedFormat: string | ReadonlyArray<string> | undefined, 
  activityId: string
): { ticketType: TicketType; ticketSlots: TicketSlot[] } {
  if (!rawRelatedFormat) {
    return { ticketType: TicketType.NONE, ticketSlots: [] };
  }

  const rawItems = Array.isArray(rawRelatedFormat) ? rawRelatedFormat : [rawRelatedFormat];
  let mainType = TicketType.NONE;
  const slots: TicketSlot[] = [];

  rawItems.forEach((item, index) => {
    const lowerItem = item.toLowerCase();
    let count = 1;
    
    // 解析數量 "* N"
    const countMatch = item.match(/\*\s*(\d+)/);
    if (countMatch) {
      count = parseInt(countMatch[1], 10);
    }

    // 移除數量標記後的純文字，用於 Label
    const cleanLabel = item.replace(/\*\s*\d+/, '').trim();

    // 解析括號中的 meta data
    const metaMatch = cleanLabel.match(/\((.*)\)/);
    const meta = metaMatch ? metaMatch[1] : null;
    const baseLabel = meta ? cleanLabel.replace(metaMatch[0], '').trim() : cleanLabel;
    const metaLabels = meta ? meta.split('+') : [];


    if (lowerItem.includes('qr code') || lowerItem.includes('qr_code')) {
      mainType = TicketType.QR_IMAGE;
      for (let i = 0; i < count; i++) {
        slots.push({
          id: `${activityId}:qr:${index}:${i}`,
          type: 'qr_image',
          label: count > 1 ? `${cleanLabel} ${i + 1}` : cleanLabel,
        });
      }
    } else if (lowerItem.includes('pdf')) {
      mainType = TicketType.PDF_FILE;
      for (let i = 0; i < count; i++) {
        slots.push({
          id: `${activityId}:pdf:${index}:${i}`,
          type: 'pdf',
          label: metaLabels[i] || (count > 1 ? `${baseLabel} ${i + 1}` : baseLabel),
        });
      }
    } else if (lowerItem.includes('link') && lowerItem.includes('驗證碼')) {
      mainType = TicketType.LINK_WITH_CODE;
      slots.push({
        id: `${activityId}:link_code:${index}`,
        type: 'link_with_code',
        label: cleanLabel,
        // 根據您的 JSON，"相關格式" 欄位本身只是標記，沒有詳細內容
        // 因此 value 預設為 undefined，UI 會顯示輸入框。
        // 若未來 JSON 的 `相關格式` 欄位包含詳細字串，此處的 parseLinkWithCode 才會生效。
        value: undefined,
      });
    } else if (lowerItem.includes('link')) {
      mainType = TicketType.LINK;
      for (let i = 0; i < count; i++) {
        slots.push({
          id: `${activityId}:link:${index}:${i}`,
          type: 'link',
          label: count > 1 ? `${cleanLabel} ${i + 1}` : cleanLabel,
        });
      }
    } else if (lowerItem.includes('跳轉') && lowerItem.includes('app')) {
      mainType = TicketType.APP_JUMP;
      // 特定 App 邏輯：日產租車
      if (item.includes('日産レンタカーアプリ')) {
        slots.push({
          id: `${activityId}:app:${index}`,
          type: 'app',
          label: '日産レンタカーアプリ',
          value: {
            appName: "日産レンタカーアプリ",
            packageName: "com.nissan.rentacar.aprs",
            playStoreUrl: "https://play.google.com/store/apps/details?id=com.nissan.rentacar.aprs&hl=zh_TW",
            intentUrl: "intent://#Intent;package=com.nissan.rentacar.aprs;end"
          }
        });
      } else {
        // Generic App placeholder
        slots.push({
          id: `${activityId}:app:${index}`,
          type: 'app',
          label: cleanLabel,
        });
      }
    } else if (lowerItem.includes('gmail')) {
      // This is a special case from the override list. The format is the subject.
      mainType = TicketType.GMAIL_JUMP;
      slots.push({
        id: `${activityId}:gmail:${index}`,
        type: 'gmail',
        label: 'Gmail 搜尋',
        value: { subject: item.replace(/subject:/g, '').replace(/"/g, '') }
      });
    }
  });

  return { ticketType: mainType, ticketSlots: slots };
}

/**
 * 建立 Gmail 搜尋 URL
 * query 固定使用：subject:"<主旨>"
 */
export function buildGmailSearchUrl(subject: string, userIndex = 0): string {
  const query = `subject:"${subject}"`;
  return `https://mail.google.com/mail/u/${userIndex}/#search/${encodeURIComponent(query)}`;
}

/**
 * 開啟 Gmail 並搜尋特定主旨
 */
export function openGmailBySubject(subject: string, userIndex = 0): void {
  if (typeof window !== 'undefined') {
    window.open(buildGmailSearchUrl(subject, userIndex), '_blank', 'noopener,noreferrer');
  }
}

/**
 * 建立 Trip.com 航班追蹤網址
 * 規則：https://tw.trip.com/flights/status-{flightNo}/
 * flightNo 需轉小寫
 */
export function buildTripComFlightStatusUrl(flightNo: string): string | null {
  if (!flightNo) return null;

  const cleanFlightNo = flightNo.trim().replace(/\s+/g, '').toLowerCase();
  
  // 驗證格式：兩碼英文字母 + 數字 (e.g. ci126, ua837)
  const isValid = /^[a-z]{2}\d+$/i.test(cleanFlightNo);

  if (!isValid) {
    console.warn(`[Flight Tracker] Invalid flight number format: ${flightNo}`);
    return null;
  }

  return `https://tw.trip.com/flights/status-${cleanFlightNo}/`;
}

/**
 * Extracts flight information from map link strings and notes,
 * returning the flight data and a cleaned map link string.
 */
export function extractFlightInfo(mapLink: string | ReadonlyArray<string> | undefined, note: string | undefined): {
  flightInfo?: { airlineCode: string; flightNumber: string; };
  cleanedMapLink: string | undefined;
  cleanedNote: string | undefined;
} {
  let cleanedNote = note;
  if (!mapLink) {
    return { cleanedMapLink: mapLink, cleanedNote };
  }

  const linkString = typeof mapLink === 'string' ? mapLink : mapLink.join(',');
  const parts = linkString.split(',');
  const flightCodeRegex = /^([A-Z]{2})(\d{2,4})$/; // e.g., CI126
  const airlineCodeOnlyRegex = /^[A-Z]{2}$/; // e.g., UA
  const flightNumberRegex = /^\d{2,4}$/; // e.g., 837

  let flightInfo: { airlineCode: string; flightNumber: string; } | undefined;
  const cleanedParts: string[] = [];
  let airlineCodePart: string | null = null;

  for (const part of parts) {
    const trimmedPart = part.trim();
    const flightMatch = trimmedPart.match(flightCodeRegex);

    if (flightMatch) {
      flightInfo = { airlineCode: flightMatch[1], flightNumber: flightMatch[2] };
    } else if (airlineCodeOnlyRegex.test(trimmedPart) && AIRLINE_CODES[trimmedPart]) {
      airlineCodePart = trimmedPart;
    } else {
      cleanedParts.push(trimmedPart);
    }
  }

  if (airlineCodePart) {
      if (note && flightNumberRegex.test(note.trim())) {
          flightInfo = { airlineCode: airlineCodePart, flightNumber: note.trim() };
          cleanedNote = undefined; // Consumed note
      } else {
          cleanedParts.push(airlineCodePart);
      }
  }

  return { flightInfo, cleanedMapLink: cleanedParts.join(','), cleanedNote };
}

/**
 * 開啟日產租車 App (Android Intent) 或 Fallback
 */
export function openNissanRentacarApp(): void {
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);

  const intentUrl = "intent://#Intent;package=com.nissan.rentacar.aprs;end";
  const playStoreUrl = "https://play.google.com/store/apps/details?id=com.nissan.rentacar.aprs&hl=zh_TW";
  const webUrl = "https://www.nissan-rentacar.com/";

  if (isAndroid) {
    window.location.href = intentUrl;
    const start = Date.now();
    setTimeout(() => {
      // 如果 1.5 秒後頁面仍然可見，代表 App 未成功開啟
      if (document.visibilityState === 'visible' && Date.now() - start < 1500) {
        window.location.href = playStoreUrl;
      }
    }, 1000);
  } else {
    window.open(isIOS ? webUrl : playStoreUrl, '_blank', 'noopener,noreferrer');
  }
}

/**
 * 同步附件檔案與票券插槽
 * 如果實際檔案 (fileData) 比預定義的插槽多，會自動補上插槽。
 * 並將檔案的 URL 與 Label 填入插槽中。
 */
export function syncSlotsWithFiles(
  activityId: string,
  currentSlots: TicketSlot[],
  fileData: { pdf?: { label: string; url: string }[]; qr?: { label: string; url: string }[] } | undefined
): TicketSlot[] {
  if (!fileData) return currentSlots;

  const out = [...currentSlots];

  // 1. Sync PDF
  if (fileData.pdf) {
    const currentPdfSlots = out.filter(s => s.type === 'pdf');
    const needed = fileData.pdf.length - currentPdfSlots.length;

    if (needed > 0) {
      for (let i = 0; i < needed; i++) {
        out.push({
          id: `${activityId}:pdf:extra:${i}`,
          type: 'pdf',
          label: `PDF ${currentPdfSlots.length + i + 1}`,
        });
      }
    }

    // 重新 filter 一次以確保順序正確，並填入資料
    let pdfIndex = 0;
    out.forEach(slot => {
      if (slot.type === 'pdf' && fileData.pdf && pdfIndex < fileData.pdf.length) {
        slot.label = fileData.pdf[pdfIndex].label;
        slot.value = fileData.pdf[pdfIndex].url;
        pdfIndex++;
      }
    });
  }

  // 2. Sync QR
  if (fileData.qr) {
    const currentQrSlots = out.filter(s => s.type === 'qr_image');
    const needed = fileData.qr.length - currentQrSlots.length;

    if (needed > 0) {
      for (let i = 0; i < needed; i++) {
        out.push({
          id: `${activityId}:qr:extra:${i}`,
          type: 'qr_image',
          label: `QR ${currentQrSlots.length + i + 1}`,
        });
      }
    }

    let qrIndex = 0;
    out.forEach(slot => {
      if (slot.type === 'qr_image' && fileData.qr && qrIndex < fileData.qr.length) {
        slot.label = fileData.qr[qrIndex].label;
        slot.value = fileData.qr[qrIndex].url;
        qrIndex++;
      }
    });
  }

  return out;
}