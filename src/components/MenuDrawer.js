import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Modal, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import T from './T';
import { colors } from '../theme';
import { FEEDS } from '../config';
import { formatClock, formatDuration } from '../i18n';

const WIDTH = Math.min(340, Dimensions.get('window').width * 0.86);

function Section({ title, rtl, children }) {
  return (
    <View style={styles.section}>
      <T rtl={rtl} weight="bold" style={styles.sectionTitle}>{title}</T>
      {children}
    </View>
  );
}

export default function MenuDrawer({ visible, onClose, s, lang, rtl, settings, onLang, onToggleSource, period, onPeriod, news }) {
  const insets = useSafeAreaInsets();
  const slide = useRef(new Animated.Value(0)).current;
  const row = { flexDirection: rtl ? 'row-reverse' : 'row' };

  useEffect(() => {
    if (visible) {
      slide.setValue(0);
      Animated.timing(slide, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    }
  }, [visible, slide]);

  const offset = rtl ? WIDTH : -WIDTH;
  const translateX = slide.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] });
  const sources = FEEDS.filter((f) => f.lang === lang);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View
        style={[styles.panel, rtl ? { right: 0 } : { left: 0 }, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12, transform: [{ translateX }] }]}
      >
        <View style={[styles.head, row]}>
          <T rtl={rtl} weight="black" style={styles.headTitle}>{s.menu}</T>
          <Pressable onPress={onClose} hitSlop={10} style={styles.close}>
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
          <Section title={s.show} rtl={rtl}>
            {[
              { id: 'today', label: `${s.today} — ${s.todayTitle}`, icon: 'flash' },
              { id: 'week', label: `${s.week} — ${s.weekTitle}`, icon: 'calendar' },
            ].map((o) => (
              <Pressable key={o.id} onPress={() => { onPeriod(o.id); onClose(); }} style={[styles.navItem, row, period === o.id && styles.navActive]}>
                <Ionicons name={o.icon} size={18} color={period === o.id ? colors.accent : colors.muted} />
                <T rtl={rtl} weight="semibold" style={styles.navText}>{o.label}</T>
              </Pressable>
            ))}
          </Section>

          <Section title={s.language} rtl={rtl}>
            <View style={[styles.segment, row]}>
              {[{ id: 'ar', label: 'العربية' }, { id: 'en', label: 'English' }].map((o) => (
                <Pressable key={o.id} onPress={() => onLang(o.id)} style={[styles.segBtn, lang === o.id && styles.segActive]}>
                  <T weight="bold" style={[styles.segText, lang === o.id && { color: colors.white }]}>{o.label}</T>
                </Pressable>
              ))}
            </View>
          </Section>

          <Section title={s.sources} rtl={rtl}>
            {sources.map((f) => (
              <View key={f.id} style={[styles.sourceRow, row]}>
                <View style={[styles.sourceDot, { backgroundColor: f.color }]} />
                <View style={{ flex: 1 }}>
                  <T rtl={rtl} weight="semibold" style={styles.sourceName}>{f.name}</T>
                  <T rtl={rtl} style={styles.sourceRegion}>
                    {f.region === 'morocco' ? `🇲🇦 ${s.morocco}` : `🌍 ${s.world}`}
                    {news.failed.includes(f.id) ? '  ⚠️' : ''}
                  </T>
                </View>
                <Switch
                  value={!settings.hidden.includes(f.id)}
                  onValueChange={() => onToggleSource(f.id)}
                  trackColor={{ true: colors.accent, false: colors.line }}
                  thumbColor={colors.white}
                  activeThumbColor={colors.white}
                />
              </View>
            ))}
          </Section>

          <Section title={s.autoRefresh} rtl={rtl}>
            <View style={styles.infoCard}>
              <T rtl={rtl} style={styles.infoText}>{s.autoRefreshText}</T>
              <T rtl={rtl} weight="semibold" style={styles.infoLine}>
                {s.updated}: {news.lastUpdated ? formatClock(news.lastUpdated) : s.never}
              </T>
              {news.nextUpdate ? (
                <T rtl={rtl} weight="semibold" style={styles.infoLine}>
                  {s.nextUpdate} {formatDuration(news.nextUpdate - news.now, lang)}
                </T>
              ) : null}
              <Pressable onPress={news.refresh} style={[styles.refreshBtn, row]} disabled={news.refreshing}>
                <Ionicons name="refresh" size={16} color={colors.white} />
                <T weight="bold" style={{ color: colors.white, fontSize: 14, lineHeight: 22 }}>
                  {news.refreshing ? s.refreshing : s.refreshNow}
                </T>
              </Pressable>
            </View>
          </Section>

          <Section title={s.about} rtl={rtl}>
            <T rtl={rtl} style={styles.infoText}>{s.aboutText}</T>
          </Section>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,14,24,0.5)' },
  panel: { position: 'absolute', top: 0, bottom: 0, width: WIDTH, backgroundColor: colors.paper, paddingHorizontal: 18 },
  head: { alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  headTitle: { fontSize: 24, lineHeight: 36 },
  close: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 12, lineHeight: 18, color: colors.muted, letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' },
  navItem: { alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, backgroundColor: colors.card, marginBottom: 6 },
  navActive: { backgroundColor: colors.accentSoft },
  navText: { fontSize: 14, lineHeight: 22, flex: 1 },
  segment: { backgroundColor: colors.card, borderRadius: 12, padding: 4 },
  segBtn: { flex: 1, height: 38, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  segActive: { backgroundColor: colors.ink },
  segText: { fontSize: 14, lineHeight: 22, color: colors.text, textAlign: 'center' },
  sourceRow: { alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 6 },
  sourceDot: { width: 10, height: 10, borderRadius: 5 },
  sourceName: { fontSize: 14, lineHeight: 22 },
  sourceRegion: { fontSize: 11, lineHeight: 16, color: colors.muted },
  infoCard: { backgroundColor: colors.card, borderRadius: 14, padding: 14, gap: 4 },
  infoText: { fontSize: 13, lineHeight: 22, color: colors.muted },
  infoLine: { fontSize: 13, lineHeight: 22 },
  refreshBtn: { marginTop: 8, backgroundColor: colors.accent, borderRadius: 10, height: 42, alignItems: 'center', justifyContent: 'center', gap: 8 },
});
