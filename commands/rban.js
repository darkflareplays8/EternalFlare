const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rban')
    .setDescription('Ban all members with a specified role')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role whose members should be banned')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('delete_days')
        .setDescription('Number of days of messages to delete (0-7)')
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(7))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const deleteDays = interaction.options.getInteger('delete_days') || 0;

    if (!role) {
      return interaction.reply({ content: '❌ Role not found.', flags: 64 });
    }

    const membersWithRole = role.members;
    if (!membersWithRole || membersWithRole.size === 0) {
      return interaction.reply({ content: '⚠️ No members have this role.', flags: 64 });
    }

    await interaction.deferReply();

    let bannedCount = 0;
    let failedCount = 0;

    for (const [id, member] of membersWithRole) {
      if (!member.bannable) {
        failedCount++;
        continue;
      }

      try {
        await member.ban({ reason, deleteMessageDays: deleteDays });
        bannedCount++;
      } catch {
        failedCount++;
      }
    }

    await interaction.editReply(`✅ Banned ${bannedCount} member(s) with the **${role.name}** role.\n❌ Failed to ban ${failedCount} member(s).`);
  },
};
