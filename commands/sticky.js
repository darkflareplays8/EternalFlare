const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Map to track sticky messages per channel
// Stores { stickyMsg: Message, messageContent: string, msDelay: number }
const stickyMessages = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sticky')
    .setDescription('Sends a sticky message that bumps when a new message is sent.')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to stick.')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('msdelay')
        .setDescription('Delay in milliseconds before bumping after a new message (min 3000ms)')
        .setMinValue(3000)
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const messageContent = interaction.options.getString('message');
    const msDelay = interaction.options.getInteger('msdelay') ?? 3000; // default 3000ms
    const channelId = interaction.channel.id;

    if (stickyMessages.has(channelId)) {
      return interaction.reply({ content: '❌ A sticky message is already active in this channel. Use /unsticky first.', flags: 64 });
    }

    await interaction.reply({ content: `✅ Sticky message started. It will bump ${msDelay}ms after new messages are sent.`, flags: 64 });

    const stickyMsg = await interaction.channel.send(messageContent);

    stickyMessages.set(channelId, { stickyMsg, messageContent, msDelay, lastBump: 0 });
  },

  stickyMessages,
};
