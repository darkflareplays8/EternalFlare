const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch'); // Only needed if < Node 18

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get your random meme here!'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const response = await fetch('https://meme-api.com/gimme');
      const meme = await response.json();

      const embed = new EmbedBuilder()
        .setTitle("Your meme:")
        .setURL(meme.postLink)
        .setImage(meme.url)
        .setColor(#FF4500)
        .setFooter({ text: "EternalFlare Discord" });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Meme API error:', error);
      await interaction.editReply('⚠️ Failed to fetch a meme. Try again later!');
    }
  },
};
