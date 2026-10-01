// Cria (ou atualiza) no Prismic os custom types de prismic/customtypes.
// Uso: PRISMIC_REPO=meu-repo PRISMIC_WRITE_TOKEN=xxx npm run prismic:push
// Token: Prismic > Settings > API & Security > Write APIs > Custom Types API.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = 'prismic/customtypes';
const API = 'https://customtypes.prismic.io/customtypes';

const repo = process.env.PRISMIC_REPO;
const token = process.env.PRISMIC_WRITE_TOKEN;
if (!repo || !token) {
  console.error('Defina PRISMIC_REPO e PRISMIC_WRITE_TOKEN.');
  process.exit(1);
}

const headers = { repository: repo, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

const res = await fetch(API, { headers });
if (!res.ok) {
  console.error(`Não consegui ler os tipos do repositório "${repo}": ${res.status} ${await res.text()}`);
  process.exit(1);
}
const existing = new Set((await res.json()).map((t) => t.id));

// category antes de product, porque product aponta para ela.
const order = (id) => (id === 'category' ? 0 : 1);
const ids = readdirSync(DIR).sort((a, b) => order(a) - order(b));

let failed = false;
for (const id of ids) {
  const model = JSON.parse(readFileSync(join(DIR, id, 'index.json'), 'utf8'));
  const action = existing.has(model.id) ? 'update' : 'insert';
  const r = await fetch(`${API}/${action}`, { method: 'POST', headers, body: JSON.stringify(model) });
  if (r.ok) {
    console.log(`✓ ${model.id} (${action === 'insert' ? 'criado' : 'atualizado'})`);
  } else {
    failed = true;
    console.error(`✗ ${model.id}: ${r.status} ${await r.text()}`);
  }
}
process.exit(failed ? 1 : 0);
