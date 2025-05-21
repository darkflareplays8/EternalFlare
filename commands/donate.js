const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('donate')
    .setDescription('Get information about supporting the bot'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#FF4500')
      .setTitle('Support EternalFlare')
      .setDescription('If you enjoy using this bot and want to get it online 24/7, \n consider supporting its development! \n You can donate by clicking [here](https://ko-fi.com/darkflareplays8).');

    await interaction.reply({ embeds: [embed] });
  }
};
