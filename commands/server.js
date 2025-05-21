const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Get a link to join the official discord server'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#FF4500')
      .setTitle('DarkFlare Inc Invite')
      .setDescription('Click [here](https://discord.gg/4wEmCnDDgN) to join the official discord server.');

    await interaction.reply({ embeds: [embed] });
  }
};
