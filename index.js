const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID; // from environment variable

const commands = [
  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!'),
  
  new SlashCommandBuilder()
    .setName('rkick')
    .setDescription('Kicks all members with a specific role')
    .addRoleOption(option => 
      option.setName('role')
        .setDescription('The role to kick all members from')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('reason')
        .setDescription('The reason for kicking (will be DMed to users)')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

async function registerCommands() {
  try {
    console.log('Started refreshing global application (/) commands.');
    await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands },
    );
    console.log('Successfully reloaded global application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}

registerCommands();

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds
    // Note: If you want to use the /rkick command, you need to:
    // 1. Uncomment the line below
    // 2. Enable SERVER MEMBERS INTENT in Discord Developer Portal
    // GatewayIntentBits.GuildMembers 
  ] 
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
  
  if (interaction.commandName === 'rkick') {
    const role = interaction.options.getRole('role');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ 
        content: 'I don\'t have permission to kick members!', 
        ephemeral: true 
      });
    }
    
    await interaction.reply({
      content: `To use this command, the bot needs SERVER MEMBERS INTENT enabled in the Discord Developer Portal. Please enable this intent and then try again.`,
      ephemeral: true
    });
    
    /* NOTE: The code below will work once you enable SERVER MEMBERS INTENT in Discord Developer Portal
    // This code is commented out until the proper intent is enabled

    await interaction.deferReply();
    
    try {
      // Fetch all guild members to ensure the cache is up to date
      await interaction.guild.members.fetch();
      
      const membersWithRole = interaction.guild.members.cache.filter(
        member => member.roles.cache.has(role.id) && member.kickable
      );
      
      if (membersWithRole.size === 0) {
        return interaction.editReply(`No kickable members found with the role ${role.name}.`);
      }
      
      let kickedCount = 0;
      let failedCount = 0;
      
      // Send a confirmation message for large kicks
      if (membersWithRole.size > 5) {
        await interaction.editReply(`Starting to kick ${membersWithRole.size} members with the role ${role.name}. This may take a while...`);
      }
      
      // Process kicks
      for (const [, member] of membersWithRole) {
        try {
          // Try to DM the user first
          try {
            await member.send(`You have been kicked from ${interaction.guild.name} for the following reason: ${reason}`);
          } catch (dmError) {
            console.error(`Failed to DM user ${member.user.tag}: ${dmError}`);
            // Continue with kick even if DM fails
          }
          
          // Kick the member
          await member.kick(`${reason} - Executed by ${interaction.user.tag} using /rkick`);
          kickedCount++;
        } catch (kickError) {
          console.error(`Failed to kick ${member.user.tag}: ${kickError}`);
          failedCount++;
        }
      }
      
      // Update the reply with the results
      await interaction.editReply(
        `Operation completed:\n- Kicked: ${kickedCount} members\n- Failed: ${failedCount} members\n- Reason: ${reason}`
      );
    } catch (error) {
      console.error(`Error in /rkick command: ${error}`);
      await interaction.editReply(`An error occurred while executing the command: ${error.message}`);
    }
    */
  }
});

client.login(token);

