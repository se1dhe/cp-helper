import data from '../data/recipes.json';

// Данные из wiki_items.db (масторворк Lu4). items: {id:[name,grade,icon?]}; recipes: {productId:{q,s,m,g,t}}
export const ITEMS = data.items;
export const RECIPES = data.recipes;

const GRADE_ORDER = { NG: 0, D: 1, C: 2, B: 3, A: 4, S: 5 };
export const SELECTABLE_GRADES = ['NG', 'D', 'C', 'B', 'A']; // до A
const ICON_BASE = 'https://masterwork.wiki/i64/';

export const itemName = (id) => (ITEMS[id] ? ITEMS[id][0] : `#${id}`);
export const itemGrade = (id) => (ITEMS[id] ? ITEMS[id][1] : 'NG');
export const itemIcon = (id) => { const it = ITEMS[id]; return (it && it[2]) ? ICON_BASE + it[2] + '.png' : null; };
export const hasRecipe = (id) => !!RECIPES[id];
export const itemStats = (id) => (RECIPES[id] && RECIPES[id].st) ? RECIPES[id].st : null;
// Живая страница предмета на вики со спойлом, отсортированным по уровню моба.
export const wikiUrl = (id) => `https://masterwork.wiki/lu4/item/${id}?spoilSort=npc_level`;

// Разворачивает продукт до базовых ресурсов. buy — Set id, которые считаем «покупными» (не разворачиваем).
export const flattenBase = (pid, count = 1, buy = null) => {
  const out = {};
  const visit = (id, cnt, path) => {
    const rec = RECIPES[id];
    const isBuy = buy && buy.has(String(id));
    if (!rec || isBuy || path.has(String(id))) { out[id] = (out[id] || 0) + cnt; return; }
    path.add(String(id));
    const crafts = cnt / (rec.q || 1);
    for (const [mid, mq] of rec.m) visit(mid, mq * crafts, path);
    path.delete(String(id));
  };
  visit(pid, count, new Set());
  return out;
};

// Дерево материалов. buy — Set покупных id (не разворачиваем). depth-guard от циклов.
export const buildTree = (pid, count = 1, buy = null, path = new Set(), depth = 0) => {
  const rec = RECIPES[pid];
  const node = { id: pid, name: itemName(pid), grade: itemGrade(pid), count, crafted: !!rec };
  const isBuy = buy && buy.has(String(pid));
  if (rec && !isBuy && !path.has(String(pid)) && depth < 8) {
    const next = new Set(path); next.add(String(pid));
    const crafts = count / (rec.q || 1);
    node.children = rec.m.map(([mid, mq]) => buildTree(mid, mq * crafts, buy, next, depth + 1));
  }
  return node;
};

export const totalCost = (pid, count, prices, buy) => {
  const base = flattenBase(pid, count, buy);
  let sum = 0;
  for (const id in base) sum += base[id] * (Number(prices[id]) || 0);
  return sum;
};

// Список крафтабельных продуктов до A-грейда с фильтрами.
export const listProducts = ({ grade = 'all', type = 'all', q = '' } = {}) => {
  const query = q.trim().toLowerCase();
  const res = [];
  for (const id in RECIPES) {
    const r = RECIPES[id];
    if (!SELECTABLE_GRADES.includes(r.g)) continue;
    if (grade !== 'all' && r.g !== grade) continue;
    if (type !== 'all' && r.t !== type) continue;
    const name = itemName(id);
    if (query && !name.toLowerCase().includes(query)) continue;
    res.push({ id, name, grade: r.g, type: r.t, sr: r.s, out: r.q });
  }
  res.sort((a, b) => (GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade]) || a.name.localeCompare(b.name));
  return res;
};

export const PRODUCT_TYPES = ['Weapon', 'Armor', 'Accessory', 'Other'];

// Поиск по ВСЕМ предметам (включая ресурсы/базовые мат.) — для личных закладок.
export const searchItems = (q = '', limit = 20) => {
  const query = q.trim().toLowerCase();
  if (query.length < 2) return [];
  const res = [];
  for (const id in ITEMS) {
    const name = ITEMS[id][0];
    if (name && name.toLowerCase().includes(query)) res.push({ id, name, grade: ITEMS[id][1] || 'NG' });
  }
  res.sort((a, b) => (GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade]) || a.name.localeCompare(b.name));
  return res.slice(0, limit);
};
