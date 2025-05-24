const { SlashCommandBuilder } = require('discord.js');
const { PermissionFlagsBits } = require('discord-api-types/v10');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rall')
    .setDescription('Gives a role to all server members')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to give to all members')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Optional: restrict to admins
  async execute(interaction) {
    await interaction.reply({ content: 'Giving everyone the role...', flags: 64 });

    const role = interaction.options.getRole('role');
    const guild = interaction.guild;

    const members = await guild.members.fetch(); // Fetch all members

    let given = 0;
    for (const [, member] of members) {
      if (!member.roles.cache.has(role.id)) {
        try {
          await member.roles.add(role);
          given++;
        } catch (e) {
          console.error(`Failed to give role to ${member.user.tag}:`, e.message);
        }
      }
    }

    await interaction.editReply({
      content: `✅ Done. Gave the role **${role.name}** to ${given} members.`,
      flags: 64
    });
  }
};
