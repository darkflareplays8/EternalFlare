const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch'); // If you're using Node 18+, fetch is built-in

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get your random meme here!'),
  
  async execute(interaction) {
    await interaction.deferReply(); // In case API is slow

    try {
      const response = await fetch('https://meme-api.com/gimme');
      const meme = await response.json();

      const embed = new EmbedBuilder()
        .setTitle("Your meme:")
        .setURL(meme.postLink)
        .setImage(meme.url)
        .setColor(0xff9900)
        .setFooter("EternalFlare Discord);

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Meme API error:', error);
      await interaction.editReply('⚠️ Failed to fetch a meme. Try again later!');
    }
  },
};
