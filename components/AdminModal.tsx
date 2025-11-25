import React, { useState } from 'react';
import { X, Lock } from './Icons';
import { ADMIN_PASSWORD } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const AdminModal: React.FC<Props> = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onLogin();
      onClose();
      setPassword('');
      setError('');
    } else {
      setError('비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-4 rounded-[2.5rem]">
      <div className="bg-white rounded-2xl w-full max-w-xs p-6 shadow-xl animate-[fadeIn_0.2s_ease-out]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Lock size={18} className="text-primary" />
            관리자 로그인
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 text-center"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
          </div>
          
          <button
            type="submit"
            className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            확인
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminModal;