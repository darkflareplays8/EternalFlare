const { Client, GatewayIntentBits, Collection, Partials, Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

// Load environment variables
const token = process.env.DISCORD_TOKEN;
const port = process.env.PORT || 3000;

if (!token) {
  console.error('[ERROR] DISCORD_TOKEN is not set in environment variables.');
  process.exit(1);
}

console.log('[INFO] Starting main process...');

// Start Express webhook server
const app = express();
app.use(express.json());

// Health endpoint for UptimeRobot
app.get('/health', (req, res) => {
  res.sendStatus(200);
});

app.post('/dblwebhook', async (req, res) => {
  const userId = req.body.user;
  if (!userId || !/^\d+$/.test(userId)) {
    return res.sendStatus(400);
  }

  console.log(`✅ ${userId} voted! (Reward logic needs implementation)`);
  res.sendStatus(200);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`[INFO] Webhook server listening on port ${port}`);
});

// Rest of your bot code remains the same...
(async () => {
  try {
    console.log('[INFO] Running deploy-commands.js...');
    await require('./deploy-commands.js')();
  } catch (err) {
    console.error('[ERROR] Failed to run deploy script:', err);
  }

  // Discord client setup (same as before)
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  });

  require('./adminPanel')(client);
  global.lockedChannels = new Set();

  client.commands = new Collection();
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    }
  }

  // Event handlers (same as before)
  client.once(Events.ClientReady, () => {
    console.log(`✅ Logged in as ${client.user.tag}!`);
    client.user.setPresence({
      activities: [{ name: 'with fire', type: 'PLAYING' }],
      status: 'online',
    });
  });

  // ... rest of your interaction and message handlers unchanged

  await client.login(token);
})();
