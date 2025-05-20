const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const banMessages = [
  "Sayonara! 👋",
  "The ban hammer has spoken! 🔨",
  "Another one bites the dust! 💨",
  "See you never! 🚫",
  "Gone with the wind! 🌪️"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rban')
    .setDescription('Ban a user with a random message')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to ban')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const randomMessage = banMessages[Math.floor(Math.random() * banMessages.length)];

    try {
      await interaction.guild.members.ban(user);
      await interaction.reply({
        content: `${randomMessage} ${user.tag} has been banned!`,
        ephemeral: true
      });
    } catch (error) {
      await interaction.reply({
        content: `Failed to ban ${user.tag}. Make sure I have the right permissions.`,
        ephemeral: true
      });
    }
  }
};