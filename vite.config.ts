import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// En production (GitHub Pages projet), l'app est servie sous /parc-numerique/.
// En développement on garde la racine pour un confort local.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/parc-numerique/' : '/',
  plugins: [react()],
  server: { port: 5173, open: true },
  // Three.js forme un gros chunk, chargé à la demande (vue 3D) : on relève le seuil d'alerte.
  build: { chunkSizeWarningLimit: 1200 },
}))
