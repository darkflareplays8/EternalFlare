const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rkick')
    .setDescription('Kick all members with a specified role')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to kick all members of.')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const role = interaction.options.getRole('role');

    if (!role) return interaction.reply({ content: 'Role not found.', flags: InteractionResponseFlags.Ephemera});
    if (!role.members.size) return interaction.reply({ content: 'No members have this role.', flags: InteractionResponseFlags.Ephemeral});

    let kickedCount = 0;
    let failedCount = 0;

    await interaction.deferReply();

    for (const [memberId, member] of role.members) {
      if (!member.kickable) {
        failedCount++;
        continue;
      }
      try {
        await member.kick(`Kicked via /rkick by ${interaction.user.tag}`);
        kickedCount++;
      } catch {
        failedCount++;
      }
    }

    await interaction.editReply(`Kicked ${kickedCount} member(s) with role ${role.name}. Failed to kick ${failedCount} member(s).`);
  },
};
