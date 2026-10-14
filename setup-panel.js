require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { channels } = require('./config');
const token = process.env.DISCORD_BOT_TOKEN;
const url = process.env.GAME_URL;
if (!token) throw new Error('Set DISCORD_BOT_TOKEN in .env');
if (!url || !/^https:\/\/[^\s]+$/i.test(url)) throw new Error('Set GAME_URL to your hosted HTTPS game URL');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once('ready', async () => {
  try {
    const ch = await client.channels.fetch(channels.play);
    if (!ch?.isTextBased()) throw new Error('Play channel unavailable or bot lacks access');
    const embed = new EmbedBuilder()
      .setColor(0x36c989).setTitle('NOOBV2 PARKOUR TOWER')
      .setDescription('Play the **real 2D parkour game** with keyboard controls, checkpoints, spikes and 10 stages!\n\n**A / D** = Move • **Space** = Jump • **R** = Restart\n\nClick **Play Parkour** to open the hosted game. To play *inside Discord*, launch the Activity from Discord after configuring the Activity URL mapping.');
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setStyle(ButtonStyle.Link).setLabel('Play Parkour').setURL(url)
    );
    await ch.send({ embeds: [embed], components: [row] });
    console.log('[Parkour Bot] Panel posted in', channels.play);
  } catch (error) { console.error('[Parkour Bot] Panel setup failed:', error); process.exitCode = 1; }
  finally { client.destroy(); }
});
client.login(token).catch(error => { console.error(error); process.exitCode = 1; });
