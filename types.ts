
export interface Note {
  id: string;
  name: string; // Display name
  content: string; // Private message
  password: string; // Ideally hashed, but keeping raw for simple client-side demo
  createdAt: number;
}

export interface SlotStatus {
  hyejeong: boolean; // true = Present, false = Absent
  yebin: boolean;    // true = Present, false = Absent
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  label: string; // Display name e.g., "11.29 (Sat)"
  startHour: number;
  endHour: number;
}

// Key is "YYYY-MM-DD-HH"
export interface AppData {
  notes: Record<string, Note[]>;
  status: Record<string, SlotStatus>;
}
