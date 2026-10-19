import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Cairo_400Regular, Cairo_600SemiBold, Cairo_700Bold, Cairo_800ExtraBold } from '@expo-google-fonts/cairo';

import Header from './src/components/Header';
import RegionChips from './src/components/RegionChips';
import NewsCard, { HeroCard } from './src/components/NewsCard';
import Footer from './src/components/Footer';
import MenuDrawer from './src/components/MenuDrawer';
import T from './src/components/T';
import { useNews } from './src/useNews';
import { useSettings } from './src/useSettings';
import { STRINGS } from './src/i18n';
import { rankNews } from './src/importance';
import { DAY, FEEDS, WEEK } from './src/config';
import { colors } from './src/theme';

const SOURCES = Object.fromEntries(FEEDS.map((f) => [f.id, f]));

function NewsScreen() {
  const { settings, update, toggleSource } = useSettings();
  const news = useNews();
  const [period, setPeriod] = useState('today'); // 'today' = last 24h, 'week' = last 7 days
  const [region, setRegion] = useState('all');
  const [menuOpen, setMenuOpen] = useState(false);

  const lang = settings.lang;
  const rtl = lang === 'ar';
  const s = STRINGS[lang];

  const visible = useMemo(() => {
    const window = period === 'today' ? DAY : WEEK;
    return news.items.filter((it) => {
      const src = SOURCES[it.sourceId];
      return (
        src &&
        src.lang === lang &&
        !settings.hidden.includes(src.id) &&
        (region === 'all' || src.region === region) &&
        news.now - it.date < window
      );
    });
  }, [news.items, news.now, lang, settings.hidden, region, period]);

  // Important news first (top stories), then the normal news, newest first.
  const rows = useMemo(() => {
    const { important, normal } = rankNews(visible, news.now, period);
    const list = [];
    if (important.length) {
      list.push({ type: 'section', key: 'top', top: true, count: important.length });
      important.forEach((item, i) => list.push({ type: i === 0 ? 'hero' : 'card', key: item.id, item, top: true }));
    }
    if (normal.length) {
      list.push({ type: 'section', key: 'other', top: false, count: normal.length });
      normal.forEach((item, i) => list.push({ type: !important.length && i === 0 ? 'hero' : 'card', key: item.id, item }));
    }
    return list;
  }, [visible, news.now, period]);

  const failedHere = news.failed.filter((id) => SOURCES[id]?.lang === lang).length;
  const row = { flexDirection: rtl ? 'row-reverse' : 'row' };

  const listHeader = (
    <View>
      {news.offline ? (
        <View style={[styles.banner, row]}>
          <Ionicons name="cloud-offline-outline" size={16} color={colors.accent} />
          <T rtl={rtl} weight="semibold" style={styles.bannerText}>{s.offline}</T>
        </View>
      ) : failedHere > 0 ? (
        <View style={[styles.banner, styles.bannerSoft, row]}>
          <Ionicons name="alert-circle-outline" size={16} color={colors.muted} />
          <T rtl={rtl} style={[styles.bannerText, { color: colors.muted }]}>{s.someFailed(failedHere)}</T>
        </View>
      ) : null}

      <View style={[styles.sectionHead, row]}>
        <View style={[row, { alignItems: 'center', gap: 8 }]}>
          <View style={styles.sectionBar} />
          <T rtl={rtl} weight="black" style={styles.sectionTitle}>{period === 'today' ? s.todayTitle : s.weekTitle}</T>
        </View>
        <View style={styles.countPill}>
          <T weight="bold" style={styles.countText}>{s.count(visible.length)}</T>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />

      <Header
        s={s}
        lang={lang}
        rtl={rtl}
        now={news.now}
        refreshing={news.refreshing}
        onMenu={() => setMenuOpen(true)}
        onRefresh={news.refresh}
        onToggleLang={() => update({ lang: rtl ? 'en' : 'ar' })}
      >
        <RegionChips s={s} rtl={rtl} value={region} onChange={setRegion} />
      </Header>

      {news.loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
          <T weight="semibold" style={styles.centerText}>{s.loading}</T>
        </View>
      ) : (
        <FlatList
          data={visible.length ? rows : []}
          keyExtractor={(row) => row.key}
          ListHeaderComponent={listHeader}
          contentContainerStyle={{ paddingBottom: 16 }}
          refreshControl={<RefreshControl refreshing={news.refreshing} onRefresh={news.refresh} tintColor={colors.accent} colors={[colors.accent]} />}
          renderItem={({ item: row }) => {
            if (row.type === 'section') {
              return (
                <View style={styles.group}>
                  <View style={[row.top ? styles.groupHeadTop : styles.groupHead, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
                    <Ionicons name={row.top ? 'flame' : 'newspaper-outline'} size={16} color={row.top ? colors.white : colors.muted} />
                    <T rtl={rtl} weight="black" style={[styles.groupTitle, row.top && { color: colors.white }]}>
                      {row.top ? s.topStories : s.otherNews}
                    </T>
                    <T weight="bold" style={[styles.groupCount, row.top && { color: '#FFD2D8' }]}>{row.count}</T>
                  </View>
                  {row.top ? <T rtl={rtl} style={styles.groupHint}>{s.topHint}</T> : null}
                </View>
              );
            }
            const props = { item: row.item, source: SOURCES[row.item.sourceId], now: news.now, lang, rtl, s, top: row.top };
            return row.type === 'hero' ? <HeroCard {...props} /> : <NewsCard {...props} />;
          }}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="newspaper-outline" size={48} color={colors.line} />
              <T weight="bold" style={styles.centerText}>{s.empty}</T>
              <T style={styles.centerHint}>{s.emptyHint}</T>
            </View>
          }
        />
      )}

      <Footer
        s={s}
        lang={lang}
        rtl={rtl}
        period={period}
        onPeriod={setPeriod}
        onMenu={() => setMenuOpen(true)}
        lastUpdated={news.lastUpdated}
        nextUpdate={news.nextUpdate}
        now={news.now}
        refreshing={news.refreshing}
      />

      <MenuDrawer
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        s={s}
        lang={lang}
        rtl={rtl}
        settings={settings}
        onLang={(l) => update({ lang: l })}
        onToggleSource={toggleSource}
        period={period}
        onPeriod={setPeriod}
        news={news}
      />
    </View>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ Cairo_400Regular, Cairo_600SemiBold, Cairo_700Bold, Cairo_800ExtraBold });

  if (!fontsLoaded && !fontError) {
    return <View style={[styles.screen, { backgroundColor: colors.ink }]} />;
  }

  return (
    <SafeAreaProvider>
      <NewsScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  banner: { alignItems: 'center', gap: 8, marginHorizontal: 16, marginTop: 14, padding: 10, borderRadius: 12, backgroundColor: colors.accentSoft },
  bannerSoft: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  bannerText: { flex: 1, fontSize: 13, lineHeight: 20, color: colors.accent },
  sectionHead: { alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 16, marginTop: 16, marginBottom: 12 },
  sectionBar: { width: 4, height: 20, borderRadius: 2, backgroundColor: colors.accent },
  sectionTitle: { fontSize: 20, lineHeight: 30 },
  countPill: { backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.line },
  countText: { fontSize: 12, lineHeight: 22, color: colors.muted },
  group: { marginHorizontal: 16, marginBottom: 12, marginTop: 4 },
  groupHead: { alignItems: 'center', gap: 8, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.line },
  groupHeadTop: { alignItems: 'center', gap: 8, backgroundColor: colors.accent, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'stretch' },
  groupTitle: { fontSize: 16, lineHeight: 26, flex: 1 },
  groupCount: { fontSize: 13, lineHeight: 22, color: colors.muted },
  groupHint: { fontSize: 12, lineHeight: 20, color: colors.muted, marginTop: 6 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 32, gap: 8, flex: 1 },
  centerText: { fontSize: 16, lineHeight: 26, textAlign: 'center' },
  centerHint: { fontSize: 13, lineHeight: 22, color: colors.muted, textAlign: 'center' },
});
