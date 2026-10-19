import { Image, ImageBackground, Pressable, Share, StyleSheet, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import T from './T';
import { colors } from '../theme';
import { timeAgo } from '../i18n';
import { CATEGORIES } from '../importance';

const TAG_COLORS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.color]));

const open = (item) => WebBrowser.openBrowserAsync(item.link).catch(() => {});
const share = (item) => Share.share({ message: `${item.title}\n${item.link}`, url: item.link }).catch(() => {});

function SourceLine({ source, item, now, lang, rtl, light }) {
  return (
    <View style={[styles.meta, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
      <View style={[styles.dot, { backgroundColor: source.color }]} />
      <T weight="bold" style={[styles.source, light && { color: colors.white }]} numberOfLines={1}>{source.name}</T>
      <T style={[styles.time, light && { color: '#D5DCE8' }]}>· {timeAgo(item.date, now, lang)}</T>
    </View>
  );
}

// Small colored labels: War, Death, Disaster… and "+2 sources" when other sites tell the same story.
function Tags({ item, s, rtl, onDark }) {
  if (!item.tags?.length && !item.sources) return null;
  return (
    <View style={[styles.tags, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
      {(item.tags || []).map((t) => (
        <View key={t} style={[styles.tag, { backgroundColor: TAG_COLORS[t] }]}>
          <T weight="bold" style={styles.tagText}>{s.tags[t]}</T>
        </View>
      ))}
      {item.sources ? (
        <View style={[styles.tag, onDark ? styles.srcTagDark : styles.srcTag]}>
          <T weight="bold" style={[styles.tagText, !onDark && { color: colors.muted }]}>{s.moreSources(item.sources)}</T>
        </View>
      ) : null}
    </View>
  );
}

// When a story has no picture we show the first letter of the site on its color.
function Placeholder({ source, style, big }) {
  return (
    <View style={[style, styles.placeholder, { backgroundColor: source.color }]}>
      <T weight="black" style={{ color: 'rgba(255,255,255,0.9)', fontSize: big ? 56 : 30, lineHeight: big ? 80 : 44, textAlign: 'center' }}>
        {source.name.slice(0, 1)}
      </T>
    </View>
  );
}

export function HeroCard({ item, source, now, lang, rtl, s, top }) {
  const content = (
    <View style={styles.heroShade}>
      {top ? (
        <Tags item={item} s={s} rtl={rtl} onDark />
      ) : (
        <View style={[styles.latest, { alignSelf: rtl ? 'flex-end' : 'flex-start' }]}>
          <T weight="bold" style={styles.latestText}>{s.latest}</T>
        </View>
      )}
      <T rtl={rtl} weight="bold" style={styles.heroTitle} numberOfLines={3}>{item.title}</T>
      <SourceLine source={source} item={item} now={now} lang={lang} rtl={rtl} light />
    </View>
  );
  return (
    <Pressable onPress={() => open(item)} onLongPress={() => share(item)} style={styles.hero}>
      {item.image ? (
        <ImageBackground source={{ uri: item.image }} style={styles.heroImg} imageStyle={{ borderRadius: 20 }}>
          {content}
        </ImageBackground>
      ) : (
        <View style={[styles.heroImg, { backgroundColor: source.color }]}>{content}</View>
      )}
    </Pressable>
  );
}

export default function NewsCard({ item, source, now, lang, rtl, s, top }) {
  return (
    <Pressable
      onPress={() => open(item)}
      style={({ pressed }) => [
        styles.card,
        { flexDirection: rtl ? 'row-reverse' : 'row' },
        top && (rtl ? styles.cardTopRtl : styles.cardTop),
        pressed && { opacity: 0.85 },
      ]}
    >
      {item.image ? <Image source={{ uri: item.image }} style={styles.thumb} /> : <Placeholder source={source} style={styles.thumb} />}
      <View style={styles.body}>
        {top ? <Tags item={item} s={s} rtl={rtl} /> : null}
        <SourceLine source={source} item={item} now={now} lang={lang} rtl={rtl} />
        <T rtl={rtl} weight="bold" style={styles.title} numberOfLines={3}>{item.title}</T>
        <View style={[styles.actions, { flexDirection: rtl ? 'row' : 'row-reverse' }]}>
          <Pressable onPress={() => share(item)} hitSlop={10} style={styles.shareBtn}>
            <Ionicons name="share-social-outline" size={16} color={colors.muted} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { marginHorizontal: 16, marginBottom: 14, borderRadius: 20, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  heroImg: { height: 240, justifyContent: 'flex-end', borderRadius: 20 },
  heroShade: { backgroundColor: 'rgba(8,14,24,0.62)', padding: 16, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  heroTitle: { color: colors.white, fontSize: 19, lineHeight: 30, marginTop: 6, marginBottom: 4 },
  latest: { backgroundColor: colors.accent, borderRadius: 6, paddingHorizontal: 8 },
  latestText: { color: colors.white, fontSize: 11, lineHeight: 20 },
  card: { marginHorizontal: 16, marginBottom: 12, backgroundColor: colors.card, borderRadius: 16, padding: 10, gap: 12, borderWidth: 1, borderColor: colors.line },
  thumb: { width: 104, height: 104, borderRadius: 12, backgroundColor: colors.line },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, justifyContent: 'space-between' },
  meta: { alignItems: 'center', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  source: { fontSize: 12, lineHeight: 18, color: colors.text, flexShrink: 1 },
  time: { fontSize: 12, lineHeight: 18, color: colors.muted },
  title: { fontSize: 15, lineHeight: 24, marginTop: 2 },
  actions: { marginTop: 2 },
  cardTop: { borderLeftWidth: 4, borderLeftColor: colors.accent },
  cardTopRtl: { borderRightWidth: 4, borderRightColor: colors.accent },
  tags: { flexWrap: 'wrap', gap: 5, marginBottom: 4 },
  tag: { borderRadius: 6, paddingHorizontal: 7 },
  tagText: { color: colors.white, fontSize: 11, lineHeight: 19 },
  srcTag: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line },
  srcTagDark: { backgroundColor: 'rgba(255,255,255,0.18)' },
  shareBtn: { padding: 2 },
});
