const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Roll a dice with an optional range (default 1-6)')
    .addStringOption(option =>
      option
        .setName('range')
        .setDescription('Range in format "min-max", e.g. 1-8')
        .setRequired(false)
    ),

  async execute(interaction) {
    // Get the range string or default
    const rangeStr = interaction.options.getString('range') || '1-6';

    // Validate and parse range
    const match = rangeStr.match(/^(\d+)-(\d+)$/);
    if (!match) {
      return interaction.reply({ content: '❌ Invalid range format! Use "min-max", e.g. 1-8.', ephemeral: true });
    }

    let min = parseInt(match[1], 10);
    let max = parseInt(match[2], 10);

    if (min > max) [min, max] = [max, min]; // Swap if min > max

    // Roll the dice
    const roll = Math.floor(Math.random() * (max - min + 1)) + min;

    // Create the embed
    const embed = new EmbedBuilder()
      .setTitle('🎲 Dice Roll')
      .setDescription(`Range: **${min} - ${max}**\nResult: **${roll}**`)
      .setColor('#FF4500')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
