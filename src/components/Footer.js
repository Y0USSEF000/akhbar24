import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import T from './T';
import { colors } from '../theme';
import { formatClock, formatDuration } from '../i18n';

export default function Footer({ s, lang, rtl, period, onPeriod, onMenu, lastUpdated, nextUpdate, now, refreshing }) {
  const insets = useSafeAreaInsets();
  const row = { flexDirection: rtl ? 'row-reverse' : 'row' };

  const tabs = [
    { id: 'today', label: s.today, icon: 'flash', onPress: () => onPeriod('today') },
    { id: 'week', label: s.week, icon: 'calendar', onPress: () => onPeriod('week') },
    { id: 'menu', label: s.menu, icon: 'grid', onPress: onMenu },
  ];

  const status = refreshing
    ? s.refreshing
    : lastUpdated
      ? `${s.updated} ${formatClock(lastUpdated)}  ·  ${s.nextUpdate} ${formatDuration(nextUpdate - now, lang)}`
      : s.loading;

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <View style={[styles.status, row]}>
        <Ionicons name="time-outline" size={13} color={colors.onInkMuted} />
        <T style={styles.statusText} numberOfLines={1}>{status}</T>
      </View>

      <View style={[styles.tabs, row]}>
        {tabs.map((t) => {
          const active = t.id === period;
          return (
            <Pressable key={t.id} onPress={t.onPress} style={styles.tab}>
              <View style={[styles.iconWrap, active && styles.iconActive]}>
                <Ionicons name={active ? t.icon : `${t.icon}-outline`} size={20} color={active ? colors.white : colors.onInkMuted} />
              </View>
              <T weight={active ? 'bold' : 'semibold'} style={[styles.tabLabel, active && { color: colors.white }]}>{t.label}</T>
            </Pressable>
          );
        })}
      </View>

      <T style={styles.copy}>© {new Date(now).getFullYear()} {s.footer}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.ink, borderTopLeftRadius: 22, borderTopRightRadius: 22, paddingTop: 8, paddingHorizontal: 16 },
  status: { alignItems: 'center', justifyContent: 'center', gap: 6, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: colors.ink2 },
  statusText: { color: colors.onInkMuted, fontSize: 11, lineHeight: 18, textAlign: 'center' },
  tabs: { justifyContent: 'space-around', paddingTop: 6 },
  tab: { alignItems: 'center', minWidth: 72 },
  iconWrap: { width: 44, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  iconActive: { backgroundColor: colors.accent },
  tabLabel: { color: colors.onInkMuted, fontSize: 12, lineHeight: 20, textAlign: 'center' },
  copy: { color: '#5D708C', fontSize: 10, lineHeight: 16, textAlign: 'center', marginTop: 2 },
});
