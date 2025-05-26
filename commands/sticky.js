const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

// Map to track sticky messages per channel
const stickyIntervals = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sticky')
    .setDescription('Sends a sticky message that bumps forever.')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to stick.')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('msdelay')
        .setDescription('Delay in milliseconds before bumping (min: 3000ms)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const messageContent = interaction.options.getString('message');
    const msDelay = interaction.options.getInteger('msdelay') ?? 3000;
    const channelId = interaction.channel.id;

    if (stickyIntervals.has(channelId)) {
      return interaction.reply({ content: '❌ A sticky message is already active in this channel. Use /stickyremove first.', flags: 64 });
    }

    if (msDelay < 5000) {
      return interaction.reply({ content: '❌ Delay must be at least 3000ms (3 seconds) to prevent spam.', flags: 64 });
    }

    await interaction.reply({ content: `✅ Sticky message started (every ${msDelay}ms)`, flags: 64 });

    let stickyMsg = await interaction.channel.send(messageContent);

    const interval = setInterval(async () => {
      try {
        await stickyMsg.delete();
        stickyMsg = await interaction.channel.send(messageContent);
      } catch (err) {
        console.error(`[ERROR] Sticky bump failed in channel ${channelId}:`, err);
      }
    }, msDelay);

    stickyIntervals.set(channelId, interval);
  },

  // Export for external use (stickyremove command)
  stickyIntervals,
};

