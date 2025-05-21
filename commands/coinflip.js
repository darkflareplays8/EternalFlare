const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Flip a coin and get heads or tails'),

  async execute(interaction) {
    const result = Math.random() < 0.5 ? 'Heads' : 'Tails';

    const embed = new EmbedBuilder()
      .setTitle('🪙 Coin Flip')
      .setDescription(`The coin landed on **${result}**!`)
      .setColor('#FF4500')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
