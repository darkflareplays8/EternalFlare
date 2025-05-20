
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Send a custom embed message')
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Title of the embed')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Description/body of the embed')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Hex color (e.g., #ff0000)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('image')
        .setDescription('Image URL')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('footer')
        .setDescription('Footer text')
        .setRequired(false)),

  async execute(interaction) {
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const color = interaction.options.getString('color') || '#FF4500';
    const image = interaction.options.getString('image');
    const footer = interaction.options.getString('footer');

    const embed = new EmbedBuilder()
      .setDescription(description)
      .setColor(color.replace('#', ''))
      .setFooter({ text: footer || '', iconURL: interaction.user.displayAvatarURL() });

    embed.setTitle(title);
    if (image) embed.setImage(image);
    embed.setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
