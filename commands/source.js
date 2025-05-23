const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('source')
    .setDescription('Get the source code of the bot'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#FF4500')
      .setTitle('EternalFlare Source Code')
      .setDescription('This bot is open source! You can find the code by clicking [here](https://github.com/DarkFlare-Inc/EternalFlare).');

    await interaction.reply({ embeds: [embed] });
  }
};
