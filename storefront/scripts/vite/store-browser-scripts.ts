import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {transformWithEsbuild, type Plugin} from 'vite';

const bundles: Record<string, string[]> = {
  'virtual:storefront-script': [
    'content.js', 'offers-state.js', 'app.js', 'experience.js', 'checkout.js',
    'offers.js', 'customer-account.js', 'product-gallery.js', 'product-page.js',
  ],
  'virtual:store-admin-script': ['admin-gallery.js', 'admin.js', 'admin-reviews.js'],
};

export function storeBrowserScripts(): Plugin {
  return {
    name: 'store-browser-scripts',
    resolveId(id) {
      if (Object.hasOwn(bundles, id)) return '\0' + id;
    },
    async load(id) {
      if (!id.startsWith('\0')) return;
      const name = id.slice(1);
      if (!Object.hasOwn(bundles, name)) return;
      const files = bundles[name];
      const sources = await Promise.all(files.map(async file => {
        const filename = fileURLToPath(new URL('../../client/' + file, import.meta.url));
        this.addWatchFile(filename);
        return readFile(filename, 'utf8');
      }));
      const {code} = await transformWithEsbuild(`(() => {\n${sources.join('\n;\n')}\n})();`, 'store.js', {
        loader: 'js', minify: true, sourcemap: false, legalComments: 'none',
      });
      return `export default ${JSON.stringify(code)};`;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        let pathname: string;
        let url: URL;
        try {
          url = new URL(req.url || '/', 'http://localhost');
          pathname = decodeURIComponent(url.pathname).replaceAll('\\', '/').toLowerCase();
        } catch {
          res.writeHead(400).end();
          return;
        }
        const privatePath = /^\/+((?:@fs|@id|@vite|app|client|components|data|db|drizzle|hooks|lib|worker|scripts|node_modules|dist|docs|tests|examples|logs|vendor|public)(?:\/|$)|(?:phone-link\.txt|package(?:-lock)?\.json|tsconfig\.json)$)/.test(pathname);
        const editorialSource = pathname.startsWith('/editorial/') && !['/editorial/hero.js', '/editorial/hero.css'].includes(pathname);
        const privateFile = /(?:^|\/)\.[^/]+|\.(?:ts|tsx|mjs|cjs|map|md|sql|sqlite|sqlite3|pem|key|p12|pfx)$/.test(pathname);
        if (privatePath || privateFile || editorialSource || url.searchParams.has('raw') || url.searchParams.has('import')) {
          res.writeHead(404, {'Cache-Control': 'no-store'}).end('Not found');
          return;
        }
        next();
      });
    },
  };
}
