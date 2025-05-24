const { SlashCommandBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord-api-types/v10');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rremoveall')
    .setDescription('Removes a role from all server members')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to remove from all members')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // optional: admin only
  async execute(interaction) {
    await interaction.reply({ content: 'Removing the role from everyone...', flags: 64 });

    const role = interaction.options.getRole('role');
    const guild = interaction.guild;

    const members = await guild.members.fetch(); // Get all members

    let removed = 0;
    for (const [, member] of members) {
      if (member.roles.cache.has(role.id)) {
        try {
          await member.roles.remove(role);
          removed++;
        } catch (e) {
          console.error(`Failed to remove role from ${member.user.tag}:`, e.message);
        }
      }
    }

    await interaction.editReply({
      content: `✅ Done. Removed the role **${role.name}** from ${removed} members.`,
      flags: 64
    });
  }
};
