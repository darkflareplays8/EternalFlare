
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
    .setDescription('Kick all members with a specific role')
    .addRoleOption(option => 
      option.setName('role')
        .setDescription('The role whose members to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the kick'))
    .addStringOption(option =>
      option.setName('dm_message')
        .setDescription('Message to send to kicked users'))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const dmMessage = interaction.options.getString('dm_message');
    const randomMessage = kickMessages[Math.floor(Math.random() * kickMessages.length)];

    try {
      const members = interaction.guild.members.cache.filter(member => member.roles.cache.has(role.id));
      
      await interaction.reply({
        content: `Starting mass kick of ${members.size} members with role ${role.name}...`,
        ephemeral: true
      });

      let kickCount = 0;
      for (const [, member] of members) {
        if (dmMessage) {
          try {
            await member.send(dmMessage);
          } catch (error) {
            console.error(`Could not DM user ${member.user.tag}`);
          }
        }
        
        await member.kick(reason);
        kickCount++;
      }

      await interaction.followUp({
        content: `${randomMessage} Successfully kicked ${kickCount} members with role ${role.name}! Reason: ${reason}`,
        ephemeral: true
      });
    } catch (error) {
      await interaction.followUp({
        content: `Failed to complete the mass kick. Make sure I have the right permissions.`,
        ephemeral: true
      });
    }
  }
};
