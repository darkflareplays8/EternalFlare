const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member for a specified duration')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to timeout')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (e.g., 10s, 5m, 1h)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the timeout'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const durationStr = interaction.options.getString('duration');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      return interaction.reply({
        content: 'User not found in this server.',
        flags: 64
      });
    }

    const duration = ms(durationStr);
    if (!duration || duration > 2.419e9) {
      return interaction.reply({
        content: 'Invalid duration. Maximum is 28 days (e.g., `28d`).',
        flags: 64
      });
    }

    try {
      await member.timeout(duration, reason);
      await interaction.reply({
        content: `✅ ${user.tag} has been timed out for ${durationStr}. Reason: ${reason}`,
        flags: 64
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `❌ Failed to timeout ${user.tag}.`,
        flags: 64
      });
    }
  }
};
