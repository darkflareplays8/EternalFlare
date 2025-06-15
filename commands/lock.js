const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Locks or unlocks the current channel.')
    .addSubcommand(subcommand =>
      subcommand
        .setName('enable')
        .setDescription('Locks the channel and deletes messages sent.')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('disable')
        .setDescription('Unlocks the channel.')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const channel = interaction.channel;

    if (subcommand === 'enable') {
      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
        SendMessages: false,
      });

      global.lockedChannels = global.lockedChannels || new Set();
      global.lockedChannels.add(channel.id);

      await interaction.reply({
        content: `🔒 Channel has been locked. Any messages sent will be deleted.`,
        flags: 64, // ephemeral
      });
    } else if (subcommand === 'disable') {
      await channel.permissionOverwrites.edit(channel.guild.roles.everyone, {
        SendMessages: true,
      });

      global.lockedChannels = global.lockedChannels || new Set();
      global.lockedChannels.delete(channel.id);

      await interaction.reply({
        content: `🔓 Channel has been unlocked.`,
        flags: 64,
      });
    }
  },
};
