import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import T from './T';
import { colors } from '../theme';
import { formatToday } from '../i18n';

export default function Header({ s, lang, rtl, now, refreshing, onMenu, onRefresh, onToggleLang, children }) {
  const insets = useSafeAreaInsets();
  const row = { flexDirection: rtl ? 'row-reverse' : 'row' };

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 8 }]}>
      <View style={[styles.top, row]}>
        <Pressable onPress={onMenu} style={styles.iconBtn} hitSlop={8} accessibilityLabel={s.menu}>
          <Ionicons name="menu" size={24} color={colors.white} />
        </Pressable>

        <View style={[styles.logo, row]}>
          <T weight="black" style={styles.logoText}>{s.appName}</T>
          <View style={styles.badge}>
            <T weight="black" style={styles.badgeText}>24</T>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        <Pressable onPress={onToggleLang} style={styles.langPill} accessibilityLabel={s.language}>
          <T weight={lang === 'ar' ? 'black' : 'regular'} style={[styles.langText, lang === 'ar' && styles.langActive]}>ع</T>
          <View style={styles.langSep} />
          <T weight={lang === 'en' ? 'black' : 'regular'} style={[styles.langText, lang === 'en' && styles.langActive]}>EN</T>
        </Pressable>

        <Pressable onPress={onRefresh} style={styles.iconBtn} hitSlop={8} accessibilityLabel={s.refreshNow}>
          {refreshing ? <ActivityIndicator color={colors.white} /> : <Ionicons name="refresh" size={22} color={colors.white} />}
        </Pressable>
      </View>

      <View style={[styles.dateRow, row]}>
        <View style={styles.liveDot} />
        <T rtl={rtl} weight="semibold" style={styles.date}>{formatToday(now, lang)}</T>
        <T rtl={rtl} style={styles.tagline}> · {s.tagline}</T>
      </View>

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.ink, paddingHorizontal: 16, paddingBottom: 12, borderBottomLeftRadius: 22, borderBottomRightRadius: 22 },
  top: { alignItems: 'center', gap: 10 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.ink2, alignItems: 'center', justifyContent: 'center' },
  logo: { alignItems: 'center', gap: 6 },
  logoText: { color: colors.white, fontSize: 24, lineHeight: 34 },
  badge: { backgroundColor: colors.accent, borderRadius: 8, paddingHorizontal: 7, transform: [{ rotate: '-4deg' }] },
  badgeText: { color: colors.white, fontSize: 16, lineHeight: 24 },
  langPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.ink2, borderRadius: 20, paddingHorizontal: 12, height: 36, gap: 8 },
  langText: { color: colors.onInkMuted, fontSize: 14, lineHeight: 22 },
  langActive: { color: colors.white },
  langSep: { width: 1, height: 14, backgroundColor: colors.inkLine },
  dateRow: { alignItems: 'center', marginTop: 10, gap: 6, flexWrap: 'wrap' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  date: { color: colors.white, fontSize: 13, lineHeight: 20 },
  tagline: { color: colors.onInkMuted, fontSize: 13, lineHeight: 20 },
});
