import data from '../data/recipes.json';

// Данные из wiki_items.db (масторворк Lu4). items: {id:[name,grade]}; recipes: {productId:{q,s,m,g,t}}
export const ITEMS = data.items;
export const RECIPES = data.recipes;

const GRADE_ORDER = { NG: 0, D: 1, C: 2, B: 3, A: 4, S: 5 };
export const SELECTABLE_GRADES = ['NG', 'D', 'C', 'B', 'A']; // до A

export const itemName = (id) => (ITEMS[id] ? ITEMS[id][0] : `#${id}`);
export const itemGrade = (id) => (ITEMS[id] ? ITEMS[id][1] : 'NG');
export const hasRecipe = (id) => !!RECIPES[id];

// Разворачивает продукт до базовых ресурсов (листьев без рецепта). Возвращает {itemId: qty}.
export const flattenBase = (pid, count = 1) => {
  const out = {};
  const visit = (id, cnt, path) => {
    const rec = RECIPES[id];
    if (!rec || path.has(String(id))) { out[id] = (out[id] || 0) + cnt; return; }
    path.add(String(id));
    const crafts = cnt / (rec.q || 1);
    for (const [mid, mq] of rec.m) visit(mid, mq * crafts, path);
    path.delete(String(id));
  };
  visit(pid, count, new Set());
  return out;
};

// Дерево материалов (для наглядности). depth-guard от циклов.
export const buildTree = (pid, count = 1, path = new Set(), depth = 0) => {
  const rec = RECIPES[pid];
  const node = { id: pid, name: itemName(pid), grade: itemGrade(pid), count, crafted: !!rec };
  if (rec && !path.has(String(pid)) && depth < 8) {
    const next = new Set(path); next.add(String(pid));
    const crafts = count / (rec.q || 1);
    node.children = rec.m.map(([mid, mq]) => buildTree(mid, mq * crafts, next, depth + 1));
  }
  return node;
};

export const totalCost = (pid, count, prices) => {
  const base = flattenBase(pid, count);
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
