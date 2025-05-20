
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reactionrole-add')
    .setDescription('Add reaction role to an existing message')
    .addStringOption(option =>
      option.setName('messageid')
        .setDescription('The ID of the message to add reaction role to')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to give')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('The emoji to react with')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel where the message is located')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const messageId = interaction.options.getString('messageid');
    const role = interaction.options.getRole('role');
    const emoji = interaction.options.getString('emoji');
    const channel = interaction.options.getChannel('channel');

    try {
      const message = await channel.messages.fetch(messageId);
      await message.react(emoji);
      await interaction.reply({ 
        content: `Successfully added reaction role with emoji ${emoji} for role ${role.name}`,
        ephemeral: true 
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({ 
        content: 'Failed to add reaction role. Make sure the message ID and emoji are valid.',
        ephemeral: true 
      });
    }
  }
};
