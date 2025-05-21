const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription("Check the bot's latency"),

  async execute(interaction) {
    const start = Date.now();

    await interaction.deferReply();

    const latency = Date.now() - start;
    const apiLatency = interaction.client.ws.ping;

    const embed = new EmbedBuilder()
      .setColor('#FF4500')
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'Message Latency', value: `${latency}ms`, inline: true },
        { name: 'API Latency', value: `${apiLatency}ms`, inline: true }
      );

    await interaction.editReply({ embeds: [embed] });
  }
};
