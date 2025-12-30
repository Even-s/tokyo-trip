export interface ItineraryItem {
  id: string;
  date: string; // Format: YYYY-MM-DD
  time: string; // Format: HH:mm
  location: string;
  activity: string;
  isBooked: boolean;
  note?: string;
  category: 'sightseeing' | 'transport' | 'food' | 'event';
}

export const itineraryData: ItineraryItem[] = [
  {
    id: '1',
    date: '2025-12-31',
    time: '22:00',
    location: 'Zojoji Temple',
    activity: 'New Year Countdown (Joya no Kane)',
    isBooked: false,
    note: 'Arrive early for the bell ringing ceremony.',
    category: 'event',
  },
  {
    id: '2',
    date: '2026-01-01',
    time: '05:30',
    location: 'Tokyo Skytree',
    activity: 'First Sunrise (Hatsuhinode)',
    isBooked: true,
    note: 'Special observation deck tickets required.',
    category: 'sightseeing',
  },
  {
    id: '3',
    date: '2026-01-01',
    time: '10:00',
    location: 'Asakusa Senso-ji',
    activity: 'Hatsumode (First Shrine Visit)',
    isBooked: false,
    note: 'Expect heavy crowds. Get Omikuji.',
    category: 'sightseeing',
  },
  {
    id: '4',
    date: '2026-01-02',
    time: '09:00',
    location: 'Shinjuku Station',
    activity: 'Pick up Rental Car',
    isBooked: true,
    note: 'Passport and International Driving Permit required.',
    category: 'transport',
  },
  {
    id: '5',
    date: '2026-01-02',
    time: '14:00',
    location: 'Lake Kawaguchiko',
    activity: 'Check-in & Lakeside Drive',
    isBooked: true,
    note: 'View of Mt. Fuji from the north shore.',
    category: 'sightseeing',
  },
  {
    id: '6',
    date: '2026-01-03',
    time: '10:00',
    location: 'Oshino Hakkai',
    activity: 'Spring Water Ponds Tour',
    isBooked: false,
    note: 'Try the grilled fish and mochi.',
    category: 'sightseeing',
  },
  {
    id: '7',
    date: '2026-01-04',
    time: '11:00',
    location: 'Nakayama Racecourse',
    activity: 'New Year Horse Racing',
    isBooked: false,
    note: 'Experience the atmosphere of Japanese racing.',
    category: 'event',
  },
];