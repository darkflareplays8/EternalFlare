module.exports = (client) => {
  const ADMIN_SERVER_ID = '1362145548106334340';      // placeholder server ID
  const ADMIN_CHANNEL_ID = '1420420899005399131';  // placeholder admin channel ID
  const PREFIX = '?';

  client.on('messageCreate', message => {
    if (message.author.bot) return;

    if (
      message.guild &&
      message.guild.id === ADMIN_SERVER_ID &&
      message.channel.id === ADMIN_CHANNEL_ID &&
      message.content.startsWith(PREFIX)
    ) {
      const args = message.content.slice(PREFIX.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();

      // Here add your admin commands logic
      if (command === 'command') {
        message.reply('Admin command triggered! Add your logic here.');
      } else {
        message.reply(`Unknown admin command: ${command}`);
      }
    }
  });
};
