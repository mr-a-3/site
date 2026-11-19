import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig({plugins:[react()],publicDir:false,define:{'process.env.NODE_ENV':JSON.stringify('production')},build:{outDir:'public/editorial',emptyOutDir:true,lib:{entry:fileURLToPath(new URL('./editorial/entry.tsx',import.meta.url)),formats:['es'],fileName:()=> 'hero.js',cssFileName:'hero'},minify:true,cssCodeSplit:false,sourcemap:false}});
