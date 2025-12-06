import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    root:"./frontend",
  plugins: [react()],
  server: {
    host: true, // слушать все IP
    port: 3000, // можно изменить порт
  },
});
