console.log("🚀 Deploy script started");


const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

const commands = [
  new SlashCommandBuilder()
  .setName('embed')
  .setDescription('Send a custom embed message')
  .addStringOption(option =>
    option.setName('title')
      .setDescription('Title of the embed')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('description')
      .setDescription('Description/body of the embed')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('color')
      .setDescription('Hex color (e.g., #ff0000)')
      .setRequired(false))
  .addStringOption(option =>
    option.setName('image')
      .setDescription('Image URL')
      .setRequired(false))
  .addStringOption(option =>
    option.setName('footer')
      .setDescription('Footer text')
      .setRequired(true))


  
  new SlashCommandBuilder()
    .setName('source')
    .setDescription('Get the source code link of      FlareBot'),

  new SlashCommandBuilder()
    .setName('donate')
    .setDescription('Get the donate link of      FlareBot'),
  
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
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('Number of days of messages to delete (0-7)')
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  
  new SlashCommandBuilder()
    .setName('rban')
    .setDescription('Bans all members with a specific role')
    .addRoleOption(option => 
      option.setName('role')
        .setDescription('The role to ban all members from')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('reason')
        .setDescription('The reason for banning (will be DMed to users)')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('Number of days of messages to delete (0-7)')
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    
  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks a user from the server')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to kick')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('reason')
        .setDescription('The reason for kicking (will be DMed to the user)')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('Number of days of messages to delete (0-7)')
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    
  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans a user from the server')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('The user to ban')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('reason')
        .setDescription('The reason for banning (will be DMed to the user)')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('Number of days of messages to delete (0-7)')
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    
  new SlashCommandBuilder()
    .setName('about')
    .setDescription('Information about the bot and its creator'),

  new SlashCommandBuilder()
    .setName('reactionrole add')
    .setDescription('Add reaction role to an existing message')
    .addStringOption(option =>
      option.setName('messageid')
        .setDescription('The ID of the message to add reaction role to')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to give')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('The emoji to react with')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel where the message is located')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  
  new SlashCommandBuilder()
    .setName('reactionrole')
    .setDescription('Create a reaction role message')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to give')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to display')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('The emoji to react with')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
