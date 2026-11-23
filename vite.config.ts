import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Default Vite meng-inline aset < 4 KB sebagai base64 ke dalam JS. Untuk sprite itu
    // merugikan: 27 sprite kecil = 75 KB base64 di bundle utama (ikut di-parse sebelum
    // render, tidak bisa di-cache terpisah, tidak bisa lazy). Gambar selalu jadi file.
    assetsInlineLimit: (file) => (/\.(webp|png|jpe?g|gif|avif)$/i.test(file) ? false : undefined),
  },
  server: {
    port: 5173,
    host: true,
    //bisa npm run dev -- --host
  },
});
