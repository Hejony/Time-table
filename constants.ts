
import { DaySchedule } from './types';

export const ADMIN_PASSWORD = "0421";

// ==========================================================================================
// [설정 완료] 구글 앱스 스크립트(Google Apps Script) 연결
// ==========================================================================================
export const DB_URL = "https://script.google.com/macros/s/AKfycbzs4rXf3TK871vW1psHSmoUM7R4Y89u246HZ3C-elIXUxAKVCYWwNaVxe3g4sph-AlQ/exec";

export const SCHEDULE: DaySchedule[] = [
  // 13시부터 20시까지 (20 포함)
  { date: '2025-11-29', label: '11.29 (Sat)', startHour: 13, endHour: 20 },
  // 10시부터 18시까지 (18 포함)
  { date: '2025-11-30', label: '11.30 (Sun)', startHour: 10, endHour: 18 },
  { date: '2025-12-01', label: '12.01 (Mon)', startHour: 10, endHour: 18 },
  { date: '2025-12-02', label: '12.02 (Tue)', startHour: 10, endHour: 18 },
];

export const INITIAL_STATUS = {
  hyejeong: false,
  yebin: false,
};