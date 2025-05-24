const { ApplicationCommandOptionType, PermissionFlagsBits } = require('discord.js');

module.exports = {
  name: 'rall',
  description: 'Give a role to all server members',
  options: [
    {
      name: 'role',
      description: 'The role to assign to all members',
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ],
  default_member_permissions: PermissionFlagsBits.ManageRoles,
  run: async (client, interaction) => {
    const role = interaction.options.getRole('role');

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({
        content: 'I do not have permission to manage roles.',
        flags: 64,
      });
    }

    await interaction.reply({ content: `Assigning **${role.name}** to all members...`, flags: 64 });

    const members = await interaction.guild.members.fetch();
    let success = 0;
    let failed = 0;

    for (const member of members.values()) {
      if (member.user.bot || member.roles.cache.has(role.id)) continue;
      try {
        await member.roles.add(role);
        success++;
      } catch {
        failed++;
      }
    }

    interaction.followUp({
      content: `✅ Done! Gave the role to ${success} member(s).\n❌ Failed for ${failed} member(s).`,
      flags: 64,
    });
  },
};
