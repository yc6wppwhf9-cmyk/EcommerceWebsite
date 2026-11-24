// Indian states and union territories by the region code Vercel attaches to a
// visitor (the ISO 3166-2 part after "IN-"), with the sales zone each falls in.

export type Zone = 'North' | 'South' | 'East' | 'West' | 'Central' | 'North-East';
export const ZONES: Zone[] = ['North', 'South', 'East', 'West', 'Central', 'North-East'];
export const OUTSIDE_INDIA = 'Outside India';
export const UNKNOWN = 'Not recorded';

const STATES: Record<string, [string, Zone]> = {
  DL: ['Delhi', 'North'], HR: ['Haryana', 'North'], PB: ['Punjab', 'North'], HP: ['Himachal Pradesh', 'North'],
  JK: ['Jammu and Kashmir', 'North'], LA: ['Ladakh', 'North'], CH: ['Chandigarh', 'North'], UP: ['Uttar Pradesh', 'North'],
  UT: ['Uttarakhand', 'North'], UK: ['Uttarakhand', 'North'], UL: ['Uttarakhand', 'North'], RJ: ['Rajasthan', 'North'],
  MH: ['Maharashtra', 'West'], GJ: ['Gujarat', 'West'], GA: ['Goa', 'West'],
  DH: ['Dadra and Nagar Haveli and Daman and Diu', 'West'], DN: ['Dadra and Nagar Haveli and Daman and Diu', 'West'],
  DD: ['Dadra and Nagar Haveli and Daman and Diu', 'West'],
  KA: ['Karnataka', 'South'], TN: ['Tamil Nadu', 'South'], KL: ['Kerala', 'South'], AP: ['Andhra Pradesh', 'South'],
  TG: ['Telangana', 'South'], TS: ['Telangana', 'South'], PY: ['Puducherry', 'South'], LD: ['Lakshadweep', 'South'],
  WB: ['West Bengal', 'East'], OR: ['Odisha', 'East'], OD: ['Odisha', 'East'], BR: ['Bihar', 'East'], JH: ['Jharkhand', 'East'],
  AN: ['Andaman and Nicobar Islands', 'East'],
  MP: ['Madhya Pradesh', 'Central'], CT: ['Chhattisgarh', 'Central'], CG: ['Chhattisgarh', 'Central'],
  AS: ['Assam', 'North-East'], AR: ['Arunachal Pradesh', 'North-East'], MN: ['Manipur', 'North-East'],
  ML: ['Meghalaya', 'North-East'], MZ: ['Mizoram', 'North-East'], NL: ['Nagaland', 'North-East'],
  TR: ['Tripura', 'North-East'], SK: ['Sikkim', 'North-East'],
};

export interface Place { city: string; state: string; zone: string; country: string }

/** Readable city / state / zone for a click's stored location fields. */
export function place(city?: string | null, region?: string | null, country?: string | null): Place {
  const c = (country || '').toUpperCase();
  if (!c) return { city: city || '', state: '', zone: UNKNOWN, country: '' };
  if (c !== 'IN') return { city: city || '', state: '', zone: OUTSIDE_INDIA, country: c };
  const s = STATES[(region || '').toUpperCase()];
  return { city: city || '', state: s ? s[0] : region || '', zone: s ? s[1] : UNKNOWN, country: 'IN' };
}
