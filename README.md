# NoobV2 Parkour Bot + Real 2D Game

A **separate Discord bot** for your new Discord application, plus the existing playable HTML5 platformer. The bot posts a permanent **link button** in your parkour channel. The game itself runs in a browser or, after Developer Portal configuration, as a Discord Activity. A link button is NOT an Activity launcher.

## 1. Configure your separate bot

1. Copy `.env.example` to `.env` and fill in `DISCORD_BOT_TOKEN` (Bot tab), `DISCORD_CLIENT_ID` (General Information), and `GAME_URL` (your public HTTPS game URL). **Never share the bot token.**
2. Install the separate bot into your Discord server with permission to View Channel, Send Messages, and Embed Links.
3. On your VPS (Node.js 20+):

```bash
cd NoobV2-Parkour-Bot
npm install
node --check index.js
pm run setup
pm start
```

To keep the bot online independently of your existing NoobV2 bot:

```bash
pm2 start index.js --name parkour-bot
pm2 save
```

`npm run setup` posts a **new** panel each time; run only once. The four channels are defined in `config.js`. The other three channels are reserved for future leaderboard/records/updates integration and are not automatically populated.

## 2. Host the playable game

```bash
cd game
cp .env.example .env
# Set DISCORD_CLIENT_ID, VITE_DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET in game/.env
npm install
npm run build
pm start
```

The game serves on port 3000 by default. Put it behind a public HTTPS reverse proxy (e.g. Nginx + TLS) and set the **root** `.env` `GAME_URL` to that URL. For an independent PM2 process, run `pm2 start server.js --name parkour-game` from the `game` folder.

## 3. Run as a Discord Activity

In the Discord Developer Portal for the **separate** application, expand **Activities** and follow the current Activity configuration flow. Enable Activities, configure a URL mapping to your HTTPS game origin, and set the OAuth options as required. Test launch from Discord's Activity/App entry point. The bot's link button opens the website, not an embedded Activity.

## Limitations

- This is a working game scaffold and separate bot, **not an automatically configured or hosted Activity**.
- The existing game saves local unlocks in the browser. The hosted leaderboard is provisional and client-reported; it is not secure enough for rewards.
- NoobV2 XP and existing parkour database are **not connected**.
- No slash commands or Discord gameplay buttons are needed.
- Your existing PM2 `bot` and `GrowDetector` processes are untouched.
