import { Trip, Activity, TicketSlot, TicketType } from './types';
import { buildActivityId, parseMapTargets, parseTicketInfo, normalizeActivityKey, normalizePlaceLabel, normalizeForDescriptionMatch, buildGmailSearchUrl } from './utils';
import { attachmentsOverride } from './attachments';
import { attachmentsByFolder, activityKeyToFolderMap, buildActivityKey } from '../data/itinerary-attachments';
import { descriptionMap, rawDescriptionList, descriptionOverrideById } from '@/data/itinerary-descriptions';
import { gmailReservations } from '@/data/gmail-reservations';

// 新增：航空公司代碼對照表
export const AIRLINE_CODES: { [key: string]: string } = {
  UA: '美國聯合航空',
  CI: '中華航空',
  BR: '長榮航空',
  JX: '星宇航空',
  NH: '全日空',
  JL: '日本航空',
  // ...可以繼續擴充
};


// 原始 JSON 資料
const rawData = {
  "行程名稱": "1231-0105 東京",
  "行程詳情": [
    {
      "日期": "2025/12/31 (三)",
      "活動": [
        {
          "時間": "9：00",
          "行程": "自宅出發",
          "是否預約": "肯驛機場接駁",
          "相關格式": "LINK+驗證碼",
          "地點": "我家",
          "地圖連結": "https://maps.app.goo.gl/Me2MywFsgvmSmQkb9"
        },
        {
          "時間": "10：00",
          "行程": "抵達高雄小港國際機場",
          "地點": "高雄國際機場",
          "地圖連結": "https://maps.app.goo.gl/fhQbHGAhxDZtCfhW8"
        },
        {
          "時間": "10：30 - 12：30",
          "行程": "貴賓室",
          "地點": "中華航空貴賓室",
          "地圖連結": "https://maps.app.goo.gl/ik6WWcdREEiTVF8r6"
        },
        {
          "時間": "13：05 - 17：25",
          "行程": "飛往東京成田機場",
          "是否預約": "五人機票",
          "相關格式": "PDF * 4",
          "地點": "高雄國際機場",
          "地圖連結": "https://maps.app.goo.gl/fhQbHGAhxDZtCfhW8,成田國際機場第二航廈,https://maps.app.goo.gl/esR3RStasZ12h8xQ8,CI126"
        },
        {
          "時間": "19：00 - 20：30",
          "行程": "東京機場接駁",
          "地點": "成田國際機場",
          "地圖連結": "https://maps.app.goo.gl/LvuMe7TGWTU6EuFu9,東京東日本橋凱富飯店,https://maps.app.goo.gl/YF4Hr2MNA34DqaeV6,在成田機場第二航廈降落"
        },
        {
          "時間": "20：30",
          "行程": "入住 東京東日本橋凱富飯店",
          "是否預約": "入住憑證",
          "相關格式": "PDF * 2",
          "地點": "東京東日本橋凱富飯店",
          "地圖連結": "https://maps.app.goo.gl/YF4Hr2MNA34DqaeV6"
        },
        {
          "時間": "23：00 - 01：00",
          "行程": "新年敲鐘",
          "地點": "增上寺",
          "地圖連結": "https://maps.app.goo.gl/bK6hZhcKAeZRWGDK6"
        }
      ]
    },
    {
      "日期": "2026/1/1 (四)",
      "活動": [
        {
          "時間": "5：30 - 7：30",
          "行程": "晴空塔元旦日出體驗",
          "是否預約": "晴空塔入場票",
          "相關格式": "QR code * 1",
          "預約時間": "5：30",
          "地點": "東京晴空塔",
          "地圖連結": "https://maps.app.goo.gl/DpextMTXz7eGUEr8A"
        },
        {
          "時間": "8：00 - 10：30",
          "行程": "回飯店吃早餐/休息",
          "地點": "東京東日本橋凱富飯店",
          "地圖連結": "https://maps.app.goo.gl/hd9bC7LE19frTgHe6"
        },
        {
          "時間": "11：20 - 14：00",
          "行程": "午餐：東京灣遊船自助餐",
          "是否預約": "預約單",
          "相關格式": "PDF * 3",
          "預約時間": "11：20",
          "地點": "Symphony Tokyo Bay",
          "地圖連結": "https://maps.app.goo.gl/6UEEmzcUHq73aKGF9,https://mimigo.tw/tokyo-symphony/"
        },
        {
          "時間": "15：00 - 17：00",
          "行程": "新年參拜",
          "地點": "明治神宮",
          "地圖連結": "https://maps.app.goo.gl/fAkb9MnzcRWEPAEG7"
        },
        {
          "時間": "17：30 - 20：00",
          "行程": "東京忍者＆歌舞伎表演",
          "是否預約": "入場憑證",
          "相關格式": "LINK * 2",
          "預約時間": "17：30",
          "地點": "東京新宿劇場",
          "地圖連結": "https://maps.app.goo.gl/tLWLu4hFXqzssmkGA"
        },
        {
          "時間": "21：00",
          "行程": "回飯店休息",
          "地點": "東京東日本橋凱富飯店",
          "地圖連結": "https://maps.app.goo.gl/hd9bC7LE19frTgHe6"
        }
      ]
    },
    {
      "日期": "2026/1/2 (五)",
      "活動": [
        {
          "時間": "09：00",
          "行程": "租車",
          "是否預約": "Nisson APP",
          "相關格式": "跳轉APP：日産レンタカーアプリ",
          "預約時間": "09：00",
          "地點": "日産レンタカー浅草橋駅西口店",
          "地圖連結": "https://maps.app.goo.gl/9V6PM9ruPj81oxMm7"
        },
        {
          "時間": "12：00",
          "行程": "午餐：牛かつ専門店 甲州家(炸牛排)",
          "地點": "牛かつ専門店 甲州家",
          "地圖連結": "https://maps.app.goo.gl/PPiwsBB4FqzDnQbU8"
        },
        {
          "時間": "13：00 - 16：00",
          "行程": "河口湖纜車、河口湖遊覽船",
          "是否預約": "纜車票",
          "相關格式": "QR code",
          "地點": "河口湖 富士山纜車",
          "地圖連結": [
            "https://maps.app.goo.gl/4MSgMLMHUPSZ1zh58,河口湖遊覽船",
            "https://maps.app.goo.gl/H8AET1xjT6FHLpTJ6"
          ],
          "備註": "天晴"
        },
        {
          "時間": "16：30 - 19：30",
          "行程": "Outlet 逛街",
          "地點": "御殿場 PREMIUM OUTLETS",
          "地圖連結": "https://maps.app.goo.gl/wComrqTkE6avqXj1A"
        },
        {
          "時間": "20：00",
          "行程": "入住富士山ヴィラス和楽",
          "是否預約": "入住憑證",
          "相關格式": "PDF * 1",
          "地點": "ヴィラス和楽",
          "地圖連結": "https://maps.app.goo.gl/g4qZaZ7K13wfsyzU9"
        }
      ]
    },
    {
      "日期": "2026/1/3 (六)",
      "活動": [
        {
          "時間": "9：30 - 12：00",
          "行程": "忍野八海參觀"
        },
        {
          "時間": "12：30 - 14：00",
          "行程": "午餐：大衆鰻 うな富士",
          "是否預約": "Gmail",
          "相關格式": "PDF",
          "預約時間": "12：30",
          "地點": "大衆鰻 うな富士",
          "地圖連結": "https://maps.app.goo.gl/7Wt6Rtnupw7rLMLw8"
        },
        {
          "時間": "14：00 - 16：00",
          "行程": "開車回東京"
        },
        {
          "時間": "16：00 - 19：00",
          "行程": "伊勢丹 新宿店",
          "是否預約": "龍騰卡",
          "相關格式": "QR code",
          "地點": "伊勢丹 新宿店",
          "地圖連結": "https://maps.app.goo.gl/fNhF5G1QRfkuBzBMA"
        },
        {
          "時間": "21：00",
          "行程": "飯店 check in",
          "地點": "コンフォートイン東京六本木",
          "地圖連結": "https://maps.app.goo.gl/BTH3nRpcSGxD1Yzy9"
        }
      ]
    },
    {
      "日期": "2026/1/4 (日)",
      "活動": [
        {
          "時間": "9：00 - 10：00",
          "行程": "開車到賽馬場"
        },
        {
          "時間": "10：30 - 14：00",
          "行程": "賽馬體驗",
          "是否預約": "Gmail",
          "相關格式": "LINK",
          "預約時間": "9：10後",
          "地點": "中山競馬場",
          "地圖連結": "https://maps.app.goo.gl/W3f8RhKyhCzWEuNe9"
        },
        {
          "時間": "14：30 - 17：00",
          "行程": "逛街",
          "地點": "三井アウトレットパーク 幕張",
          "地圖連結": "https://maps.app.goo.gl/muT12xaFLVovRCYX8"
        },
        {
          "時間": "18：30",
          "行程": "還車",
          "是否預約": "Nisson APP",
          "相關格式": "跳轉APP：日産レンタカーアプリ",
          "預約時間": "19：00 前",
          "地點": "日産レンタカー浅草橋駅西口店",
          "地圖連結": "https://maps.app.goo.gl/9V6PM9ruPj81oxMm7"
        },
        {
          "時間": "20：00",
          "行程": "晚餐：大阪烤肉 / 荷爾蒙 二子 六本木",
          "是否預約": "Gmail",
          "相關格式": "PDF",
          "預約時間": "20：00",
          "地點": "大阪焼肉・ホルモン ふたご 六本木店",
          "地圖連結": "https://maps.app.goo.gl/PXm4nJeuPKjSPaik9"
        },
        {
          "時間": "22：00",
          "行程": "回飯店休息",
          "地點": "コンフォートイン東京六本木",
          "地圖連結": "https://maps.app.goo.gl/5iZfTawcvtik6EVGA"
        }
      ]
    },
    {
      "日期": "2026/1/5 (一)",
      "活動": [
        {
          "時間": "9：00",
          "行程": "退房、行李寄送服務",
          "是否預約": "預約須知",
          "相關格式": [
            "1. 行李運送服務 說明文件(PDF)*1",
            "2. 重要注意事項(PDF)*1"
          ],
          "預約時間": "9：00",
          "地點": "コンフォートイン東京六本木",
          "地圖連結": "https://maps.app.goo.gl/BTH3nRpcSGxD1Yzy9"
        },
        {
          "時間": "10：00 - 13：30",
          "行程": "淺草",
          "地點": "淺草寺",
          "地圖連結": "https://maps.app.goo.gl/RKRjgUGSiTrHrtb88"
        },
        {
          "時間": "14：20 - 15：03",
          "行程": "機場快線：Skyliner",
          "是否預約": "兌換憑證",
          "相關格式": "QR CODE*1",
          "預約時間": "14：20",
          "地點": "京成上野",
          "地圖連結": "https://maps.app.goo.gl/6ukJkF6SWdxXD2LZ7,成田機場第一航廈,https://maps.app.goo.gl/29dWe1hxNag8BUYZ8"
        },
        {
          "時間": "15：00 - 15：30",
          "行程": "取行李：成田機場第一航廈汽車下客區",
          "是否預約": "預約須知",
          "相關格式": "1. 東京雞場會面點(PDF)*1",
          "預約時間": "15：00 - 15：30",
          "地點": "成田機場第一航廈",
          "地圖連結": "https://maps.app.goo.gl/29dWe1hxNag8BUYZ8,T1",
          "備註": "出發層的汽車下客區"
        },
        {
          "時間": "16：00 - 17：20",
          "行程": "貴賓室體驗",
          "是否預約": "入場券",
          "相關格式": "QR CODE*5",
          "地點": "I.A.S.S SUPERIOR LOUNGE 希和 -NOA-",
          "地圖連結": "https://maps.app.goo.gl/fTNCqqLkASvmxhiz6"
        },
        {
          "時間": "17：50 - 21：20",
          "行程": "飛往高雄小港機場",
          "是否預約": "機票預約單",
          "相關格式": "PDF*2",
          "地點": "成田機場第一航廈",
          "地圖連結": "https://maps.app.goo.gl/29dWe1hxNag8BUYZ8,高雄國際機場,https://maps.app.goo.gl/fhQbHGAhxDZtCfhW8,UA",
          "備註": "837"
        },
        {
          "時間": "22：00",
          "行程": "小港機場 出發",
          "是否預約": "肯驛機場接駁",
          "相關格式": "LINK+驗證碼",
          "預約時間": "21：20",
          "地點": "高雄國際機場",
          "地圖連結": "https://maps.app.goo.gl/FhDWu4Thw1tYcaSD6,家"
        },
        {
          "時間": "23：00",
          "行程": "到家",
          "地點": "我家",
          "地圖連結": "https://maps.app.goo.gl/Me2MywFsgvmSmQkb9"
        }
      ]
    }
  ]
};

