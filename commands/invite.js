const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Get link to invite the EternalFlare bot to your server'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#FF4500')
      .setTitle('Invite EternalFlare')
      .setDescription('Click [here](https://discord.com/oauth2/authorize?client_id=1374037811287556098&permissions=8&integration_type=0&scope=bot) to invite the bot to your server.');

    await interaction.reply({ embeds: [embed] });
  }
};
