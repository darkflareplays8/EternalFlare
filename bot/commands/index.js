/**
 * Command handler for the Discord bot
 */

const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');
const config = require('../../config/config');

// Command collection
const commands = new Map();

/**
 * Register all commands
 * @param {Client} client - Discord.js client
 */
function registerCommands(client) {
  // Read all command files (excluding this index.js)
  const commandFiles = fs.readdirSync(__dirname)
    .filter(file => file !== 'index.js' && file.endsWith('.js'));
  
  // Load each command
  for (const file of commandFiles) {
    const command = require(path.join(__dirname, file));
    commands.set(command.name, command);
    logger.info(`Registered command: ${command.name}`);
  }
  
  // Set up message handler
  client.on('messageCreate', message => {
    // Ignore messages from bots or without prefix
    if (message.author.bot) return;
    if (!message.content.startsWith(config.discord.prefix)) return;
    
    // Parse command and arguments
    const args = message.content.slice(config.discord.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    // Check if command exists
    if (!commands.has(commandName)) return;
    
    // Execute command
    try {
      const command = commands.get(commandName);
      command.execute(message, args);
      logger.debug(`Command executed: ${commandName}`, { 
        userId: message.author.id, 
        guildId: message.guild?.id 
      });
    } catch (error) {
      logger.error(`Command execution error: ${commandName}`, error);
      message.reply('There was an error executing that command.');
    }
  });
  
  logger.info(`Registered ${commands.size} commands`);
}

module.exports = {
  registerCommands,
  commands
};