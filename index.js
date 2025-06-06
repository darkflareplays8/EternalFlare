const { Client, GatewayIntentBits, Collection, Partials, Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const mysql = require('mysql2/promise');

// Load environment variables
const token = process.env.DISCORD_TOKEN;
const port = process.env.PORT || 3000;

if (!token) {
  console.error('[ERROR] DISCORD_TOKEN is not set in environment variables.');
  process.exit(1);
}

console.log('[INFO] Starting main process...');

// Setup MySQL connection pool for better performance
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Start Express webhook server
const app = express();
app.use(express.json());

app.post('/dblwebhook', async (req, res) => {
  const userId = req.body.user;
  if (!userId || !/^\d+$/.test(userId)) {
    return res.sendStatus(400);
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.execute(
      `INSERT INTO currency (user_id, flares)
       VALUES (?, 100)
       ON DUPLICATE KEY UPDATE flares = flares + 100`,
      [userId]
    );
    console.log(`✅ ${userId} voted and received 100 flares!`);
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Error handling vote:', err);
    res.sendStatus(500);
  } finally {
    if (connection) connection.release();
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`[INFO] Webhook server listening on port ${port}`);
});

// Main async IIFE to deploy commands and start bot
(async () => {
  try {
    console.log('[INFO] Running deploy-commands.js...');
    await require('./deploy-commands.js')();

    console.log('[INFO] Running post-commands.js...');
    await require('./post-commands.js')();
  } catch (err) {
    console.error('[ERROR] Failed to run deploy/post scripts:', err);
  }

  // Create Discord client
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

  // Load commands dynamically
  client.commands = new Collection();
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    }
  }

  client.once(Events.ClientReady, () => {
    console.log(`✅ Logged in as ${client.user.tag}!`);
    client.user.setPresence({
      activities: [{ name: 'with fire', type: 'PLAYING' }],
      status: 'online',
    });
  });

  client.on(Events.InteractionCreate, async interaction => {
    try {
      if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        await command.execute(interaction);
      } else if (interaction.isModalSubmit()) {
        // Example modal handling: check customId and delegate to command if implemented
        if (interaction.customId === 'embedModal') {
          // Assuming embed.js exports handleModalSubmit
          const embedCommand = client.commands.get('embed');
          if (embedCommand && typeof embedCommand.handleModalSubmit === 'function') {
            await embedCommand.handleModalSubmit(interaction);
          } else {
            await interaction.reply({ content: 'Modal handler not implemented.', ephemeral: true });
          }
        }
      }
    } catch (error) {
      console.error('[ERROR] Interaction handling failed:', error);
      const reply = { content: 'There was an error while executing this interaction!', ephemeral: true };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  });

  await client.login(token);
})();
