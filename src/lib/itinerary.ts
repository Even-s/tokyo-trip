import { Trip, Activity, TicketSlot } from './types';
import { buildActivityId, parseMapTargets, parseTicketInfo, normalizeActivityKey, normalizePlaceLabel, normalizeForDescriptionMatch, buildGmailSearchUrl, extractFlightInfo, syncSlotsWithFiles } from './utils';
import { attachmentsByFolder, activityKeyToFolderMap, buildActivityKey, attachmentsOverride } from '../data/itinerary-attachments';
import { descriptionMap, rawDescriptionList, descriptionOverrideById } from '@/data/itinerary-descriptions';
import { gmailReservations } from '@/data/gmail-reservations';
import { rawData } from '@/data/raw-trip-data';
import { patchRules } from '@/config/trip-patches';
import { titleAliasMap } from '@/config/trip-aliases';

// 1. 建立附件的查找表 (Lookup Map)
function buildAttachmentMap() {
  const map = new Map<string, { name: string; format: string }>();
  attachmentsOverride.附件下載清單.forEach(item => {
    const key = normalizeActivityKey(item.日期, item.行程.split(' (')[0]);
    if (map.has(key)) {
      console.warn(`[Attachment Override] Duplicate key found and will be overwritten: ${key}`);
    }
    map.set(key, { name: item.附件類型, format: item.檔案格式與數量 });
  });
  return map;
}

// 2. 建立 Gmail 預約的查找表 (Lookup Map)
function buildGmailMap() {
  const map = new Map<string, { subject: string }>();
  gmailReservations.forEach(r => {
    const key = normalizeActivityKey(r.日期, r.行程.split(' (')[0]);
    map.set(key, { subject: r.Gmail主旨 });
  });
  return map;
}

// 用於追蹤已生成的 activityId 以處理重複
const activityIdRegistry = new Map<string, number>();

// Helper: Initialize Attachment Map once
const attachmentMap = buildAttachmentMap();
const gmailMap = buildGmailMap();

// 轉換為應用程式使用的 Trip 結構
export const tripData: Trip = {
  name: rawData.行程名稱,
  days: rawData.行程詳情.map(day => ({
    date: day.日期,
    activities: day.活動.map(act => {
      // Lazy init map inside the loop? No, better outside. 
      // But since we are inside the map function, we need to access the map.
      // Let's initialize it once outside.
      // Actually, `tripData` is exported as a const, so we can init map once.
      // See below for the implementation.
      
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

      if (attachmentInfo) {
        // 如果在 override 列表中找到，則解析附件資訊
        ({ ticketType, ticketSlots } = parseTicketInfo(attachmentInfo.format, id));

        // 策略 B: 以實際檔案為準 (Trust Actual Files)
        // 如果 attachmentsByFolder 中有更多檔案，則擴充 ticketSlots 以顯示所有檔案
        ticketSlots = syncSlotsWithFiles(id, ticketSlots, fileData);

        // 從 map 中移除已使用的項目，以便最後檢查是否有未匹配的
        attachmentMap.delete(key);
      } else {
      }

      const normalizedPlaceName = normalizePlaceLabel(act.地點);
      const parsed = parseMapTargets(cleanedMapLink, normalizedPlaceName);
      const mapTargets = parsed.mapTargets.map(t => ({
        ...t,
        label: normalizePlaceLabel(t.label || '')
      }));
      const infoLinks = parsed.infoLinks;

      // Gmail Reservation Mapping
      const gmailMatch = gmailMap.get(key);
      if (gmailMatch) {
        ticketSlots.push({
          id: `${id}:gmail:auto`,
          type: 'gmail',
          label: '跳轉 Gmail',
          value: { subject: gmailMatch.subject, url: buildGmailSearchUrl(gmailMatch.subject) }
        });
      }

      // --- Description Mapping Logic ---
      const description = resolveDescription(id, act.行程, act.地點 || '');

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

      // Apply Patches (Rules-based modifications)
      let finalActivity = activityObj;
      for (const rule of patchRules) {
        if (rule.match(day.日期, act.行程)) {
          finalActivity = rule.apply(finalActivity);
        }
      }

      return finalActivity;
    })
  }))
};

// Helper: Resolve Description
function resolveDescription(id: string, title: string, location: string): string | undefined {
  // 1. 強制覆寫 (最高優先)
  if (id in descriptionOverrideById) {
    return descriptionOverrideById[id];
  }

  const titleKey = normalizeForDescriptionMatch(title);
  const locKey = normalizeForDescriptionMatch(location);

  // 2. 自動 matching (次優先)
  if (descriptionMap.has(titleKey)) {
    return descriptionMap.get(titleKey);
  }
  if (descriptionMap.has(locKey)) {
    return descriptionMap.get(locKey);
  }

  // 3. Contains fallback
  const matches = rawDescriptionList.filter(d =>
    (titleKey && d.key && titleKey.includes(d.key)) ||
    (locKey && d.key && locKey.includes(d.key))
  );

  if (matches.length === 1) {
    return matches[0].desc;
  } else if (matches.length > 1) {
    matches.sort((a, b) => b.key.length - a.key.length);
    return matches[0].desc;
  }
  return undefined;
}

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