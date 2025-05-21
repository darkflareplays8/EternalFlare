const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rban')
    .setDescription('Ban all members with a specified role')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to ban members all members of.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for ban')
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

    if (!role) return interaction.reply({ content: 'Role not found.', ephemeral: true });
    if (!role.members.size) return interaction.reply({ content: 'No members have this role.', flags: 64});

    await interaction.deferReply();

    let bannedCount = 0;
    let failedCount = 0;

    for (const [memberId, member] of role.members) {
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

    await interaction.editReply(`Banned ${bannedCount} member(s) with role ${role.name}. Failed to ban ${failedCount} member(s).`);
  },
};
