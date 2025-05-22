const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('license')
    .setDescription("Get a link to the bot's license."),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('License Information')
      .setDescription(
        `This bot is licensed under the MIT License.\n[Click here to view the full license](https://opensource.org/licenses/MIT)`
      )
      .setColor('#FF4500')
      .setTimestamp()
      .setFooter({ text: 'EternalFlare', iconURL: interaction.client.user.displayAvatarURL() });

    await interaction.reply({ embeds: [embed] });
  }
};
