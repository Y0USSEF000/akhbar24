import { DAY } from './config';

// How the app decides which news is important:
// 1) Words in the title (war, death, earthquake, president…). Each kind has a weight.
// 2) The same story on many different sites = big news.
// Score >= IMPORTANT_MIN goes to "Top stories". The rest is normal news, newest first.

export const IMPORTANT_MIN = 4;
export const MAX_TOP = 15;

export const CATEGORIES = [
  {
    id: 'war',
    weight: 5,
    color: '#B3122E',
    ar: ['حرب', 'قصف', 'غاره', 'غارات', 'صاروخ', 'صواريخ', 'هجوم', 'اشتباك', 'اجتياح', 'عدوان', 'قتلي', 'شهداء', 'شهيد', 'هدنه', 'وقف اطلاق النار', 'رهائن', 'اسري', 'معارك', 'توغل', 'جيش الاحتلال', 'عسكريه', 'مسيرات'],
    en: ['war', 'wars', 'missile', 'missiles', 'airstrike', 'airstrikes', 'strike', 'strikes', 'attack', 'attacks', 'bombing', 'bombs', 'shelling', 'invasion', 'troops', 'ceasefire', 'truce', 'hostage', 'hostages', 'military', 'drone', 'drones', 'clashes', 'gunfire', 'army', 'offensive'],
  },
  {
    id: 'death',
    weight: 4,
    color: '#1F2937',
    ar: ['وفاه', 'وفات', 'توفي', 'توفيت', 'رحيل', 'مقتل', 'مصرع', 'نعي', 'تنعي', 'ينعي', 'حتفه', 'حتفهم', 'اغتيال', 'اعدام', 'جثه', 'جثث', 'ضحايا', 'قتيل'],
    en: ['dies', 'died', 'dead', 'death', 'deaths', 'killed', 'killing', 'passed away', 'obituary', 'assassinated', 'assassination', 'executed', 'execution', 'funeral', 'victims', 'death toll'],
  },
  {
    id: 'disaster',
    weight: 5,
    color: '#C2410C',
    ar: ['زلزال', 'فيضان', 'فيضانات', 'حريق', 'حرائق', 'عاصفه', 'اعصار', 'انفجار', 'تحطم', 'انهيار', 'غرق', 'سيول', 'كارثه', 'بركان', 'وباء', 'تسونامي', 'هزه ارضيه'],
    en: ['earthquake', 'quake', 'flood', 'floods', 'wildfire', 'wildfires', 'fire', 'fires', 'blaze', 'storms', 'tropical storm', 'hurricane', 'typhoon', 'cyclone', 'explosion', 'blast', 'crash', 'collapse', 'collapsed', 'drowned', 'tsunami', 'volcano', 'outbreak', 'epidemic', 'pandemic', 'disaster'],
  },
  {
    id: 'breaking',
    weight: 3,
    color: '#D7263D',
    ar: ['عاجل', 'طارئ', 'طارئه', 'تحذير', 'انذار'],
    en: ['breaking', 'urgent', 'emergency', 'warning', 'alert'],
  },
  {
    id: 'famous',
    weight: 2,
    color: '#7C3AED',
    ar: ['الملك', 'ولي العهد', 'الرئيس', 'رئيس الوزراء', 'رئيس الحكومه', 'ترامب', 'بوتين', 'ماكرون', 'نتنياهو', 'زيلينسكي', 'البابا', 'ميسي', 'رونالدو', 'حكيمي', 'الركراكي', 'الفنان', 'الفنانه', 'النجم', 'النجمه'],
    en: ['king', 'crown prince', 'president', 'prime minister', 'trump', 'putin', 'macron', 'netanyahu', 'zelensky', 'pope', 'xi jinping', 'messi', 'ronaldo', 'hakimi', 'celebrity', 'singer', 'actor', 'actress', 'superstar'],
  },
];

// Arabic letters have many forms (أ إ آ ا, ة ه, ى ي) and optional marks. Make them all the same.
export function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const MATCHERS = CATEGORIES.map((c) => ({
  ...c,
  arWords: c.ar.map(normalize),
  enRegex: new RegExp(`\\b(${c.en.map(escape).join('|')})\\b`, 'i'),
}));

// Everyday expressions that use "war words" but are not about war or disasters.
const NOT_IMPORTANT = /\b(fires? up|fired up|under fire|personal attacks?|political attacks?|price war|trade war|war of words|culture war)\b/gi;

function categoriesIn(text) {
  const t = normalize(text).replace(NOT_IMPORTANT, ' ');
  return MATCHERS.filter((c) => c.enRegex.test(t) || c.arWords.some((w) => t.includes(w))).map((c) => c.id);
}

const WEIGHT = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.weight]));
const STOP = new Set(['that', 'with', 'from', 'after', 'over', 'into', 'this', 'what', 'says', 'will', 'have', 'been', 'their', 'about', 'more', 'than', 'they', 'were', 'when', 'which', 'الذي', 'التي', 'الذين', 'عن', 'علي', 'الي', 'بعد', 'قبل', 'خلال', 'بين', 'حول', 'منذ', 'هذا', 'هذه', 'ذلك', 'كان', 'كانت', 'يكون', 'تكون', 'مع', 'لدي', 'ضد']);

// Important words of a title, without "al-", "wa-", "bi-"… so different sites can be compared.
function keywords(title) {
  return new Set(
    normalize(title)
      .split(/[^0-9a-zء-ي]+/)
      .map((w) => w.replace(/^(وال|بال|كال|فال|لل|ال)/, ''))
      .filter((w) => w.length >= 4 && !STOP.has(w)),
  );
}

function sameStory(a, b) {
  let shared = 0;
  for (const w of a) if (b.has(w)) shared += 1;
  const jaccard = shared / (a.size + b.size - shared || 1);
  return shared >= 3 || (shared >= 2 && jaccard >= 0.3);
}

export function rankNews(items, now, period) {
  const words = items.map((it) => keywords(it.title));
  const related = items.map(() => []);
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      if (items[i].sourceId !== items[j].sourceId && sameStory(words[i], words[j])) {
        related[i].push(j);
        related[j].push(i);
      }
    }
  }

  const scored = items.map((it, i) => {
    const inTitle = categoriesIn(it.title);
    const inSummary = categoriesIn(it.summary).filter((c) => !inTitle.includes(c));
    const sources = new Set(related[i].map((j) => items[j].sourceId)).size;
    const score =
      inTitle.reduce((sum, c) => sum + WEIGHT[c], 0) +
      inSummary.reduce((sum, c) => sum + WEIGHT[c] / 2, 0) +
      Math.min(sources, 3) * 2;
    const tags = [...inTitle, ...inSummary].sort((a, b) => WEIGHT[b] - WEIGHT[a]).slice(0, 2);
    // In the Week view, older news slowly goes down so fresh big news stays on top.
    const rank = period === 'week' ? score - ((now - it.date) / DAY) * 0.7 : score;
    return { ...it, score, rank, tags, sources, index: i };
  });

  // Best stories first. When many sites tell the same story, keep only one card for it.
  const important = [];
  const taken = new Set();
  for (const it of scored.filter((x) => x.score >= IMPORTANT_MIN).sort((a, b) => b.rank - a.rank || b.date - a.date)) {
    if (taken.has(it.index)) continue;
    important.push(it);
    taken.add(it.index);
    related[it.index].forEach((j) => taken.add(j));
    if (important.length >= MAX_TOP) break;
  }

  // Other sites' copies of a top story are hidden too (the top card shows "+N sources").
  const normal = scored.filter((it) => !taken.has(it.index));
  return { important, normal };
}
