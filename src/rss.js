import { Platform } from 'react-native';
import { XMLParser } from 'fast-xml-parser';
import { WEB_PROXY } from './config';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: '#text',
  processEntities: true,
  htmlEntities: true,
  isArray: (name) => ['item', 'entry', 'media:content', 'media:thumbnail', 'enclosure', 'link'].includes(name),
});

const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

// RSS dates look like "Mon, 19 Oct 2026 09:23:21 +0000".
// We read them by hand because the phone's JavaScript engine does not always understand them.
export function parseDate(value) {
  if (!value) return null;
  const s = String(value).trim();
  const m = s.match(/(\d{1,2})\s+([A-Za-z]{3})[a-z]*\s+(\d{2,4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([+-]\d{4}|[A-Z]{1,4})?/);
  if (m) {
    let year = Number(m[3]);
    if (year < 100) year += 2000;
    const month = MONTHS[m[2].toLowerCase()];
    if (month !== undefined) {
      let ts = Date.UTC(year, month, Number(m[1]), Number(m[4]), Number(m[5]), Number(m[6] || 0));
      const zone = m[7];
      if (zone && /^[+-]\d{4}$/.test(zone)) {
        const sign = zone[0] === '+' ? 1 : -1;
        const mins = Number(zone.slice(1, 3)) * 60 + Number(zone.slice(3, 5));
        ts -= sign * mins * 60 * 1000;
      }
      return ts;
    }
  }
  const iso = Date.parse(s); // Atom / ISO dates: 2026-10-19T13:45:00+02:00
  return Number.isNaN(iso) ? null : iso;
}

function text(v) {
  if (v == null) return '';
  if (Array.isArray(v)) return text(v[0]);
  if (typeof v === 'object') return text(v['#text'] ?? v.href ?? '');
  return String(v);
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', laquo: '«', raquo: '»', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '—' };

function decode(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (all, name) => ENTITIES[name.toLowerCase()] ?? all);
}

function cleanText(html) {
  return decode(String(html || '').replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function findImage(node, html) {
  const lists = [node['media:content'], node['media:thumbnail'], node['media:group']?.['media:content'], node.enclosure];
  for (const list of lists) {
    for (const m of [].concat(list || [])) {
      const url = m?.url;
      const type = m?.type || m?.medium || 'image';
      if (url && /image|jpe?g|png|webp/i.test(type + url)) return url;
    }
  }
  const img = String(html || '').match(/<img[^>]+src=["']([^"']+)["']/i);
  return img ? decode(img[1]) : null;
}

function findLink(node) {
  for (const l of [].concat(node.link || [])) {
    if (typeof l === 'string' && l.trim()) return l.trim();
    if (l?.href && (!l.rel || l.rel === 'alternate')) return l.href;
  }
  return text(node.guid).startsWith('http') ? text(node.guid) : '';
}

export function parseFeed(xml, feed, fetchedAt) {
  const doc = parser.parse(xml);
  const nodes = doc?.rss?.channel?.item || doc?.feed?.entry || doc?.['rdf:RDF']?.item || [];
  return nodes
    .map((node) => {
      const html = text(node['content:encoded']) || text(node.description) || text(node.summary) || text(node.content);
      const link = findLink(node);
      return {
        id: `${feed.id}|${link || text(node.title)}`,
        sourceId: feed.id,
        title: cleanText(text(node.title)),
        summary: cleanText(html).slice(0, 220),
        link,
        image: findImage(node, html),
        date: parseDate(text(node.pubDate) || text(node.published) || text(node.updated) || text(node['dc:date'])) || fetchedAt,
      };
    })
    .filter((it) => it.title && it.link);
}

async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const target = Platform.OS === 'web' ? WEB_PROXY + encodeURIComponent(url) : url;
    const headers = Platform.OS === 'web' ? {} : { 'User-Agent': 'Mozilla/5.0 (Akhbar24 RSS reader)' };
    const res = await fetch(target, { signal: controller.signal, headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

// Downloads every feed at the same time. One broken site does not stop the others.
export async function fetchAllFeeds(feeds) {
  const fetchedAt = Date.now();
  const results = await Promise.allSettled(
    feeds.map(async (feed) => parseFeed(await fetchWithTimeout(feed.url, 20000), feed, fetchedAt)),
  );
  const items = [];
  const failed = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') items.push(...r.value);
    else failed.push(feeds[i].id);
  });
  return { items, failed };
}
