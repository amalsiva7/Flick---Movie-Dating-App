import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
 },
//  esbuild: {
//   loader: 'jsx',
//   include: /src\/.*\.js$/, // Treat .js files in src as JSX
// },
// esbuild: {
//   jsxFactory: 'React.createElement',
//   jsxFragment: 'React.Fragment',
// },
})
