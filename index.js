const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

const token = process.env.DISCORD_TOKEN;

async function runDeployCommands() {
  console.log("[INFO] Running deploy-commands.js...");
  try {
    await require('./deploy-commands.js')();
    console.log("[SUCCESS] Deploy commands completed.");
  } catch (error) {
    console.error("[ERROR] Failed to run deploy-commands.js:", error);
    process.exit(1);
  }
}

async function runPostCommands() {
  console.log("[INFO] Running post-commands.js...");
  try {
    await require('./post-commands.js')();
    console.log("[SUCCESS] Post commands completed.");
  } catch (error) {
    console.error("[ERROR] Failed to run post-commands.js:", error);
    process.exit(1);
  }
}

async function startBot() {
  console.log("[INFO] Starting bot...");

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [
      Partials.Message,
      Partials.Channel,
      Partials.Reaction,
    ],
  });

  client.commands = new Collection();
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      console.log(`[INFO] Loaded command: ${command.data.name}`);
    } else {
      console.warn(`[WARN] Skipped command file: ${file}`);
    }
  }

  client.once('ready', () => {
    console.log(`[SUCCESS] Logged in as ${client.user.tag}!`);
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(`[ERROR] Error executing command "${interaction.commandName}":`, error);
      const replyPayload = { content: 'There was an error while executing that command!', flags: 64 };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(replyPayload);
      } else {
        await interaction.reply(replyPayload);
      }
    }
  });

  client.login(token).catch(err => {
    console.error("[ERROR] Login failed:", err);
    process.exit(1);
  });
}

async function main() {
  console.log("[INFO] Starting main process...");
  if (process.env.RUN_DEPLOY_COMMAND === 'true') {
    console.log("[INFO] RUN_DEPLOY_COMMAND=true. Running deploy commands only and then exiting...");
    await runDeployCommands();
    process.exit(0);
  } else {
    // Run deploy and post commands before starting bot
    await runDeployCommands();
    await runPostCommands();
    await startBot();
  }
}

main();
