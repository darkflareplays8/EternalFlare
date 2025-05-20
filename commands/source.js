
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('source')
    .setDescription('Get the source code of the bot'),

  async execute(interaction) {
    await interaction.reply({
      content: 'This bot is open source! You can find the code at: [Your repository link here]',
      ephemeral: true
    });
  }
};
