const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Get information about the bot and its creator'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('About EternalFlare')
      .setDescription(
        `This is a JavaScript-made bot created solely by darkflareplays8.\n` +
        `To invite it to your own server, run /invite.\n` +
        `To get a command list, run /help.\n` 
        `To support and help me continue maintaining this bot, run /donate.\n`
        
      )
      .setColor('#FF4500')
      .setTimestamp()
      .setFooter({ text: 'EternalFlare', iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.reply({ embeds: [embed] });
  }
};
