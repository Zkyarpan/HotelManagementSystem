import path from "path"
import tailwindcss from "tailwindcss"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    {
      name: 'tailwindcss',
      plugins: [tailwindcss()]
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})