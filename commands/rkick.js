const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const kickMessages = [
  "Hasta la vista! 👢",
  "And they're outta here! 🚪",
  "Kicked like a football! ⚽",
  "Time to take a walk! 🚶",
  "See you later, alligator! 🐊"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rkick')
    .setDescription('Kick a user with a random message')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to kick')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const randomMessage = kickMessages[Math.floor(Math.random() * kickMessages.length)];

    try {
      await interaction.guild.members.kick(user);
      await interaction.reply({
        content: `${randomMessage} ${user.tag} has been kicked!`,
        ephemeral: true
      });
    } catch (error) {
      await interaction.reply({
        content: `Failed to kick ${user.tag}. Make sure I have the right permissions.`,
        ephemeral: true
      });
    }
  }
};