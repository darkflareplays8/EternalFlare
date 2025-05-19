/**
 * Help command to show available commands
 */

const config = require('../../config/config');
const { commands } = require('./index');

module.exports = {
  name: 'help',
  description: 'List all available commands',
  execute(message, args) {
    const prefix = config.discord.prefix;
    let helpMessage = '📋 **Available Commands:**\n\n';
    
    // Add each command to the help message
    commands.forEach(command => {
      helpMessage += `**${prefix}${command.name}**: ${command.description}\n`;
    });
    
    // Add footer
    helpMessage += `\nUse \`${prefix}help [command]\` for more information about a specific command.`;
    
    // Send the help message
    message.reply(helpMessage);
  }
};