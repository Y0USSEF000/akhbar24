import { DAY, HOUR, MINUTE } from './config';

export const STRINGS = {
  ar: {
    appName: 'أخبار',
    tagline: 'كل جديد في مكان واحد',
    today: 'اليوم',
    week: 'الأسبوع',
    menu: 'القائمة',
    all: 'الكل',
    morocco: 'المغرب',
    world: 'العالم',
    todayTitle: 'آخر 24 ساعة',
    weekTitle: 'آخر 7 أيام',
    count: (n) => `${n} خبر`,
    updated: 'آخر تحديث',
    nextUpdate: 'التحديث القادم بعد',
    refreshNow: 'حدّث الآن',
    refreshing: 'جاري التحديث…',
    loading: 'جاري جلب الأخبار…',
    empty: 'لا توجد أخبار هنا حالياً',
    emptyHint: 'جرّب «الأسبوع» أو فعّل مصادر أخرى من القائمة',
    offline: 'تعذّر الاتصال بالإنترنت. نعرض آخر أخبار محفوظة.',
    someFailed: (n) => `تعذّر تحميل ${n} من المصادر`,
    sources: 'المصادر',
    language: 'اللغة',
    show: 'عرض',
    autoRefresh: 'التحديث التلقائي',
    autoRefreshText:
      'كل 24 ساعة يقوم التطبيق بجلب كل الأخبار من جديد. يمكنك أيضاً السحب للأسفل أو الضغط على زر التحديث.',
    about: 'حول التطبيق',
    aboutText: 'يجمع هذا التطبيق الأخبار من مواقع إخبارية عبر بروتوكول RSS، ويحتفظ بأخبار آخر 7 أيام.',
    never: 'لم يتم بعد',
    footer: 'أخبار 24 · عبر RSS',
    latest: 'الأحدث',
    topStories: 'أهم الأخبار',
    topHint: 'حروب، وفيات، كوارث، شخصيات معروفة، وأخبار تنشرها عدة مواقع',
    otherNews: 'باقي الأخبار',
    moreSources: (n) => `+${n} ${n === 1 ? 'مصدر' : n === 2 ? 'مصدران' : 'مصادر'}`,
    tags: { war: 'حرب', death: 'وفاة', disaster: 'كارثة', breaking: 'عاجل', famous: 'شخصيات' },
  },
  en: {
    appName: 'Akhbar',
    tagline: 'All the news in one place',
    today: 'Today',
    week: 'Week',
    menu: 'Menu',
    all: 'All',
    morocco: 'Morocco',
    world: 'World',
    todayTitle: 'Last 24 hours',
    weekTitle: 'Last 7 days',
    count: (n) => `${n} ${n === 1 ? 'story' : 'stories'}`,
    updated: 'Last update',
    nextUpdate: 'Next update in',
    refreshNow: 'Refresh now',
    refreshing: 'Refreshing…',
    loading: 'Loading the news…',
    empty: 'No news here right now',
    emptyHint: 'Try “Week” or turn on more sources in the menu',
    offline: 'No internet connection. Showing the last saved news.',
    someFailed: (n) => `${n} source${n === 1 ? '' : 's'} could not load`,
    sources: 'Sources',
    language: 'Language',
    show: 'Show',
    autoRefresh: 'Auto refresh',
    autoRefreshText:
      'Every 24 hours the app downloads all the news again. You can also pull down or tap the refresh button.',
    about: 'About',
    aboutText: 'This app collects news from news websites with the RSS protocol, and keeps the last 7 days.',
    never: 'Not yet',
    footer: 'Akhbar 24 · via RSS',
    latest: 'Latest',
    topStories: 'Top stories',
    topHint: 'Wars, deaths, disasters, famous people, and news many sites are reporting',
    otherNews: 'Other news',
    moreSources: (n) => `+${n} source${n === 1 ? '' : 's'}`,
    tags: { war: 'War', death: 'Death', disaster: 'Disaster', breaking: 'Breaking', famous: 'Famous' },
  },
};

const AR_DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
// Month names as used in Morocco.
const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'];
const EN_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const EN_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function formatToday(ts, lang) {
  const d = new Date(ts);
  if (lang === 'ar') return `${AR_DAYS[d.getDay()]} ${d.getDate()} ${AR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  return `${EN_DAYS[d.getDay()]}, ${d.getDate()} ${EN_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const pad = (n) => String(n).padStart(2, '0');

export function formatClock(ts) {
  const d = new Date(ts);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Arabic counting words: 1, 2, 3-10, 11+
function arCount(n, one, two, few, many) {
  if (n === 1) return one;
  if (n === 2) return two;
  if (n <= 10) return `${n} ${few}`;
  return `${n} ${many}`;
}

export function timeAgo(ts, now, lang) {
  const diff = Math.max(0, now - ts);
  const m = Math.floor(diff / MINUTE);
  const h = Math.floor(diff / HOUR);
  const d = Math.floor(diff / DAY);
  if (lang === 'ar') {
    if (m < 1) return 'الآن';
    if (h < 1) return `منذ ${arCount(m, 'دقيقة', 'دقيقتين', 'دقائق', 'دقيقة')}`;
    if (d < 1) return `منذ ${arCount(h, 'ساعة', 'ساعتين', 'ساعات', 'ساعة')}`;
    return `منذ ${arCount(d, 'يوم', 'يومين', 'أيام', 'يوماً')}`;
  }
  if (m < 1) return 'just now';
  if (h < 1) return `${m} min ago`;
  if (d < 1) return `${h}h ago`;
  return d === 1 ? 'yesterday' : `${d} days ago`;
}

export function formatDuration(ms, lang) {
  const total = Math.max(0, Math.floor(ms / MINUTE));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (lang === 'ar') return h > 0 ? `${h} س ${m} د` : `${m} د`;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
