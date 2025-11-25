
import React, { useState, useEffect, useCallback } from 'react';
import { Settings, User, Plus, Lock, RefreshCw, Cloud, WifiOff } from './components/Icons';
import { SCHEDULE, INITIAL_STATUS } from './constants';
import { AppData, Note } from './types';
import AdminModal from './components/AdminModal';
import NoteModal from './components/NoteModal';
import { api } from './api';

// Mock ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);
const LOCAL_STORAGE_KEY = 'grad_show_data_v2';

const App: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState(0); // Index of SCHEDULE
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Data State
  const [data, setData] = useState<AppData>({ notes: {}, status: {} });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [lastSynced, setLastSynced] = useState<string>('-');

  // Modals
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // --- Data Synchronization ---
  
  const refreshData = useCallback(async (silent = false) => {
    if (!silent) setIsSyncing(true);
    
    // 1. Load from Cloud
    const cloudData = await api.loadData();
    
    if (cloudData) {
      // Success: Cloud has data
      setData(cloudData);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cloudData));
      setLastSynced(new Date().toLocaleTimeString());
      setIsOffline(false);
    } else {
      // Load Failed
      // If local data exists, use it but mark as offline
      const localStr = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localStr) {
        // Try to restore cloud with local data ONLY if cloud was truly empty/404 (not error)
        // But api.ts returns null for both. 
        // For safety, we just enter Offline Mode unless we are sure.
        // To try auto-fix:
        const localData = JSON.parse(localStr);
        
        // Attempt one save to see if it's just an empty DB or a network error
        const saveSuccess = await api.saveData(localData);
        if (saveSuccess) {
          setIsOffline(false);
          setLastSynced(new Date().toLocaleTimeString());
        } else {
          setIsOffline(true);
        }
      } else {
        // No local, no cloud. Try init.
        const emptyData = { notes: {}, status: {} };
        const saveSuccess = await api.saveData(emptyData);
        if (!saveSuccess) setIsOffline(true);
      }
    }

    if (!silent) setIsSyncing(false);
    setIsLoading(false);
  }, []);

  // Initial Load & Polling
  useEffect(() => {
    // 0. Immediate Local Load (for instant UX)
    const localStr = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localStr) {
      try {
        const localData = JSON.parse(localStr);
        setData(localData);
        setIsLoading(false); // Show content immediately
      } catch (e) {
        console.error("Local storage parse error", e);
      }
    }

    // 1. Then fetch Cloud
    refreshData();

    // 2. Poll every 5 seconds
    const intervalId = setInterval(() => {
      refreshData(true);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [refreshData]);

  // Helper to update state optimistically AND save to cloud
  const updateData = async (newData: AppData) => {
    // 1. Optimistic Update
    setData(newData);
    
    // 2. Save to Local Storage (Backup)
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));

    // 3. Sync to Cloud
    setIsSyncing(true);
    const success = await api.saveData(newData);
    setIsSyncing(false);

    if (success) {
      setLastSynced(new Date().toLocaleTimeString());
      setIsOffline(false);
    } else {
      setIsOffline(true);
    }
  };

  // --- Handlers ---

  const handleAdminToggle = () => {
    if (isAdmin) {
      setIsAdmin(false);
    } else {
      setShowAdminLogin(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
  };

  const togglePresence = (slotKey: string, person: 'hyejeong' | 'yebin') => {
    const currentStatus = data.status[slotKey] || { ...INITIAL_STATUS };
    const newData = {
      ...data,
      status: {
        ...data.status,
        [slotKey]: {
          ...currentStatus,
          [person]: !currentStatus[person]
        }
      }
    };
    updateData(newData);
  };

  const openAddNoteModal = (slotKey: string) => {
    setSelectedSlotKey(slotKey);
    setSelectedNote(null);
    setNoteModalOpen(true);
  };

  const openViewNoteModal = (note: Note) => {
    setSelectedNote(note);
    setNoteModalOpen(true);
  };

  const handleAddNote = (name: string, content: string, password: string) => {
    if (!selectedSlotKey) return;
    
    const newNote: Note = {
      id: generateId(),
      name,
      content,
      password,
      createdAt: Date.now()
    };

    const newData = {
      ...data,
      notes: {
        ...data.notes,
        [selectedSlotKey]: [...(data.notes[selectedSlotKey] || []), newNote]
      }
    };
    updateData(newData);
  };

  const handleUpdateNote = (noteId: string, name: string, content: string, password: string) => {
    let targetSlotKey = "";
    Object.keys(data.notes).forEach(key => {
      if(data.notes[key].some(n => n.id === noteId)) {
        targetSlotKey = key;
      }
    });

    if (targetSlotKey) {
      const newData = {
        ...data,
        notes: {
          ...data.notes,
          [targetSlotKey]: data.notes[targetSlotKey].map(n => 
            n.id === noteId 
              ? { ...n, name, content, password } 
              : n
          )
        }
      };
      updateData(newData);
    }
  };

  const handleDeleteNote = (noteId: string) => {
    let targetSlotKey = "";
    Object.keys(data.notes).forEach(key => {
      if(data.notes[key].some(n => n.id === noteId)) {
        targetSlotKey = key;
      }
    });

    if (targetSlotKey) {
      const newData = {
        ...data,
        notes: {
          ...data.notes,
          [targetSlotKey]: data.notes[targetSlotKey].filter(n => n.id !== noteId)
        }
      };
      updateData(newData);
    }
  };

  // --- Render Helpers ---

  const currentSchedule = SCHEDULE[activeTab];
  const hours = Array.from(
    { length: currentSchedule.endHour - currentSchedule.startHour + 1 }, 
    (_, i) => currentSchedule.startHour + i
  );

  const getSlotKey = (hour: number) => `${currentSchedule.date}-${hour}`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-primary" size={32} />
          <p className="text-gray-500 font-bold">전시 일정 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 font-sans">
      {/* Mobile Frame */}
      <div className="relative w-full max-w-[400px] h-[850px] bg-white rounded-[3rem] shadow-2xl border-[8px] border-gray-900 overflow-hidden flex flex-col">
        
        {/* Notch Area */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-xl z-20"></div>

        {/* Header */}
        <header className="pt-12 pb-4 px-6 bg-white z-10 sticky top-0 border-b border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-none">Graduation<br/>Show Time Table</h1>
              <div 
                onClick={() => refreshData(false)}
                className="flex items-center gap-1.5 mt-2 cursor-pointer hover:opacity-70 transition-opacity"
                title="클릭하여 새로고침"
              >
                {isOffline ? (
                   <>
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                      연결 끊김 (로컬 저장됨)
                      <WifiOff size={8} />
                    </span>
                   </>
                ) : (
                  <>
                    <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`}></div>
                    <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                      {isSyncing ? '동기화 중...' : `동기화 완료 (${lastSynced})`}
                      <RefreshCw size={8} className={isSyncing ? 'animate-spin' : ''}/>
                    </span>
                  </>
                )}
              </div>
            </div>
            <button 
              onClick={handleAdminToggle}
              className={`p-2 rounded-full transition-all ${isAdmin ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}
            >
              {isAdmin ? <Settings size={20} /> : <Lock size={20} />}
            </button>
          </div>

          {isOffline && (
            <div className="bg-red-50 p-2 rounded-lg mb-2 text-[10px] text-red-500 text-center border border-red-100">
              <b>서버 연결 실패!</b><br/>
              작성한 내용은 내 폰에만 저장되며 공유되지 않습니다.<br/>
              (AdBlock 해제 또는 WiFi 확인 필요)
            </div>
          )}

          <div className="bg-secondary/50 p-3 rounded-xl mb-4 text-xs text-gray-600 leading-relaxed border border-blue-100">
            <span className="font-bold text-primary">이용 안내</span><br/>
            원하는 시간대에 <span className="font-bold">이름</span>과 <span className="font-bold">메시지</span>를 남겨주세요.<br/>
            메시지는 비밀로 유지되며, 저희만 확인할 수 있어요!<br/>
            미리 남겨주시면 <span className="font-bold text-gray-800">특별한 선물</span>을 준비해둘게요 🎁
          </div>

          {/* Date Selector */}
          <div className="flex justify-between bg-gray-50 p-1 rounded-2xl overflow-x-auto no-scrollbar">
            {SCHEDULE.map((day, idx) => (
              <button
                key={day.date}
                onClick={() => setActiveTab(idx)}
                className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  activeTab === idx 
                    ? 'bg-white text-primary shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </header>

        {/* Content - Scrollable Area */}
        <main className="flex-1 overflow-y-auto no-scrollbar bg-white pb-20">
          <div className="px-4 py-4 space-y-4">
            {hours.map((hour) => {
              const slotKey = getSlotKey(hour);
              const status = data.status[slotKey] || INITIAL_STATUS;
              const notes = data.notes[slotKey] || [];
              
              // Status Styling
              const hyejeongClass = status.hyejeong 
                ? "bg-primary text-white border-transparent shadow-md shadow-blue-200" 
                : "bg-white text-gray-400 border-gray-200";
              
              const yebinClass = status.yebin 
                ? "bg-primary text-white border-transparent shadow-md shadow-blue-200" 
                : "bg-white text-gray-400 border-gray-200";

              return (
                <div key={slotKey} className="group relative bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  {/* Time & Admin Controls Row */}
                  <div className="flex items-start gap-4 mb-3">
                    <div className="flex flex-col items-center min-w-[3rem]">
                      <span className="text-xl font-bold text-gray-900 leading-none">{hour}:00</span>
                    </div>

                    <div className="flex-1 space-y-2">
                      {/* Presence Indicators */}
                      <div className="flex flex-wrap gap-2">
                        {/* Hyejeong Chip */}
                        <button 
                          disabled={!isAdmin}
                          onClick={() => togglePresence(slotKey, 'hyejeong')}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${hyejeongClass} ${isAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                        >
                          {status.hyejeong ? "혜정 상주!" : "혜정 없음"}
                        </button>

                        {/* Yebin Chip */}
                        <button 
                          disabled={!isAdmin}
                          onClick={() => togglePresence(slotKey, 'yebin')}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${yebinClass} ${isAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                        >
                          {status.yebin ? "예빈 상주!" : "예빈 없음"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Notes Area */}
                  <div className="pl-[3rem] space-y-2">
                     <div className="bg-gray-50 rounded-xl p-2 min-h-[50px] flex flex-wrap gap-2 content-center items-center">
                        {notes.length === 0 && (
                          <span className="text-xs text-gray-400 w-full text-center">방문 예정이 없습니다</span>
                        )}
                        {notes.map(note => (
                          <button
                            key={note.id}
                            onClick={() => openViewNoteModal(note)}
                            className="bg-white px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 shadow-sm border border-gray-100 hover:border-primary/50 transition-colors flex items-center gap-1"
                          >
                            <User size={10} className="text-primary" />
                            {note.name}
                          </button>
                        ))}
                        
                        {/* Add Button */}
                        <button 
                          onClick={() => openAddNoteModal(slotKey)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-dashed border-primary/40 text-primary hover:bg-primary hover:text-white transition-colors ml-auto"
                        >
                          <Plus size={14} />
                        </button>
                     </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Footer Info */}
          <div className="text-center py-8 text-gray-300 text-xs">
            Graduation Exhibition 2025<br/>
            Hyejeong & Yebin<br/>
            <div className={`flex items-center justify-center gap-1 mt-2 opacity-50 ${isOffline ? 'text-red-400' : ''}`}>
              {isOffline ? <WifiOff size={10} /> : <Cloud size={10} />}
              <span className="text-[10px]">
                {isOffline ? "Offline Mode" : "Server Connected"}
              </span>
            </div>
          </div>
        </main>

        {/* Modals Layer */}
        <AdminModal 
          isOpen={showAdminLogin} 
          onClose={() => setShowAdminLogin(false)}
          onLogin={handleAdminLoginSuccess}
        />

        <NoteModal
          isOpen={noteModalOpen}
          onClose={() => setNoteModalOpen(false)}
          onSubmit={handleAddNote}
          onUpdate={handleUpdateNote}
          onDelete={handleDeleteNote}
          selectedNote={selectedNote}
          hourLabel={selectedSlotKey ? selectedSlotKey.split('-')[3] : ''}
          isAdmin={isAdmin}
        />
        
        {/* Floating Admin Badge if active */}
        {isAdmin && (
          <div className="absolute bottom-6 right-6 bg-gray-900 text-white text-xs px-4 py-2 rounded-full shadow-lg z-30 pointer-events-none opacity-80">
            Admin Mode ON
          </div>
        )}

      </div>
    </div>
  );
};

export default App;
