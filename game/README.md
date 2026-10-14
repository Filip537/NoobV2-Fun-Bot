# NoobV2 Parkour — playable 2D game + Discord Activity scaffold

This is a real HTML5 canvas platformer with 10 stages, physics, keyboard/touch controls, spikes, checkpoints, and stage unlocks. It is a **separate web app** from your NoobV2 Discord.js bot. Do not replace your bot's `index.js` with these files.

## Run locally

Node.js 20+ recommended.

```bash
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:5173 to play in **web demo mode**. Local stage unlocks are stored in the browser.

## Host on VPS

```bash
npm run build
npm start
```

Serve port 3000 behind an HTTPS reverse proxy on a domain you control. You can use `pm2 start server.js --name parkour-activity` **separately** from the existing `bot` process. Set your `.env` variables first and rebuild whenever you change VITE_DISCORD_CLIENT_ID.

## Configure Discord Activity

1. In Discord Developer Portal, select your application and enable Activities/Embedded App SDK settings as available for your application.
2. Configure a URL mapping to the **HTTPS** origin hosting this app, and configure the OAuth redirect/settings required by Discord's current Activity setup instructions.
3. Copy the application's Client ID to `DISCORD_CLIENT_ID` and `VITE_DISCORD_CLIENT_ID`, and the OAuth Client Secret to `DISCORD_CLIENT_SECRET`. Never put the client secret in the browser code.
4. Rebuild, restart the separate parkour server, and launch the Activity through Discord's app/Activity entry point. Test authorization from within Discord.

The game runs as a normal web demo when outside a Discord Activity. The OAuth exchange and public provisional leaderboard require the hosted backend and successful Discord authorization.

## Important limits

- The current leaderboard accepts client-reported times, which are **not cheat-proof**. Do not grant actual NoobV2 XP or valuable rewards from these results until a server-authoritative run verifier is implemented.
- Progress stored in localStorage is browser-local; it is not yet synchronized to the existing NoobV2 `data/parkour.json`.
- A regular Discord embed/button cannot itself display an interactive HTML5 game. Launch this through a Discord Activity or a website link.
- The 4 channel IDs from your existing NoobV2 setup remain unchanged. This app does not send or modify panels automatically.
