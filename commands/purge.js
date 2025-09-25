const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Bulk delete messages')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type of messages to purge')
        .setRequired(true)
        .addChoices(
          { name: 'all', value: 'all' },
          { name: 'bots', value: 'bots' },
          { name: 'users', value: 'users' }
        ))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of messages to delete')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(1499)), // We'll validate inside later for bots/users

  async execute(interaction) {
    const type = interaction.options.getString('type');
    let amount = interaction.options.getInteger('amount');

    // Enforce limits based on type
    if (type === 'bots' || type === 'users') {
      if (amount > 499) amount = 499;
    } else if (type === 'all') {
      if (amount > 1499) amount = 1499;
    }

    // Fetch messages up to amount (plus one for the command message)
    const messages = await interaction.channel.messages.fetch({ limit: amount + 1 });

    let messagesToDelete;

    if (type === 'all') {
      messagesToDelete = messages;
    } else if (type === 'bots') {
      messagesToDelete = messages.filter(m => m.author.bot);
    } else if (type === 'users') {
      messagesToDelete = messages.filter(m => !m.author.bot);
    }

    if (messagesToDelete.size === 0) {
      return interaction.reply({ content: `No ${type} messages found to delete.`, ephemeral: true });
    }

    // Bulk delete - max 100 per request, so chunk if needed
    const deletePromises = [];
    const chunks = [];

    // Chunk messagesToDelete IDs in batches of 100 (max allowed by Discord)
    const messageArr = Array.from(messagesToDelete.keys());
    for (let i = 0; i < messageArr.length; i += 100) {
      chunks.push(messageArr.slice(i, i + 100));
    }

    for (const chunk of chunks) {
      deletePromises.push(interaction.channel.bulkDelete(chunk, true));
    }

    try {
      await Promise.all(deletePromises);
      return interaction.reply({ content: `Deleted ${messagesToDelete.size} ${type} messages.`, ephemeral: true });
    } catch (error) {
      console.error('Error deleting messages:', error);
      return interaction.reply({ content: 'Failed to delete messages. Make sure the bot has Manage Messages permission.', ephemeral: true });
    }
  }
};
