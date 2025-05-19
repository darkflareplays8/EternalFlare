/**
 * Event handler for when the bot is ready
 */

const logger = require('../../utils/logger');

module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    logger.info(`Logged in as ${client.user.tag}`);
    logger.info(`Bot is serving ${client.guilds.cache.size} servers`);
  }
};