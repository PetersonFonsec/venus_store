// Baixa do Prismic o conteúdo do site (vendedora, categorias e produtos) antes do build.
// Uso: PRISMIC_REPO=kntukai1 node scripts/prismic-fetch-content.mjs
// Opcional: PRISMIC_ACCESS_TOKEN, se a Content API do repositório for privada.
//
// Sem PRISMIC_REPO (CI, dev local), ou com o Prismic ainda sem vendedora ou produtos,
// grava `null` e o site usa o catalog.mock.ts. Se o PRISMIC_REPO estiver definido e a
// API falhar, o build falha, para nunca publicar o mock no lugar do conteúdo real.
import { writeFileSync } from 'node:fs';

const OUT = 'src/app/core/data/catalog.content.json';

const repo = process.env.PRISMIC_REPO;
const token = process.env.PRISMIC_ACCESS_TOKEN;

const save = (content) => writeFileSync(OUT, JSON.stringify(content, null, 2) + '\n');

if (!repo) {
  save(null);
  console.log('PRISMIC_REPO não definido: usando o conteúdo de exemplo (catalog.mock.ts).');
  process.exit(0);
}

const API = `https://${repo}.cdn.prismic.io/api/v2`;

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} em ${url.replace(/access_token=[^&]+/, 'access_token=***')}: ${await res.text()}`);
  return res.json();
}

async function all(type, ref) {
  const docs = [];
  for (let page = 1; ; page++) {
    const params = new URLSearchParams({ ref, q: `[[at(document.type,"${type}")]]`, pageSize: '100', page: String(page) });
    if (token) params.set('access_token', token);
    const res = await get(`${API}/documents/search?${params}`);
    docs.push(...res.results);
    if (page >= res.total_pages) return docs;
  }
}

/** Rich text do Prismic → lista de parágrafos (texto puro). */
const paragraphs = (rt) => (rt ?? []).map((b) => b.text?.trim()).filter(Boolean);
const text = (rt) => paragraphs(rt).join('\n\n');
const list = (s) => (s ?? '').split(',').map((x) => x.trim()).filter(Boolean);
const num = (n) => (typeof n === 'number' ? n : undefined);
const str = (s) => (s ?? '').trim();

function mapSeller(d) {
  return {
    name: str(d.name),
    role: str(d.role),
    city: str(d.city),
    whatsapp: str(d.whatsapp).replace(/\D/g, ''),
    instagram: str(d.instagram).replace(/^@/, ''),
    since: num(d.since) ?? new Date().getFullYear(),
    photo: d.photo?.url || undefined,
    bio: paragraphs(d.bio),
    stats: (d.stats ?? [])
      .filter((s) => num(s.value) !== undefined && str(s.label))
      .map((s) => ({ value: s.value, suffix: str(s.suffix) || undefined, label: str(s.label) })),
    values: (d.values ?? []).filter((v) => str(v.title)).map((v) => ({ title: str(v.title), text: str(v.text) })),
  };
}

function mapProduct(doc) {
  const d = doc.data;
  const notes = { top: list(d.notes_top), heart: list(d.notes_heart), base: list(d.notes_base) };
  return {
    slug: doc.uid,
    name: str(d.name),
    line: str(d.line),
    category: d.category?.uid ?? '',
    size: str(d.size),
    price: num(d.price) ?? 0,
    promoPrice: num(d.promo_price),
    stock: num(d.stock) ?? 0,
    description: text(d.description),
    howToUse: text(d.how_to_use),
    notes: notes.top.length + notes.heart.length + notes.base.length ? notes : undefined,
    review: {
      text: text(d.review_text),
      rating: Number(d.rating) || 5,
      bestFor: str(d.best_for),
      highlights: (d.highlights ?? []).map((h) => str(h.highlight)).filter(Boolean),
      tip: str(d.tip) || undefined,
    },
    featured: d.featured || undefined,
    image: d.image?.url || undefined,
    art: { kind: d.art_kind || 'perfume', tone: d.art_tone || 'cobalt' },
  };
}

try {
  const params = new URLSearchParams(token ? { access_token: token } : {});
  const { refs } = await get(`${API}?${params}`);
  const ref = refs.find((r) => r.isMasterRef).ref;

  const [sellers, categories, products] = await Promise.all([all('seller', ref), all('category', ref), all('product', ref)]);

  if (!sellers.length || !products.length) {
    save(null);
    console.warn(`⚠ Prismic "${repo}" ainda sem vendedora ou produtos publicados: usando o conteúdo de exemplo.`);
    process.exit(0);
  }

  const content = {
    seller: mapSeller(sellers[0].data),
    categories: categories
      .sort((a, b) => (num(a.data.order) ?? 99) - (num(b.data.order) ?? 99))
      .map((c) => ({ id: c.uid, label: str(c.data.label) || c.uid })),
    products: products.map(mapProduct).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')),
  };

  const orphans = content.products.filter((p) => !content.categories.some((c) => c.id === p.category));
  if (orphans.length) console.warn(`⚠ Produtos sem categoria válida: ${orphans.map((p) => p.slug).join(', ')}`);

  save(content);
  console.log(`✓ Prismic "${repo}": ${content.products.length} produtos, ${content.categories.length} categorias.`);
} catch (err) {
  console.error(`✗ Não consegui ler o Prismic "${repo}": ${err.message}`);
  process.exit(1);
}
