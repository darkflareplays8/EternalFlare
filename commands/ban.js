const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the ban'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      await interaction.guild.members.ban(user, { reason });
      await interaction.reply({
        content: `Successfully banned ${user.tag} for: ${reason}`,
        ephemeral: true
      });
    } catch (error) {
      await interaction.reply({
        content: `Failed to ban ${user.tag}. Make sure I have the right permissions.`,
        ephemeral: true
      });
    }
  }
};