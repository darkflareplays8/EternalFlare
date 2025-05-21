const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('List all available commands'),

  async execute(interaction) {
    const commandsPath = path.join(__dirname);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter(file => file.endsWith('.js'));

    const commandsList = [];

    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file));

      if (command.data && command.data.name && command.data.description) {
        commandsList.push({
          name: `/${command.data.name}`,
          value: command.data.description,
        });
      }
    }

    const helpEmbed = new EmbedBuilder()
      .setTitle('📜 EternalFlare Bot Commands')
      .setColor(0xFF4500)
      .setDescription('Here are all the available commands you can use:')
      .addFields(commandsList)
      .setFooter({
        text: `EternalFlare • Requested by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    await interaction.reply({ embeds: [helpEmbed] });
  },
};
