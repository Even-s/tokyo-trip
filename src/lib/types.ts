export enum TicketType {
  NONE = 'NONE',
  QR_IMAGE = 'QR_IMAGE',
  PDF_FILE = 'PDF_FILE',
  LINK = 'LINK',
  LINK_WITH_CODE = 'LINK_WITH_CODE',
  APP_JUMP = 'APP_JUMP',
  GMAIL_JUMP = 'GMAIL_JUMP',
}

export interface TicketSlot {
  id: string;
  type: 'qr_image' | 'pdf' | 'link' | 'link_with_code' | 'app' | 'gmail';
  label: string;
  value?: any; // 用於儲存實際的 URL, 圖片路徑, 或 App config
}

export interface MapTarget {
  label?: string;
  url?: string;
  query?: string;
}

export interface InfoLink {
  label: string;
  url: string;
}

export interface Activity {
  id: string;
  date: string;
  time: string;
  title: string;
  placeName?: string;
  reservedLabel?: string;
  reservationTime?: string;
  notes?: string;
  description?: string;
  mapTargets: MapTarget[];
  infoLinks: InfoLink[];
  ticketType: TicketType;
  ticketSlots: TicketSlot[];
}

export interface Day {
  date: string;
  activities: Activity[];
}

export interface Trip {
  name: string;
  days: Day[];
}