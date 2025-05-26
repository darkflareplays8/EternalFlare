const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sticky')
    .setDescription('Sends a sticky message that bumps after a delay (optional).')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to stick.')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('msdelay')
        .setDescription('Delay in milliseconds before bumping.')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages), // Only mods/admins by default
  async execute(interaction) {
    const messageContent = interaction.options.getString('message');
    const msDelay = interaction.options.getInteger('msdelay') ?? null;

    await interaction.reply({ content: 'Sticky message created!', flags: 64 });

    const sentMessage = await interaction.channel.send(messageContent);

    if (msDelay && msDelay > 0) {
      setTimeout(async () => {
        try {
          await interaction.channel.send(messageContent);
        } catch (err) {
          console.error('[ERROR] Failed to resend sticky message:', err);
        }
      }, msDelay);
    }
  },
};
