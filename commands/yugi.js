
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('yugi')
    .setDescription('Show my opinion of yugi. (not yu-gioh)'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#FF4500')
      .setTitle('Yugi Opinion')
      .setDescription('Yugi is bad. (not yu-gioh) Baxel is good.');

    await interaction.reply({ embeds: [embed] });
  }
};
