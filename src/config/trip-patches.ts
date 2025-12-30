import { Activity, TicketType } from '@/lib/types';

export interface PatchRule {
  match: (date: string, title: string) => boolean;
  apply: (activity: Activity) => Activity;
}

export const patchRules: PatchRule[] = [
  {
    // 12/31 Airport Transfer
    match: (date, title) => date.includes('12/31') && title.includes('自宅出發'),
    apply: (act) => {
      // Remove existing link_with_code if any
      const slots = act.ticketSlots.filter(s => s.type !== 'link_with_code');
      slots.push({
        id: `${act.id}:link_code:special`,
        type: 'link_with_code',
        label: '肯驛機場接駁',
        value: {
          serviceName: '肯驛機場接駁',
          url: 'https://68666.tw/Xyvf',
          code: '7509'
        }
      });
      return {
        ...act,
        ticketType: TicketType.LINK_WITH_CODE,
        ticketSlots: slots
      };
    }
  },
  {
    // 1/5 Airport Transfer
    match: (date, title) => date.includes('1/5') && title.includes('小港機場 出發'),
    apply: (act) => {
      const slots = act.ticketSlots.filter(s => s.type !== 'link_with_code');
      slots.push({
        id: `${act.id}:link_code:special`,
        type: 'link_with_code',
        label: '肯驛機場接駁',
        value: {
          serviceName: '肯驛機場接駁',
          url: 'https://68666.tw/7zv1',
          code: '9660'
        }
      });
      return {
        ...act,
        ticketType: TicketType.LINK_WITH_CODE,
        ticketSlots: slots
      };
    }
  },
  {
    // Ninja Show
    match: (_date, title) => title.includes('東京忍者＆歌舞伎表演'),
    apply: (act) => {
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

      return {
        ...act,
        notes: newNotes,
        note: newNotes, // compatibility
        ticketSlots: [
          { id: `${act.id}:link:1`, type: 'link', label: '票券（1 人）', value: 'https://t.linktivity.io/issueticket/tryhard/H6-NVmgBjHiN7DX4/KKDAY-20251115-WZWQ?lang=ZT' },
          { id: `${act.id}:link:2`, type: 'link', label: '票券（2 人 A）', value: 'https://t.linktivity.io/issueticket/tryhard/f7vPTHEeERi2C-oa/CTRIP-20251113-HFHF?lang=EN' },
          { id: `${act.id}:link:3`, type: 'link', label: '票券（2 人 B）', value: 'https://t.linktivity.io/issueticket/tryhard/DrHDQOeurwlEzOcf/CTRIP-20251113-694N?lang=EN' },
        ]
      };
    }
  }
];