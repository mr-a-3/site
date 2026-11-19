import {build} from 'vite';
await build({configFile:new URL('../vite.hero.config.ts',import.meta.url).pathname.replace(/^\/(?=[A-Za-z]:)/,'')});
