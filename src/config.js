// All the news sites the app reads (RSS feeds).
// lang = which app language shows this source, region = Morocco or World.
export const FEEDS = [
  // Arabic
  { id: 'hespress-ar', name: 'هسبريس', lang: 'ar', region: 'morocco', color: '#0B7A3B', url: 'https://www.hespress.com/feed' },
  { id: 'alyaoum24', name: 'اليوم 24', lang: 'ar', region: 'morocco', color: '#C0392B', url: 'https://www.alyaoum24.com/feed' },
  { id: 'aljazeera-ar', name: 'الجزيرة', lang: 'ar', region: 'world', color: '#C8932B', url: 'https://www.aljazeera.net/rss' },
  { id: 'bbc-ar', name: 'بي بي سي عربي', lang: 'ar', region: 'world', color: '#B80000', url: 'https://feeds.bbci.co.uk/arabic/rss.xml' },
  { id: 'france24-ar', name: 'فرانس 24', lang: 'ar', region: 'world', color: '#1D4E89', url: 'https://www.france24.com/ar/rss' },
  { id: 'skynews-ar', name: 'سكاي نيوز عربية', lang: 'ar', region: 'world', color: '#0A5BA8', url: 'https://www.skynewsarabia.com/rss' },
  { id: 'cnn-ar', name: 'CNN بالعربية', lang: 'ar', region: 'world', color: '#CC0000', url: 'https://arabic.cnn.com/rss' },
  // English
  { id: 'hespress-en', name: 'Hespress English', lang: 'en', region: 'morocco', color: '#0B7A3B', url: 'https://en.hespress.com/feed' },
  { id: 'aljazeera-en', name: 'Al Jazeera', lang: 'en', region: 'world', color: '#C8932B', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { id: 'bbc-en', name: 'BBC World', lang: 'en', region: 'world', color: '#B80000', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { id: 'france24-en', name: 'France 24', lang: 'en', region: 'world', color: '#1D4E89', url: 'https://www.france24.com/en/rss' },
];

export const MINUTE = 60 * 1000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;

// After this time, the app throws away the old download and gets all the news again.
export const REFRESH_EVERY = DAY;
// If a refresh fails (no internet), wait this long before trying again.
export const RETRY_AFTER = 5 * MINUTE;

// On web, the browser blocks reading other sites (CORS), so we go through
// the small local proxy in proxy.js. On the phone this is not needed.
export const WEB_PROXY = 'http://localhost:8092/?url=';
