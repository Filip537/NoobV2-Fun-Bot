require('dotenv').config();
const { Client, GatewayIntentBits, Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { channels } = require('./config');
const token = process.env.DISCORD_BOT_TOKEN;
if (!token) { console.error('Missing DISCORD_BOT_TOKEN in .env'); process.exit(1); }
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, ready => {
  console.log(`[Parkour Bot] Ready as ${ready.user.tag}`);
  console.log('[Parkour Bot] Game panel can be posted with: npm run setup');
});
client.on(Events.Error, console.error);
client.login(token).catch(error => { console.error('[Parkour Bot] Login failed:', error); process.exitCode = 1; });
module.exports = { client };
