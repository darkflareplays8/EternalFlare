
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('donate')
    .setDescription('Get information about supporting the bot'),

  async execute(interaction) {
    await interaction.reply({
      content: 'If you enjoy using this bot, consider supporting its development! You can donate at: [Your donation link here]',
      ephemeral: true
    });
  }
};
