const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { stickyMessages } = require('./sticky'); // Import the correct map

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unsticky')
    .setDescription('Removes the active sticky message in this channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const channelId = interaction.channel.id;

    if (!stickyMessages.has(channelId)) {
      return interaction.reply({ content: 'ℹ️ No sticky message is currently active in this channel.', flags: 64 });
    }

    const { stickyMsg } = stickyMessages.get(channelId);

    try {
      await stickyMsg.delete();
    } catch (err) {
      console.error(`[ERROR] Failed to delete sticky message in channel ${channelId}:`, err);
      return interaction.reply({ content: '❌ Failed to delete the sticky message. It might have already been deleted.', flags: 64 });
    }

    stickyMessages.delete(channelId);

    await interaction.reply({ content: '✅ Sticky message removed.', flags: 64 });
  },
};
