const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

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
        ephemeral: true,
      });
    }

    // Generate a "match percent" consistently if you want (e.g. based on user IDs), or randomly every use
    // Here's a "consistent" method based on user IDs
    const percent = Math.floor(
      (
        (
          BigInt(user1.id) +
          BigInt(user2.id)
        ) % 101n
      )
    );

    // For a purely random result, just:
    // const percent = Math.floor(Math.random() * 101);

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