// Title alias map for matching override list with main data
const titleAliasMap: Record<string, string> = {
  // New -> Old
  "晴空塔元旦日出體驗": "元旦日出特別營業 (晴空塔)",
  "午餐：東京灣遊船自助餐": "東京灣遊船午餐",
  "午餐：牛かつ専門店 甲州家(炸牛排)": "炸牛排：牛かつ専門店 甲州家",
  "午餐：大衆鰻 うな富士": "大衆鰻 うな富士",
  "晚餐：大阪烤肉 / 荷爾蒙 二子 六本木": "ふたご 六本木店",
  "機場快線：Skyliner": "Skyliner (京成上野)",
  "取行李：成田機場第一航廈汽車下客區": "成田機場取行李",
  // Existing Aliases
  "租車": "租車 (日産レンタカー)",
  "河口湖纜車、河口湖遊覽船": "河口湖纜車、遊覽船",
  "賽馬體驗": "中山競馬場入場券",
  "還車": "還車 (日産レンタカー)",
  "退房、行李寄送服務": "行李寄送服務",
  "飯店 check in": "入住 東京六本木凱富飯店",
  "貴賓室體驗": "貴賓室體驗 (希和 -NOA-)",
  "小港機場 出發": "小港機場返家",
};

// 1. 建立附件的查找表 (Lookup Map)
const attachmentMap = new Map<string, { name: string; format: string }>();
attachmentsOverride.附件下載清單.forEach(item => {
    const key = normalizeActivityKey(item.日期, item.行程.split(' (')[0]);
    if (attachmentMap.has(key)) {
        console.warn(`[Attachment Override] Duplicate key found and will be overwritten: ${key}`);
    }
    attachmentMap.set(key, { name: item.附件類型, format: item.檔案格式與數量 });
});

