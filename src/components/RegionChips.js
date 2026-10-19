import { Pressable, StyleSheet, View } from 'react-native';
import T from './T';
import { colors } from '../theme';

export default function RegionChips({ s, rtl, value, onChange }) {
  const options = [
    { id: 'all', label: s.all },
    { id: 'morocco', label: `🇲🇦 ${s.morocco}` },
    { id: 'world', label: `🌍 ${s.world}` },
  ];
  return (
    <View style={[styles.row, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <Pressable key={o.id} onPress={() => onChange(o.id)} style={[styles.chip, active && styles.chipActive]}>
            <T weight={active ? 'bold' : 'semibold'} style={[styles.label, active && styles.labelActive]}>{o.label}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, marginTop: 12 },
  chip: { paddingHorizontal: 14, height: 34, borderRadius: 17, justifyContent: 'center', borderWidth: 1, borderColor: colors.inkLine },
  chipActive: { backgroundColor: colors.white, borderColor: colors.white },
  label: { color: colors.onInkMuted, fontSize: 13, lineHeight: 20 },
  labelActive: { color: colors.ink },
});
