// commands/lock.js
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock or unlock the current channel')
    .addSubcommand(sub =>
      sub.setName('enable').setDescription('Lock this channel')
    )
    .addSubcommand(sub =>
      sub.setName('disable').setDescription('Unlock this channel')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const channel = interaction.channel;

    global.lockedChannels = global.lockedChannels || new Set();

    if (subcommand === 'enable') {
      try {
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
          SendMessages: false,
        });

        global.lockedChannels.add(channel.id);

        await interaction.reply({
          content: `🔒 Channel locked. Messages will be deleted.`,
          flags: 64,
        });
      } catch (err) {
        console.error('Failed to lock channel:', err);
        await interaction.reply({
          content: '❌ Failed to lock the channel.',
          flags: 64,
        });
      }
    }

    if (subcommand === 'disable') {
      try {
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
          SendMessages: null,
        });

        global.lockedChannels.delete(channel.id);

        await interaction.reply({
          content: `🔓 Channel unlocked.`,
          flags: 64,
        });
      } catch (err) {
        console.error('Failed to unlock channel:', err);
        await interaction.reply({
          content: '❌ Failed to unlock the channel.',
          flags: 64,
        });
      }
    }
  }
};
