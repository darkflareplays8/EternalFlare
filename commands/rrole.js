const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rrole')
    .setDescription('Gives a role to all members with a specific role')
    .addRoleOption(option =>
      option.setName('source_role')
        .setDescription('The role to target members from')
        .setRequired(true)
    )
    .addRoleOption(option =>
      option.setName('target_role')
        .setDescription('The role to give to those members')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles), // Restrict to users with Manage Roles
  async execute(interaction) {
    try {
      const sourceRole = interaction.options.getRole('source_role');
      const targetRole = interaction.options.getRole('target_role');

      if (sourceRole.id === targetRole.id) {
        return interaction.reply({
          content: '🚫 Source and target roles cannot be the same.',
          ephemeral: true
        });
      }

      // Check bot's role position
      const botMember = await interaction.guild.members.fetchMe();
      if (
        sourceRole.position >= botMember.roles.highest.position ||
        targetRole.position >= botMember.roles.highest.position
      ) {
        return interaction.reply({
          content: '🚫 I cannot manage one or both of those roles due to role hierarchy.',
          ephemeral: true
        });
      }

      await interaction.reply({
        content: `⏳ Assigning <@&${targetRole.id}> to members with <@&${sourceRole.id}>...`,
        ephemeral: true
      });

      const members = await interaction.guild.members.fetch();
      const matchedMembers = members.filter(m => m.roles.cache.has(sourceRole.id));
      let success = 0, failed = 0;

      for (const member of matchedMembers.values()) {
        try {
          await member.roles.add(targetRole);
          success++;
        } catch (e) {
          failed++;
        }
      }

      await interaction.followUp({
        content: `✅ Gave <@&${targetRole.id}> to **${success}** member(s) with <@&${sourceRole.id}>.\n❌ Failed on **${failed}** member(s).`,
        ephemeral: true
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ An error occurred while processing your request.',
        ephemeral: true
      });
    }
  }
};
