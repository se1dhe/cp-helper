import QUEST_DETAILS from './questDetails.json';

const parseSortLevel = (lvl) => {
  const match = String(lvl ?? '').match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 999;
};

const sortByLevel = (arr) =>
  [...arr].sort((a, b) => parseSortLevel(a.lvl) - parseSortLevel(b.lvl));

export const getRaceForClass = (questData, className) => {
  if (!questData?.classToRace) return null;
  return questData.classToRace[className] || null;
};

export const getUniversalQuests = (questData) => {
  if (!questData?.universal) return [];
  return sortByLevel(questData.universal);
};

export const getRaceQuestsForClass = (questData, className) => {
  const race = getRaceForClass(questData, className);
  if (!race || !questData?.race?.[race]) return [];
  return sortByLevel(questData.race[race].quests || []);
};

export const getRaceLabel = (questData, className) => {
  const race = getRaceForClass(questData, className);
  if (!race || !questData?.race?.[race]) return null;
  return questData.race[race].label || null;
};

// Верхняя граница диапазона уровней квеста ('15–21' -> 21). Нет чисел -> 999 (не прячем).
export const questMaxLevel = (lvl) => {
  const nums = String(lvl ?? '').match(/\d+/g);
  return nums && nums.length ? parseInt(nums[nums.length - 1], 10) : 999;
};

// Скрываем квест у мембера, если он выполнен И мембер перерос верхнюю границу уровня.
export const isQuestHiddenForMember = (quest, memberLevel, done) =>
  done === true && (Number(memberLevel) || 1) > questMaxLevel(quest?.lvl);

// Ссылка на прохождение: поиск по базе знаний Lu4 (masterwork.wiki) с фильтром «Quests»
// по англ. названию. Открывает страницу результатов поиска вики, оттуда — на страницу квеста.
// Формат: /lu4/search/result?Search[query]=<name>&Search[search_type]=4
// (search_type=4 = вкладка «Quests» сразу активна; пробелы кодируются как '+').
export const questWikiUrl = (name) => {
  const query = encodeURIComponent(name || '').replace(/%20/g, '+');
  return `https://masterwork.wiki/lu4/search/result?Search%5Bquery%5D=${query}&Search%5Bsearch_type%5D=4`;
};

// Полное прохождение квеста, спарсенное с masterwork.wiki (см. src/data/questDetails.json).
// Возвращает объект { name, level, url, intro, startNpc, rewards[], steps[] } или null.
export const getQuestDetails = (name) => QUEST_DETAILS[name] || null;

// Абсолютная ссылка на страницу вики из относительного href ('/lu4/quest/...').
export const wikiAbsUrl = (href) =>
  href ? `https://masterwork.wiki${href}` : null;
