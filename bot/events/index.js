/**
 * Event handler for the Discord bot
 */

const fs = require('fs');
const path = require('path');
const logger = require('../../utils/logger');

/**
 * Register all event handlers
 * @param {Client} client - Discord.js client
 */
function registerEvents(client) {
  // Read all event files (excluding this index.js)
  const eventFiles = fs.readdirSync(__dirname)
    .filter(file => file !== 'index.js' && file.endsWith('.js'));
  
  // Register each event handler
  for (const file of eventFiles) {
    const event = require(path.join(__dirname, file));
    
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
    
    logger.info(`Registered event handler: ${event.name}`);
  }
  
  logger.info(`Registered ${eventFiles.length} event handlers`);
}

module.exports = {
  registerEvents
};