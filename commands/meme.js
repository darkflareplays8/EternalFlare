const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

const subreddits = [
  'funny'
  
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get your random meme!'),
  
  async execute(interaction) {
    await interaction.deferReply();

    const subreddit = subreddits[Math.floor(Math.random() * subreddits.length)];

    try {
      const response = await fetch(`https://meme-api.com/gimme/${subreddit}`);
      const meme = await response.json();

      if (!meme || !meme.url) {
        throw new Error('Invalid meme data');
      }

      const embed = new EmbedBuilder()
        .setTitle(`Random Meme:`)
        .setURL(meme.postLink)
        .setImage(meme.url)
        .setColor(0xff4500)
        .setFooter({ text: 'EternalFlare • Memes ' });

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('Meme API error:', error);
      await interaction.editReply('⚠️ Could not fetch a meme. Try again later!');
    }
  },
};
