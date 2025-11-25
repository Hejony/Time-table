
import { DaySchedule } from './types';

export const ADMIN_PASSWORD = "0421";

// ==========================================================================================
// [설정 완료] 구글 앱스 스크립트(Google Apps Script) 연결
// ==========================================================================================
// 보내주신 웹 앱 URL을 아래에 적용했습니다.
// 이제 데이터가 이 주소를 통해 Google 스프레드시트(또는 스크립트 속성)에 저장됩니다.
// ==========================================================================================

export const DB_URL = "https://script.google.com/macros/s/AKfycbzs4rXf3TK871vW1psHSmoUM7R4Y89u246HZ3C-elIXUxAKVCYWwNaVxe3g4sph-AlQ/exec";

export const SCHEDULE: DaySchedule[] = [
  { date: '2025-11-29', label: '11.29 (Sat)', startHour: 13, endHour: 19 },
  { date: '2025-11-30', label: '11.30 (Sun)', startHour: 10, endHour: 17 },
  { date: '2025-12-01', label: '12.01 (Mon)', startHour: 10, endHour: 17 },
  { date: '2025-12-02', label: '12.02 (Tue)', startHour: 10, endHour: 17 },
];

export const INITIAL_STATUS = {
  hyejeong: false,
  yebin: false,
};
