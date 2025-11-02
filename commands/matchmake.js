const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('matchmaker')
    .setDescription('Shows the match percent between two users!')
    .addUserOption(option =>
      option.setName('user1')
        .setDescription('First user')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('user2')
        .setDescription('Second user')
        .setRequired(true)
    ),

  async execute(interaction) {
    const user1 = interaction.options.getUser('user1');
    const user2 = interaction.options.getUser('user2');

    if (user1.id === user2.id) {
      return interaction.reply({
        content: 'You need to select two different users!',
        flags: MessageFlags.Ephemeral, // Replaces deprecated ephemeral: true
      });
    }

    // Generates a match percent based on user IDs (consistent pairing)
    const percent = Number((BigInt(user1.id) + BigInt(user2.id)) % 101n);

    // For random result every time: use Math.floor(Math.random() * 101);

    let description;
    if (percent >= 80) {
      description = "✨ **Perfect Match!** ✨";
    } else if (percent >= 60) {
      description = "😍 Great combo!";
    } else if (percent >= 40) {
      description = "😊 Not bad!";
    } else if (percent >= 20) {
      description = "😅 It might work...";
    } else {
      description = "💔 Maybe just friends!";
    }

    const embed = new EmbedBuilder()
      .setTitle('💘 Matchmaker Results! 💘')
      .setDescription(`${user1} + ${user2} = **${percent}%** match!\n${description}`)
      .setColor(0xFF69B4);

    await interaction.reply({ embeds: [embed] });
  }
};
