const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config(); // Only needed locally, can be skipped on Railway if set there

module.exports = async function deployCommands() {
  const commands = [];
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  // Load command data
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    } else {
      console.warn(`[WARNING] Skipping "${file}" — missing "data" or "execute".`);
    }
  }

  // Set up REST client
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  // Deploy global commands
  try {
    console.log('🌍 Starting global command deployment for EternalFlare...');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log(`✅ Successfully deployed ${commands.length} global command(s).`);
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    throw error; // So your main file knows deployment failed
  }
};
