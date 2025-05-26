const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { stickyIntervals } = require('./sticky');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unsticky')
    .setDescription('Removes the active sticky message in this channel.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const channelId = interaction.channel.id;

    if (!stickyIntervals.has(channelId)) {
      return interaction.reply({ content: 'ℹ️ No sticky message is currently active in this channel.', flags: 64 });
    }

    clearInterval(stickyIntervals.get(channelId));
    stickyIntervals.delete(channelId);

    await interaction.reply({ content: '✅ Sticky message removed.', flags: 64 });
  },
};
