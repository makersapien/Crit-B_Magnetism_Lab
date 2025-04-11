import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Replace with your repo name
const repoName = 'Crit-B_Magnetism_Lab';


export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Crit-B_Magnetism_Lab/' : '/',
  plugins: [react()]
});
