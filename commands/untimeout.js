const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Remove timeout from a member')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to untimeout')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      return interaction.reply({
        content: 'User not found in this server.',
        flags: 64
      });
    }

    try {
      await member.timeout(null);
      await interaction.reply({
        content: `✅ Timeout removed from ${user.tag}.`,
        flags: 64
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `❌ Failed to remove timeout from ${user.tag}.`,
        flags: 64
      });
    }
  }
};
