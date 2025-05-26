const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const mysql = require('mysql2/promise');

// Load environment variables
const token = process.env.DISCORD_TOKEN;
const port = process.env.PORT || 3000;

console.log("[INFO] Starting main process...");

// Start webhook server
const app = express();
app.use(express.json());

app.post('/dblwebhook', async (req, res) => {
  const userId = req.body.user;
  if (!userId) return res.sendStatus(400);

  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
    });

    await connection.execute(
      `INSERT INTO currency (user_id, flares)
       VALUES (?, 100)
       ON DUPLICATE KEY UPDATE flares = flares + 100`,
      [userId]
    );

    await connection.end();
    console.log(`✅ ${userId} voted and received 100 flares!`);
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Error handling vote:', err);
    res.sendStatus(500);
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`[INFO] Webhook server listening on port ${port}`);
});

// Run deploy/post scripts and start the bot
(async () => {
  try {
    console.log("[INFO] Running deploy-commands.js...");
    await require('./deploy-commands.js')();

    console.log("[INFO] Running post-commands.js...");
    await require('./post-commands.js')();
  } catch (err) {
    console.error("[ERROR] Failed to run deploy/post scripts:", err);
  }

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

  client.commands = new Collection();
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    }
  }

  client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}!`);

    client.user.setPresence({
      activities: [{ name: 'with fire', type: 'PLAYING' }],
      status: 'online',
    });
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      const reply = { content: 'There was an error while executing this command!', flags: 64 };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  });

  client.login(token);
})();
