
import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Trash2, Lock, User } from './Icons';
import { Note } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, content: string, password: string) => void;
  onUpdate: (noteId: string, name: string, content: string, password: string) => void;
  onDelete: (noteId: string) => void;
  selectedNote?: Note | null;
  hourLabel: string;
  isAdmin: boolean;
}

const NoteModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  onUpdate, 
  onDelete, 
  selectedNote, 
  hourLabel,
  isAdmin 
}) => {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // "isUnlocked" means the user has entered the correct password OR is admin
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (selectedNote) {
        // View/Edit Mode
        setName(selectedNote.name);
        // If admin, unlock immediately
        if (isAdmin) {
          setIsUnlocked(true);
          setContent(selectedNote.content);
        } else {
          setIsUnlocked(false);
          setContent(''); // Hide content initially
        }
        setPassword('');
      } else {
        // Create Mode
        setName('');
        setContent('');
        setPassword('');
        setIsUnlocked(true); // Always "unlocked" for creation
      }
      setError('');
    }
  }, [isOpen, selectedNote, isAdmin]);

  if (!isOpen) return null;

  // --- Handlers ---

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim() || !password.trim()) {
      setError('이름, 메시지, 비밀번호를 모두 입력해주세요.');
      return;
    }
    onSubmit(name, content, password);
    onClose();
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedNote && password === selectedNote.password) {
      setIsUnlocked(true);
      setContent(selectedNote.content); // Reveal content
      setError('');
    } else {
      setError('비밀번호가 일치하지 않습니다.');
    }
  };

  const handleUpdate = () => {
    if (!selectedNote) return;
    if (!name.trim() || !content.trim()) {
      setError('이름과 메시지를 입력해주세요.');
      return;
    }
    // Pass the original password to keep it, or current password if we wanted to change it (logic assumes keeping old pw for simplicity)
    onUpdate(selectedNote.id, name, content, selectedNote.password);
    onClose();
  };

  const handleDelete = () => {
    if (!selectedNote) return;
    onDelete(selectedNote.id);
    onClose();
  };

  // --- Render ---

  const isCreateMode = !selectedNote;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4 rounded-[2.5rem]">
      <div className="bg-white rounded-2xl w-full max-w-xs p-6 shadow-xl animate-[fadeIn_0.2s_ease-out]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare size={18} className="text-primary" />
            {isCreateMode ? `${hourLabel}시 방문 예약` : '예약 상세'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* 1. Create Mode */}
        {isCreateMode && (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-bold">이름 (공개)</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="방문자 성함"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-bold">메시지 (비공개)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="저희에게만 보이는 메시지입니다 :)"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-24 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-bold">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="수정/삭제용 비밀번호"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            
            <button
              type="submit"
              className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-primary/30"
            >
              등록하기
            </button>
          </form>
        )}

        {/* 2. View/Auth Mode (Locked) */}
        {!isCreateMode && !isUnlocked && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl text-center">
              <p className="text-lg font-bold text-gray-900 mb-1">{name}</p>
              <p className="text-xs text-gray-400">님의 방문 예약</p>
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 gap-2">
              <Lock size={24} />
              <p className="text-xs text-center">메시지는 작성자와 관리자만<br/>확인할 수 있습니다.</p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-2">
              <label className="block text-xs text-gray-500 text-center mb-1">비밀번호를 입력하여 확인/수정하기</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-center text-sm"
              />
              {error && <p className="text-red-500 text-xs text-center">{error}</p>}
              <button
                type="submit"
                className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors mt-2"
              >
                확인
              </button>
            </form>
          </div>
        )}

        {/* 3. Edit Mode (Unlocked) */}
        {!isCreateMode && isUnlocked && (
           <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-bold">이름 (수정 가능)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 font-bold">메시지 (확인 및 수정)</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-blue-50 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none h-32 text-sm text-gray-800"
              />
            </div>
            
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}

            <div className="flex gap-2 pt-2">
               <button
                onClick={handleDelete}
                className="flex-1 bg-red-50 text-red-500 border border-red-100 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-1 text-sm"
              >
                <Trash2 size={16} />
                삭제
              </button>
              <button
                onClick={handleUpdate}
                className="flex-[2] bg-primary text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-primary/30 text-sm"
              >
                수정 완료
              </button>
            </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default NoteModal;
