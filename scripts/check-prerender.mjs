// Confere se o build estático gerou todas as páginas esperadas.
// Uso: node scripts/check-prerender.mjs (depois de `npm run build`)
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist/venus-store';
const BROWSER = join(DIST, 'browser');
const STATIC_ROUTES = ['/', '/produtos', '/sobre'];

// Com o Prismic, os slugs passam a vir da API e esta leitura precisa mudar.
const catalog = readFileSync('src/app/core/data/catalog.mock.ts', 'utf8');
const slugs = [...catalog.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);

const errors = [];
const fail = (msg) => errors.push(msg);

if (slugs.length === 0) fail('Nenhum slug encontrado em catalog.mock.ts');

const manifestPath = join(DIST, 'prerendered-routes.json');
const prerendered = existsSync(manifestPath)
  ? Object.keys(JSON.parse(readFileSync(manifestPath, 'utf8')).routes)
  : (fail(`${manifestPath} não existe`), []);

const homeTitle = readTitle(join(BROWSER, 'index.html'));
const expected = [...STATIC_ROUTES, ...slugs.map((s) => `/produtos/${s}`)];

for (const route of expected) {
  if (!prerendered.includes(route)) fail(`${route}: fora do prerendered-routes.json`);

  const file = join(BROWSER, route, 'index.html');
  if (!existsSync(file)) {
    fail(`${route}: ${file} não existe`);
    continue;
  }

  const html = readFileSync(file, 'utf8');
  if (!html.includes('ng-server-context')) fail(`${route}: HTML não foi renderizado no servidor`);

  const title = readTitle(file);
  if (!title) fail(`${route}: <title> vazio`);
  if (route.startsWith('/produtos/') && title === homeTitle) {
    fail(`${route}: <title> igual ao da home (produto não encontrado?)`);
  }
}

if (!existsSync(join(BROWSER, 'ngsw.json'))) fail('ngsw.json (service worker) não foi gerado');

if (errors.length) {
  console.error(`✗ ${errors.length} problema(s) no pré-render:\n  - ${errors.join('\n  - ')}`);
  process.exit(1);
}
console.log(`✓ ${expected.length} rotas pré-renderizadas (${slugs.length} produtos) + service worker`);

function readTitle(file) {
  return readFileSync(file, 'utf8').match(/<title>([^<]*)<\/title>/)?.[1].trim() ?? '';
}