/**
 * Extracts flight information from map link strings and notes,
 * returning the flight data and a cleaned map link string.
 */
function extractFlightInfo(mapLink: string | string[] | undefined, note: string | undefined): {
  flightInfo?: { airlineCode: string; flightNumber: string; };
  cleanedMapLink: string | string[] | undefined;
  cleanedNote: string | undefined;
} {
  let cleanedNote = note;
  if (!mapLink) {
    return { cleanedMapLink: mapLink, cleanedNote };
  }

  const linkString = Array.isArray(mapLink) ? mapLink.join(',') : mapLink;
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

// 用於追蹤已生成的 activityId 以處理重複
const activityIdRegistry = new Map<string, number>();

// 轉換為應用程式使用的 Trip 結構
export const tripData: Trip = {
  name: rawData.行程名稱,
  days: rawData.行程詳情.map(day => ({
    date: day.日期,
    activities: day.活動.map(act => {
      // 使用 alias map 來匹配
      const overrideTitle = titleAliasMap[act.行程.trim()] || act.行程;
      const key = normalizeActivityKey(day.日期, overrideTitle.split(' (')[0]);
      const attachmentInfo = attachmentMap.get(key);

      // 策略 B: 以實際檔案為準 (Trust Actual Files)
      // 預先查找對應的資料夾附件，確保在 return 時可存取 fileData
      const lookupKey = buildActivityKey(day.日期, overrideTitle);
      const folderName = activityKeyToFolderMap[lookupKey];
      const fileData = folderName ? attachmentsByFolder[folderName] : undefined;

      // 處理重複的 activityId
      let baseId = buildActivityId(day.日期, overrideTitle);
      const count = activityIdRegistry.get(baseId) || 0;
      if (count > 0) {
        console.warn(`[Activity ID] Duplicate activity slug found: "${baseId}". Appending suffix "-${count + 1}".`);
        baseId = `${baseId}-${count + 1}`;
      }
      activityIdRegistry.set(baseId, count + 1);
      const id = baseId;

      let ticketType: Activity['ticketType'] | undefined;
      let ticketSlots: Activity['ticketSlots'] = [];

      // ** FIX: Extract flight info and clean map links before parsing **
      let { flightInfo, cleanedMapLink, cleanedNote } = extractFlightInfo(act.地圖連結, act.備註);

      // 1) 修正資料層/解析層: 針對特定行程注入 Voucher 資料
      // 規則：12/31 自宅出發 & 1/5 小港機場 出發
      let specialVoucherData: { url: string; code: string; name: string } | null = null;
      if (day.日期.includes('12/31') && act.行程.includes('自宅出發')) {
        specialVoucherData = {
          name: '肯驛機場接駁',
          url: 'https://68666.tw/Xyvf',
          code: '7509'
        };
      } else if (day.日期.includes('1/5') && act.行程.includes('小港機場 出發')) {
        specialVoucherData = {
          name: '肯驛機場接駁',
          url: 'https://68666.tw/7zv1',
          code: '9660'
        };
      }

      if (attachmentInfo) {
        // 如果在 override 列表中找到，則解析附件資訊
        ({ ticketType, ticketSlots } = parseTicketInfo(attachmentInfo.format, id));

        // 策略 B: 以實際檔案為準 (Trust Actual Files)
        // 如果 attachmentsByFolder 中有更多檔案，則擴充 ticketSlots 以顯示所有檔案
        if (fileData) {
            if (fileData.pdf) {
                // 確保 slots 數量足夠
                const currentPdfSlots = ticketSlots.filter(s => s.type === 'pdf');
                const needed = fileData.pdf.length - currentPdfSlots.length;
                
                if (needed > 0) {
                    for (let i = 0; i < needed; i++) {
                        ticketSlots.push({
                            id: `${id}:pdf:extra:${i}`,
                            type: 'pdf',
                            label: `PDF ${currentPdfSlots.length + i + 1}`,
                        });
                    }
                }

                // 填入資料
                ticketSlots.filter(s => s.type === 'pdf').forEach((slot, i) => {
                    slot.label = fileData.pdf![i].label;
                    slot.value = fileData.pdf![i].url;
                });
            }
            if (fileData.qr) {
                const currentQrSlots = ticketSlots.filter(s => s.type === 'qr_image');
                const needed = fileData.qr.length - currentQrSlots.length;

                if (needed > 0) {
                    for (let i = 0; i < needed; i++) {
                        ticketSlots.push({
                            id: `${id}:qr:extra:${i}`,
                            type: 'qr_image',
                            label: `QR ${currentQrSlots.length + i + 1}`,
                        });
                    }
                }

                ticketSlots.filter(s => s.type === 'qr_image').forEach((slot, i) => {
                    slot.label = fileData.qr![i].label;
                    slot.value = fileData.qr![i].url;
                });
            }
        }

        // 從 map 中移除已使用的項目，以便最後檢查是否有未匹配的
        attachmentMap.delete(key);
      } else {
      }

      // 若有特殊 Voucher 資料，強制覆蓋或新增 link_with_code slot
      if (specialVoucherData) {
        // 移除舊的泛用 slot (如果有)
        ticketSlots = ticketSlots.filter(s => s.type !== 'link_with_code');
        
        ticketType = TicketType.LINK_WITH_CODE;
        ticketSlots.push({
          id: `${id}:link_code:special`,
          type: 'link_with_code',
          label: specialVoucherData.name,
          value: { serviceName: specialVoucherData.name, url: specialVoucherData.url, code: specialVoucherData.code }
        });
      }

      // Special handling for Ninja Show
      if (act.行程.includes('東京忍者＆歌舞伎表演')) {
        // This will override the generic "LINK * 2" from attachments.ts
        ticketSlots = [
          { id: `${id}:link:1`, type: 'link', label: '票券（1 人）', value: 'https://t.linktivity.io/issueticket/tryhard/H6-NVmgBjHiN7DX4/KKDAY-20251115-WZWQ?lang=ZT' },
          { id: `${id}:link:2`, type: 'link', label: '票券（2 人 A）', value: 'https://t.linktivity.io/issueticket/tryhard/f7vPTHEeERi2C-oa/CTRIP-20251113-HFHF?lang=EN' },
          { id: `${id}:link:3`, type: 'link', label: '票券（2 人 B）', value: 'https://t.linktivity.io/issueticket/tryhard/DrHDQOeurwlEzOcf/CTRIP-20251113-694N?lang=EN' },
        ];
        
        const newNotes = [
          '• 請提前 15 分鐘抵達。',
          '• 16 歲以下需由家長/監護人陪同。',
          '• 若醉酒可能被拒絕入場。',
          '• 表演期間禁止拍照。',
          '• 不提供指定座位。',
          '• 寵物禁止（服務犬除外）。',
          '• 請攜帶可驗證身份的證件（如護照）。',
          '• 地點：JR 新宿站東口往歌舞伎町方向，近哥吉拉大樓。'
        ].join('\n');
        
        // Override notes, keeping original if it exists and adding new ones.
        cleanedNote = newNotes;
      }

      const normalizedPlaceName = normalizePlaceLabel(act.地點);
      const parsed = parseMapTargets(cleanedMapLink, normalizedPlaceName);
      const mapTargets = parsed.mapTargets.map(t => ({
        ...t,
        label: normalizePlaceLabel(t.label || '')
      }));
      const infoLinks = parsed.infoLinks;

      // Gmail Reservation Mapping
      const gmailMatch = gmailReservations.find(r => {
        const rKey = normalizeActivityKey(r.日期, r.行程.split(' (')[0]);
        return rKey === key;
      });

      if (gmailMatch) {
        ticketSlots.push({
          id: `${id}:gmail:auto`,
          type: 'gmail',
          label: '跳轉 Gmail',
          value: { subject: gmailMatch.Gmail主旨, url: buildGmailSearchUrl(gmailMatch.Gmail主旨) }
        });
      }

      // --- Description Mapping Logic ---
      let description: string | undefined = undefined;
      
      // 1. 強制覆寫 (最高優先)
      if (id in descriptionOverrideById) {
        description = descriptionOverrideById[id];
      } else {
        const titleKey = normalizeForDescriptionMatch(act.行程);
        const locKey = normalizeForDescriptionMatch(act.地點 || '');

        // 2. 自動 matching (次優先)
        if (descriptionMap.has(titleKey)) {
          description = descriptionMap.get(titleKey);
        } else if (descriptionMap.has(locKey)) {
          description = descriptionMap.get(locKey);
        } else {
          // 3. Contains fallback
          const matches = rawDescriptionList.filter(d => 
            (titleKey && d.key && titleKey.includes(d.key)) || 
            (locKey && d.key && locKey.includes(d.key))
          );

          if (matches.length === 1) {
            description = matches[0].desc;
          } else if (matches.length > 1) {
            // 若有多個匹配，選擇最長的那個 (通常更具體)
            matches.sort((a, b) => b.key.length - a.key.length);
            description = matches[0].desc;
          }
        }
      }
      // ---------------------------------

      const activityObj = {
        id,
        date: day.日期,
        time: act.時間,
        title: act.行程,
        placeName: normalizedPlaceName, // 附件名稱現在來自 override list
        reservedLabel: attachmentInfo ? attachmentInfo.name : act.是否預約,
        flightInfo, // ** ADDED: Pass flight info to the final object **
        reservationTime: act.預約時間,
        description, // ** ADDED: Description **
        notes: cleanedNote, // ** FIX: Use cleaned note **
        mapTargets, // ** FIX: Use cleaned map link **
        infoLinks, // ** ADDED: Info links **
        ticketType,
        ticketSlots,
        // Compatibility properties for UI
        activity: act.行程,
        location: normalizedPlaceName,
        note: cleanedNote, // ** FIX: Use cleaned note **
        isReserved: !!(attachmentInfo ? attachmentInfo.name : act.是否預約),
        attachments: fileData,
        // @ts-ignore: rawRelatedFormat is not in Activity interface but useful for debugging
        rawRelatedFormat: act.相關格式
      } as Activity;

      return activityObj;
    })
  }))
};

// Dev-only Audit Tool
if (process.env.NODE_ENV !== 'production') {
    (global as any).auditItineraryAttachments = () => {
        console.table(
            attachmentsOverride.附件下載清單.map(item => {
                const key = normalizeActivityKey(item.日期, item.行程);
                // Find matching activity in generated tripData
                let actualSlots = 0;
                let folderName = 'N/A';
                let status = 'OK';
                let notes = '';

                // Reverse lookup in tripData
                for (const day of tripData.days) {
                    for (const act of day.activities) {
                        const actKey = normalizeActivityKey(day.date, titleAliasMap[act.title] || act.title);
                        if (actKey === key) {
                            folderName = act.id;
                            actualSlots = act.ticketSlots.length;
                            
                            // Check against attachmentsByFolder
                            const overrideTitle = titleAliasMap[act.title] || act.title;
                            const lookupKey = buildActivityKey(day.date, overrideTitle);
                            const folder = activityKeyToFolderMap[lookupKey];
                            const files = folder ? attachmentsByFolder[folder] : undefined;

                            const fileCount = (files?.pdf?.length || 0) + (files?.qr?.length || 0);
                            
                            if (fileCount > 0 && fileCount !== actualSlots) {
                                status = 'MISMATCH';
                                notes = `Spec: ${item.檔案格式與數量}, Files: ${fileCount}, Slots: ${actualSlots}`;
                            }
                        }
                    }
                }
                return { Date: item.日期, Activity: item.行程, Spec: item.檔案格式與數量, Actual: actualSlots, Folder: folderName, Status: status, Notes: notes };
            })
        );
    };
}

if (attachmentMap.size > 0) {
    console.warn('[Attachment Mismatch] The following items from the attachment list could not be matched to any activity in the main itinerary:');
    attachmentMap.forEach((value, key) => {
        const [date, title] = key.split('|');
        console.warn(`- Date: ${date}, Title: ${title}, Attachment: ${value.name}`);
    });
}

// 為了相容舊程式碼，匯出扁平化的 itineraryData
export const itineraryData = tripData.days.flatMap(day => day.activities);