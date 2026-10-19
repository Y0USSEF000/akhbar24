import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'akhbar24:settings';
const DEFAULTS = { lang: 'ar', hidden: [] }; // hidden = ids of sources the user turned off

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULTS);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setSettings({ ...DEFAULTS, ...JSON.parse(raw) }))
      .catch(() => {});
  }, []);

  const update = useCallback((patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const toggleSource = useCallback(
    (id) => {
      setSettings((prev) => {
        const hidden = prev.hidden.includes(id) ? prev.hidden.filter((h) => h !== id) : [...prev.hidden, id];
        const next = { ...prev, hidden };
        AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [],
  );

  return { settings, update, toggleSource };
}
