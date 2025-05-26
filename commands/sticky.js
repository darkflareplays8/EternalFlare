const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Map to track sticky messages per channel
// Stores { stickyMsg: Message }
const stickyMessages = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sticky')
    .setDescription('Sends a sticky message that bumps when a new message is sent.')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to stick.')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const messageContent = interaction.options.getString('message');
    const channelId = interaction.channel.id;

    if (stickyMessages.has(channelId)) {
      return interaction.reply({ content: '❌ A sticky message is already active in this channel. Use /stickyremove first.', flags: 64 });
    }

    await interaction.reply({ content: `✅ Sticky message started. It will bump when new messages are sent.`, flags: 64 });

    const stickyMsg = await interaction.channel.send(messageContent);

    stickyMessages.set(channelId, { stickyMsg, messageContent });
  },

  stickyMessages,
};
