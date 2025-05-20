const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the kick'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      await interaction.guild.members.kick(user, reason);
      await interaction.reply({
        content: `Successfully kicked ${user.tag} for: ${reason}`,
        ephemeral: true
      });
    } catch (error) {
      await interaction.reply({
        content: `Failed to kick ${user.tag}. Make sure I have the right permissions.`,
        ephemeral: true
      });
    }
  }
};