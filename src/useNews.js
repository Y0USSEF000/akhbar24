import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FEEDS, REFRESH_EVERY, RETRY_AFTER, WEEK } from './config';
import { fetchAllFeeds } from './rss';

const CACHE_KEY = 'akhbar24:news';

// New download wins. Old stories stay only if they are less than 7 days old,
// so the "Week" page still has news even when a site's feed is short.
function merge(oldItems, newItems, now) {
  const byId = new Map();
  for (const it of oldItems) byId.set(it.id, it);
  for (const it of newItems) byId.set(it.id, it);
  return [...byId.values()]
    .filter((it) => now - it.date < WEEK)
    .sort((a, b) => b.date - a.date);
}

export function useNews() {
  const [items, setItems] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [failed, setFailed] = useState([]);
  const [offline, setOffline] = useState(false);
  const [loading, setLoading] = useState(true); // first load, nothing on screen yet
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(Date.now());

  const busy = useRef(false);
  const lastAttempt = useRef(0);
  const state = useRef({ items: [], lastUpdated: null });

  const refresh = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    lastAttempt.current = Date.now();
    setRefreshing(true);
    try {
      const res = await fetchAllFeeds(FEEDS);
      if (res.items.length === 0) throw new Error('offline');
      const t = Date.now();
      const merged = merge(state.current.items, res.items, t);
      state.current = { items: merged, lastUpdated: t };
      setItems(merged);
      setLastUpdated(t);
      setFailed(res.failed);
      setOffline(false);
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(state.current));
    } catch {
      setOffline(true);
    } finally {
      busy.current = false;
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  // Refresh when the saved news is older than 24 hours.
  const checkStale = useCallback(() => {
    const t = Date.now();
    setNow(t);
    const age = t - (state.current.lastUpdated || 0);
    if (age >= REFRESH_EVERY && t - lastAttempt.current >= RETRY_AFTER) refresh();
  }, [refresh]);

  // 1) Open the app: show saved news at once, then refresh if it is too old.
  useEffect(() => {
    (async () => {
      try {
        const saved = JSON.parse((await AsyncStorage.getItem(CACHE_KEY)) || 'null');
        if (saved?.items) {
          const kept = merge(saved.items, [], Date.now());
          state.current = { items: kept, lastUpdated: saved.lastUpdated };
          setItems(kept);
          setLastUpdated(saved.lastUpdated);
          setLoading(false);
        }
      } catch {}
      checkStale();
    })();
  }, [checkStale]);

  // 2) While the app is open: check every 30 seconds (also moves the "x min ago" labels).
  useEffect(() => {
    const id = setInterval(checkStale, 30 * 1000);
    return () => clearInterval(id);
  }, [checkStale]);

  // 3) When the user comes back to the app from the background.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => s === 'active' && checkStale());
    return () => sub.remove();
  }, [checkStale]);

  const nextUpdate = lastUpdated ? lastUpdated + REFRESH_EVERY : null;

  return { items, lastUpdated, nextUpdate, failed, offline, loading, refreshing, refresh, now };
}
