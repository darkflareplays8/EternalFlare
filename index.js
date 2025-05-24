const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const token = process.env.DISCORD_TOKEN;

console.log("[INFO] Starting main process...");

// Run deploy-commands.js and post-commands.js before starting the bot
(async () => {
  try {
    console.log("[INFO] Running deploy-commands.js...");
    await require('./deploy-commands.js')();

    console.log("[INFO] Running post-commands.js...");
    await require('./post-commands.js')();
  } catch (err) {
    console.error("[ERROR] Failed to run deploy/post scripts:", err);
  }

  // Now start the bot
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

    const activities = [
      { name: '/help', type: 'WATCHING' },
      { name: 'with fire', type: 'PLAYING' }
    ];

    let i = 0;
    setInterval(() => {
      const activity = activities[i % activities.length];
      client.user.setPresence({
        activities: [activity],
        status: 'online',
      });
      i++;
    }, 10000); // every 10 seconds
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
