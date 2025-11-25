
import { DB_URL } from './constants';
import { AppData } from './types';

export const api = {
  // Load data from the cloud
  loadData: async (): Promise<AppData | null> => {
    try {
      // Google Apps Script often requires follow redirect
      // Adding timestamp to prevent browser caching
      const separator = DB_URL.includes('?') ? '&' : '?';
      const urlWithTimestamp = `${DB_URL}${separator}t=${Date.now()}`;
      
      const response = await fetch(urlWithTimestamp, {
        method: 'GET',
        // 'cors' mode is default, but explicit is good. 
        // GAS Web Apps handle CORS automatically if 'Anyone' access is set.
        mode: 'cors', 
        credentials: 'omit', 
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.status === 404) return null; // Initial state
      if (!response.ok) {
        console.warn(`Server responded with status: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      return data as AppData;
    } catch (e) {
      console.warn("Network error during load:", e);
      return null;
    }
  },

  // Save data to the cloud
  saveData: async (data: AppData): Promise<boolean> => {
    try {
      // For Google Apps Script, we send POST raw body
      const response = await fetch(DB_URL, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // 'text/plain' prevents preflight OPTION request issues in some simple backends
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        console.warn('Server save failed:', response.status);
        return false;
      }
      return true;
    } catch (e) {
      console.warn("Network error during save:", e);
      return false;
    }
  }
};
