const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Ask the magic 8-ball a question')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Your question for the 8-ball')
        .setRequired(true)
    ),

  async execute(interaction) {
    const responses = [
      "Yes.",
      "No.",
      "Maybe.",
      "Definitely.",
      "Absolutely not.",
      "Ask again later.",
      "Signs point to yes.",
      "Don't count on it.",
      "It is certain.",
      "Very doubtful."
    ];

    const question = interaction.options.getString('question');
    const answer = responses[Math.floor(Math.random() * responses.length)];

    const embed = new EmbedBuilder()
      .setTitle("🎱 The Magic 8-Ball Says...")
      .addFields(
        { name: "Question", value: question },
        { name: "Answer", value: answer }
      )
      .setColor("FF4500");

    await interaction.reply({ embeds: [embed] });
  }
};
