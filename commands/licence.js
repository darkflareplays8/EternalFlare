const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('licence')
    .setDescription('Get a link to the bot's license.'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('Liscence Link')
      .setDescription(
        `This bot is liscenced under MIT \n` +
        `Click here to view full`

        
      )
      .setColor('#FF4500')
      .setTimestamp()
      .setFooter({ text: 'EternalFlare', iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.reply({ embeds: [embed] });
  }
};
