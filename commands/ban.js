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
      const member = await interaction.guild.members.fetch(user.id);
      await member.ban({ reason });

      await interaction.reply({
        content: `✅ Successfully banned **${user.tag}** for: ${reason}`,
        flags: 64 // Ephemeral response
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `❌ Failed to ban **${user.tag}**. Make sure I have permission and the user is in this server.`,
        flags: 64
      });
    }
  }
};
