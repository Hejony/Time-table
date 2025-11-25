import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 개발 서버에서의 경로 문제를 방지하기 위해 base 설정을 기본값(/)으로 유지
});