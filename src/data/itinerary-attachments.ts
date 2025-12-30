// src/data/itinerary-attachments.ts

// =============================================================================
// 1. Helper Functions (URL Construction)
// =============================================================================

/**
 * 取得 Public Base Path
 * 在 Next.js 中，若未使用 basePath，直接使用 "/" 即可，Next.js 會自動處理。
 * 若有設定 basePath，也應使用相對根路徑，Next.js 會處理。
 * 此函式確保在不同框架下都有基本支援。
 */
export const getPublicBase = (): string => {
  let base = '/';

  // Vite
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) {
    // @ts-ignore
    base = import.meta.env.BASE_URL;
  }
  // CRA or Next.js with custom PUBLIC_URL
  else if (typeof process !== 'undefined' && process.env && process.env.PUBLIC_URL) {
    base = process.env.PUBLIC_URL as string;
  }

  // 確保結尾 /
  return base.endsWith('/') ? base : `${base}/`;
};

/**
 * 建立正確的 Public Asset URL
 * @param folder 資料夾名稱 (e.g. "2026-01-01__東京灣遊船午餐")
 * @param file 完整檔名 (e.g. "1P.pdf")
 */
export const buildPublicAssetUrl = (folder: string, file: string): string => {
  const base = getPublicBase();

  // Use encodeURIComponent for each segment to correctly handle spaces, parentheses, etc.
  const encodedFolder = encodeURIComponent(folder);
  const encodedFile = encodeURIComponent(file);

  const path = `itinerary-assets/${encodedFolder}/${encodedFile}`;
  
  // getPublicBase() 已確保 base 以 "/" 結尾，所以直接串接
  return `${base}${path}`;
};

// =============================================================================
// 2. Raw Data Source (The Truth)
// 嚴格對應 public/itinerary-assets 的實際檔案結構
// =============================================================================

type RawAttachmentData = Record<
  string,
  {
    pdf?: string[];
    qr?: string[];
  }
>;

export const rawAttachments: RawAttachmentData = {
  "2025-12-31__入住-東京東日本橋凱富飯店": {
    pdf: ["0101 - 0102 3 Rooms.pdf", "1231 - 0101 3 Rooms.pdf"],
  },
  "2025-12-31__飛往東京成田機場": {
    pdf: [
      "CHAO HSIANG LING.pdf",
      "HSU HSIU CHUN.pdf",
      "WANG HSIN HSIUNG.pdf",
      "WANG SHENG CHIEH.pdf",
      "WANG SHENG CHIH.pdf",
    ],
  },
  "2026-01-01__元旦日出特別營業-晴空塔": {
    pdf: ["东京晴空塔 元旦(11)特別営業展望台入場券.pdf"],
  },
  "2026-01-01__東京灣遊船午餐": {
    pdf: ["1P.pdf", "2P_1.pdf", "2P_2.pdf"],
  },
  "2026-01-02__入住富士山ヴィラス和楽": {
    pdf: ["0102 - 0103.pdf"],
  },
  "2026-01-02__河口湖纜車、遊覽船": {
    qr: [
      "CHAO HSIANG LING.jpg",
      "HSU HSIU CHUN.jpg",
      "WANG HSIN HSIUNG.jpg",
      "WANG SHENG CHIEH.jpg",
      "WANG SHENG CHIH.jpg",
    ],
  },
  "2026-01-03__伊勢丹-新宿店": {
    qr: [
      "CHAO HSIANG LING.png",
      "HSU HSIU CHUN.png",
      "WANG HSIN HSIUNG.png",
      "WANG SHENG CHIEH.png",
      "WANG SHENG CHIH.png",
    ],
  },
  "2026-01-03__入住-東京六本木凱富飯店": {
    pdf: [
      "0103 - 0104 1 Room.pdf",
      "0103 - 0104 2 Rooms.pdf",
      "0104 - 0105 1 Rooms - 1.pdf",
      "0104 - 0105 1 Rooms - 2.pdf",
      "0104 - 0105 1 Rooms - 3.pdf",
    ],
  },
  "2026-01-05__skyliner-京成上野": {
    qr: ["Skyliner Discount Ticket.png"],
  },
  "2026-01-05__成田機場取行李": {
    pdf: ["Japan Meeting Point.pdf"],
  },
  "2026-01-05__行李寄送服務": {
    pdf: ["Hotel to Airport.pdf", "Things To Note.pdf"],
  },
  "2026-01-05__貴賓室體驗-希和--noa-": {
    qr: [
      "CHAO HSIANG LING.png",
      "HSU HSIU CHUN.png",
      "WANG HSIN HSIUNG.png",
      "WANG SHENG CHIEH.png",
      "WANG SHENG CHIH.png",
    ],
  },
  "2026-01-05__飛往高雄小港機場": {
    pdf: [
      "CHAO HSIANG LING.pdf",
      "HSU HSIU CHUN.pdf",
      "WANG HSIN HSIUNG.pdf",
      "WANG SHENG CHIEH.pdf",
      "WANG SHENG CHIH.pdf",
    ],
  },
};

// =============================================================================
// 3. Types & UI Consumable Output
// =============================================================================

export type Attachment = {
  label: string;
  url: string;
  file: string;
};

export type FileAttachmentMap = Record<
  string,
  {
    pdf?: Attachment[];
    qr?: Attachment[];
  }
>;

// =============================================================================
// 4. Label Generator (Friendly Names)
// =============================================================================

const stripExt = (filename: string) => filename.replace(/\.[^/.]+$/, '');

const prettify = (name: string) => name
  .replace(/_/g, '-')
  .replace(/\s*-\s*/g, '-')
  .replace(/\s+/g, ' ')
  .trim();

const nameMap: Record<string, string> = {
  "CHAO HSIANG LING": "趙湘鈴",
  "WANG SHENG CHIEH": "王聖傑",
  "WANG SHENG CHIH": "王聖智",
  "WANG HSIN HSIUNG": "王信雄",
  "HSU HSIU CHUN": "徐秀春",
};

export const generateLabel = (filename: string): string => {
  const base = stripExt(filename).trim();
  if (nameMap[base]) {
    return nameMap[base];
  }
  if (/^1p$/i.test(base)) return '1P';
  if (/^2p_?1$/i.test(base)) return '2P-1';
  if (/^2p_?2$/i.test(base)) return '2P-2';
  if (/^2p$/i.test(base)) return '2P';
  if (/^3p$/i.test(base)) return '3P';
  const rangeMatch = base.match(/(\d{4})\s*-\s*(\d{4})/);
  if (rangeMatch) return `${rangeMatch[1]}-${rangeMatch[2]}`;
  return prettify(base);
};

// =============================================================================
// 5. Generate Exported Attachment Mapping
// =============================================================================

export const attachmentsByFolder: FileAttachmentMap = {};

Object.entries(rawAttachments).forEach(([folder, files]) => {
  const entry: { pdf?: Attachment[]; qr?: Attachment[] } = {};

  if (files.pdf?.length) {
    entry.pdf = files.pdf.map((file) => ({
      file,
      label: generateLabel(file),
      url: buildPublicAssetUrl(folder, file),
    }));
  }

  if (files.qr?.length) {
    entry.qr = files.qr.map((file) => ({
      file,
      label: generateLabel(file),
      url: buildPublicAssetUrl(folder, file),
    }));
  }

  attachmentsByFolder[folder] = entry;
});

// =============================================================================
// 6. Activity Key Mapping (Bridge between Itinerary and Folders)
// =============================================================================

