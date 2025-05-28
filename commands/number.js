const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('number')
    .setDescription('Generate a random number between two values')
    .addIntegerOption(option =>
      option.setName('min')
        .setDescription('Minimum number')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('max')
        .setDescription('Maximum number')
        .setRequired(true)),

  async execute(interaction) {
    const min = interaction.options.getInteger('min');
    const max = interaction.options.getInteger('max');

    if (min >= max) {
      return await interaction.reply({
        content: '❌ The minimum value must be less than the maximum value.',
        flags: 64 // Ephemeral
      });
    }

    const result = Math.floor(Math.random() * (max - min + 1)) + min;

    const embed = new EmbedBuilder()
      .setTitle('🎲 Random Number Generator')
      .setDescription(`You asked for a number between **${min}** and **${max}**`)
      .addFields({ name: 'Result', value: `🎯 **${result}**` })
      .setColor('FF4500');

    await interaction.reply({ embeds: [embed] });
  }
};
