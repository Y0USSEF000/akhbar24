# Akhbar 24 · أخبار 24

A mobile news app (Expo / React Native) that reads news websites with **RSS**.

- **Today**: news from the last 24 hours
- **Week**: news from the last 7 days
- **Arabic / English**: tap `ع | EN` in the header (Arabic is right-to-left)
- **Top stories first**: wars, deaths, disasters, breaking news and famous people,
  plus stories that many sites are reporting. Then the other news, newest first.
  The words and their weights are in `src/importance.js`.
- **Morocco / World** filter, and turn sources on/off in the menu
- **Auto refresh**: every 24 hours the app downloads all the news again
  (when you open the app, when you come back to it, or while it is open).
  You can also pull down or tap the refresh button.

## Run on your phone (Expo Go)

```
cd C:\Users\dahiy\Akhbar24
npx.cmd expo start
```

Scan the QR code with the **Expo Go** app.

## Run in the web browser

```
cd C:\Users\dahiy\Akhbar24
npm.cmd run web
```

This also starts `proxy.js`, a small helper the browser needs to read the RSS feeds (CORS).
The phone does not need it.

## Desktop app on your PC

Double-click **Akhbar 24** on your desktop (Bureau). It opens the app in its own window.
Closing the window stops everything.

How it works: `Akhbar24.vbs` → `desktop.js` → starts `proxy.js` (serves the `dist` folder + reads the feeds)
→ opens Edge in app mode. Saved news is kept in `.desktop-profile`.

After you change the code, rebuild the desktop version:

```
cd C:\Users\dahiy\Akhbar24
npm.cmd run desktop:build
```

## Files

| File | What it does |
| --- | --- |
| `src/config.js` | List of news sites (RSS links) and the 24h refresh time |
| `src/rss.js` | Downloads and reads the RSS feeds |
| `src/useNews.js` | Saves the news on the phone and refreshes after 24h |
| `src/i18n.js` | Arabic and English texts, dates, "5 min ago" |
| `src/components/` | Header, menu, news cards, footer |

To add a news site, add one line in `src/config.js`.