const normalizeDate = (dateStr: string) => {
  const match = dateStr.match(/(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  if (match) {
    const [_, y, m, d] = match;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return dateStr;
};

export const buildActivityKey = (date: string, title: string) => {
  return `${normalizeDate(date)}__${title}`;
};

export const activityKeyToFolderMap: Record<string, string> = {};

// 1. Auto-populate for exact matches
Object.keys(rawAttachments).forEach(folder => {
  activityKeyToFolderMap[folder] = folder;
});

// 2. Manual overrides for mismatches (Date__Title -> Folder)
const manualMappings: Record<string, string> = {
  "2026-01-05__貴賓室體驗 (希和 -NOA-)": "2026-01-05__貴賓室體驗-希和--noa-",
  "2026-01-05__Skyliner (京成上野)": "2026-01-05__skyliner-京成上野",
  "2026-01-03__伊勢丹 新宿店": "2026-01-03__伊勢丹-新宿店",
  "2025-12-31__入住 東京東日本橋凱富飯店": "2025-12-31__入住-東京東日本橋凱富飯店",
  "2026-01-03__入住 東京六本木凱富飯店": "2026-01-03__入住-東京六本木凱富飯店",
  "2026-01-01__元旦日出特別營業 (晴空塔)": "2026-01-01__元旦日出特別營業-晴空塔",
};
Object.assign(activityKeyToFolderMap, manualMappings);

// =============================================================================
// 7. Audit Tool (Dev Only)
// 在 Console 執行 window.auditItineraryAttachments()
// =============================================================================

const headOrGet = async (url: string): Promise<Response> => {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (res.status !== 405) return res;
  } catch {
    // fallback to GET
  }
  return fetch(url, { method: 'GET' });
};

export const auditItineraryAttachments = async () => {
  // @ts-ignore
  const isProd = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';
  if (isProd) return;

  console.group("🔍 Audit Itinerary Attachments");
  const base = getPublicBase();
  console.log(`Base URL: "${base}"`);

  for (const [folder, data] of Object.entries(attachmentsByFolder)) {
    console.groupCollapsed(`📂 Folder: ${folder}`);

    if (data.pdf?.length) {
      console.log(`📄 PDFs (${data.pdf.length}):`);
      for (const item of data.pdf) {
        const res = await headOrGet(item.url);
        const ct = res.headers.get('content-type') || '';
        const ok = res.ok && !ct.includes('text/html');
        const style = ok ? 'color: green' : 'color: red; font-weight: bold';
        console.log(`  %c[${res.status}] ${item.label} -> ${item.file} | ${ct}`, style);
        if (ct.includes('text/html')) {
          console.warn(`  ⚠️ HTML returned for PDF URL (basePath/rewrite issue): ${item.url}`);
        }
      }
    }

    if (data.qr?.length) {
      console.log(`📱 QRs (${data.qr.length}):`);
      for (const item of data.qr) {
        const res = await headOrGet(item.url);
        const ct = res.headers.get('content-type') || '';
        const ok = res.ok && ct.startsWith('image/');
        const style = ok ? 'color: green' : 'color: red; font-weight: bold';
        console.log(`  %c[${res.status}] ${item.label} -> ${item.file} | ${ct}`, style);
        if (ct.includes('text/html')) {
          console.warn(`  ⚠️ HTML returned for image URL (basePath/rewrite issue): ${item.url}`);
        }
      }
    }

    console.groupEnd();
  }

  console.groupEnd();
};

if (typeof window !== 'undefined') {
  // @ts-ignore
  window.auditItineraryAttachments = auditItineraryAttachments;
}

// =============================================================================
// 8. Attachment Overrides (Single Source of Truth for Attachment Definitions)
// =============================================================================
export const attachmentsOverride = {
  "附件下載清單": [
    { "日期": "2025/12/31 (三)", "行程": "自宅出發", "附件類型": "肯驛機場接駁", "檔案格式與數量": "LINK + 驗證碼" },
    { "日期": "2025/12/31 (三)", "行程": "飛往東京成田機場", "附件類型": "五人機票", "檔案格式與數量": "PDF * 4" },
    { "日期": "2025/12/31 (三)", "行程": "入住 東京東日本橋凱富飯店", "附件類型": "入住憑證", "檔案格式與數量": "PDF * 1" },
    { "日期": "2026/01/01 (四)", "行程": "元旦日出特別營業 (晴空塔)", "附件類型": "晴空塔入場票", "檔案格式與數量": "PDF * 1" },
    { "日期": "2026/01/01 (四)", "行程": "東京灣遊船午餐", "附件類型": "預約單", "檔案格式與數量": "PDF * 3" },
    { "日期": "2026/01/01 (四)", "行程": "東京忍者＆歌舞伎表演", "附件類型": "入場憑證", "檔案格式與數量": "LINK * 2" },
    { "日期": "2026/01/02 (五)", "行程": "租車 (日産レンタカー)", "附件類型": "NISSAN Rent a Car APP", "檔案格式與數量": "跳轉 APP (日産レンタカーアプリ)" },
    { "日期": "2026/01/02 (五)", "行程": "河口湖纜車、遊覽船", "附件類型": "富士山パノラマロープウェイ往復乗車券", "檔案格式與數量": "QR code * 5" },
    { "日期": "2026/01/02 (五)", "行程": "入住富士山ヴィラス和楽", "附件類型": "入住憑證", "檔案格式與數量": "PDF * 1" },
    { "日期": "2026/01/03 (六)", "行程": "大衆鰻 うな富士", "附件類型": "跳轉 Gmail", "檔案格式與數量": "subject:\"[大衆鰻 うな富士] 1月3日ご来店 crane予約サービス\"" },
    { "日期": "2026/01/03 (六)", "行程": "伊勢丹 新宿店", "附件類型": "龍騰卡", "檔案格式與數量": "QR code * 5" },
    { "日期": "2026/01/03 (六)", "行程": "入住 東京六本木凱富飯店", "附件類型": "入住憑證", "檔案格式與數量": "PDF * 5" },
    { "日期": "2026/01/04 (日)", "行程": "中山競馬場入場券", "附件類型": "跳轉 Gmail", "檔案格式與數量": "subject:\"【JRA指定席・入場券ネット予約】入場券購入完了のお知らせ\"" },
    { "日期": "2026/01/04 (日)", "行程": "還車 (日産レンタカー)", "附件類型": "NISSAN Rent a Car APP", "檔案格式與數量": "跳轉 APP (日産レンタカーアプリ)" },
    { "日期": "2026/01/04 (日)", "行程": "ふたご 六本木店", "附件類型": "跳轉 Gmail", "檔案格式與數量": "subject:\"大阪焼肉・ホルモン ふたご 六本木店 Reservation System\"" },
    { "日期": "2026/01/05 (一)", "行程": "行李寄送服務", "附件類型": "預約須知", "檔案格式與數量": "PDF * 2 (說明文件+注意事項)" },
    { "日期": "2026/01/05 (一)", "行程": "Skyliner (京成上野)", "附件類型": "兌換憑證", "檔案格式與數量": "QR CODE * 1" },
    { "日期": "2026/01/05 (一)", "行程": "成田機場取行李", "附件類型": "預約須知", "檔案格式與數量": "PDF * 1 (會面點指引)" },
    { "日期": "2026/01/05 (一)", "行程": "貴賓室體驗 (希和 -NOA-)", "附件類型": "入場券", "檔案格式與數量": "QR CODE * 5" },
    { "日期": "2026/01/05 (一)", "行程": "飛往高雄小港機場", "附件類型": "機票預約單", "檔案格式與數量": "PDF * 2" },
    { "日期": "2026/01/05 (一)", "行程": "小港機場返家", "附件類型": "肯驛機場接駁", "檔案格式與數量": "LINK + 驗證碼" }
  ]
};
