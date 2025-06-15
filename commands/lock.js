// commands/lock.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Enable or disable message deletion in this channel')
    .addSubcommand(sub =>
      sub.setName('enable').setDescription('Start deleting all messages in this channel')
    )
    .addSubcommand(sub =>
      sub.setName('disable').setDescription('Stop deleting messages in this channel')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const channelId = interaction.channel.id;

    global.lockedChannels = global.lockedChannels || new Set();

    if (subcommand === 'enable') {
      global.lockedChannels.add(channelId);
      await interaction.reply({
        content: `🔒 This channel is now locked. All messages will be deleted immediately.`,
        flags: 64
      });
    }

    if (subcommand === 'disable') {
      global.lockedChannels.delete(channelId);
      await interaction.reply({
        content: `🔓 This channel is now unlocked. Messages will no longer be deleted.`,
        flags: 64
      });
    }
  }
};
