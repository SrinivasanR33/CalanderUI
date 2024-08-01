import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    port:8000,
    proxy:{
      "/api":{
        target:'http://52.35.66.255:8000',
        changeOrigin:true,
        rewrite:(path)=>path.replace(/^\/api/,"/api")
      }
    }
  }
})
