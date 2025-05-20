
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
    .setDescription('Ban all members with a specific role')
    .addRoleOption(option => 
      option.setName('role')
        .setDescription('The role whose members to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for the ban'))
    .addStringOption(option =>
      option.setName('dm_message')
        .setDescription('Message to send to banned users'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const dmMessage = interaction.options.getString('dm_message');
    const randomMessage = banMessages[Math.floor(Math.random() * banMessages.length)];

    try {
      const members = interaction.guild.members.cache.filter(member => member.roles.cache.has(role.id));
      
      await interaction.reply({
        content: `Starting mass ban of ${members.size} members with role ${role.name}...`,
        ephemeral: true
      });

      let banCount = 0;
      for (const [, member] of members) {
        if (dmMessage) {
          try {
            await member.send(dmMessage);
          } catch (error) {
            console.error(`Could not DM user ${member.user.tag}`);
          }
        }
        
        await member.ban({ reason });
        banCount++;
      }

      await interaction.followUp({
        content: `${randomMessage} Successfully banned ${banCount} members with role ${role.name}! Reason: ${reason}`,
        ephemeral: true
      });
    } catch (error) {
      await interaction.followUp({
        content: `Failed to complete the mass ban. Make sure I have the right permissions.`,
        ephemeral: true
      });
    }
  }
};
