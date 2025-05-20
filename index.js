const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

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
  .setName('embed')
  .setDescription('Send a custom embed message')
  .addStringOption(option =>
    option.setName('description')
      .setDescription('Description/body of the embed')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('title')
      .setDescription('Title of the embed')
      .setRequired(false))
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
      .setRequired(false)),


  
  new SlashCommandBuilder()
    .setName('source')
    .setDescription('Get the source code link of      FlareBot'),

  new SlashCommandBuilder()
    .setName('donate')
    .setDescription('Get the donate link of      FlareBot'),
  
  new SlashCommandBuilder()
    .setName('about')
    .setDescription('Information about the bot and its creator')
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
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers // SERVER MEMBERS INTENT is now enabled
  ] 
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  
  
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'embed') {
    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const color = interaction.options.getString('color') || '#FFA500';
    const image = interaction.options.getString('image');
    const footer = interaction.options.getString('footer');

    const embed = new EmbedBuilder()
      .setDescription(description)
      .setColor(color.replace('#', '')) // remove "#" if present
      .setFooter({ text: footer, iconURL: interaction.user.displayAvatarURL() });

    if (title) embed.setTitle(title);
    if (image) embed.setImage(image);

    embed.setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }


  
  if (interaction.commandName === 'source') {
    const embed = new EmbedBuilder()
      .setColor(0xFF4500)
      .setTitle('EternalFlare Source Code')
      .setDescription(' EternalFlare is open source! Check it out [here](https://replit.com/@saimuralibalmur/FlareBot?v=1#deploy-commands.js)')
      .setTimestamp()
      .setFooter({ text: 'EternalFlare', iconURL: client.user.displayAvatarURL() });

    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'donate') {
    const embed = new EmbedBuilder()
      .setColor(0xFF4500)
      .setTitle('EternalFlare Donate Link')
      .setDescription(' Donate to support the bot creation. Check it out [here](https://ko-fi.com/darkflareplays8)')
      .setTimestamp()
      .setFooter({ text: 'EternalFlare Discord', iconURL: client.user.displayAvatarURL() });

    await interaction.reply({ embeds: [embed] });
  }

  
  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }

  if (interaction.commandName === 'about') {
    const embed = new EmbedBuilder()
      .setColor(0xFF4500)
      .setTitle('About EternalFlare')
      .setDescription(`This is a bot created by [darkflareplays8](https://discord.com/users/darkflarePlays8). It is fully coded in JavaScript and will always be free.`)
      .setThumbnail(client.user.displayAvatarURL())
      .setTimestamp()
      .setFooter({ text: 'EternalFlare Discord', iconURL: client.user.displayAvatarURL() });

    await interaction.reply({ embeds: [embed] });
  }

  if (interaction.commandName === 'kick') {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const days = interaction.options.getInteger('days') || 0;

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ 
        content: 'I don\'t have permission to kick members!', 
        ephemeral: true 
      });
    }

    // Also check for message management permission if days > 0
    if (days > 0 && !interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ 
        content: 'I don\'t have permission to delete messages! Either set days to 0 or give me the Manage Messages permission.', 
        ephemeral: true 
      });
    }

    // Get the GuildMember object
    const member = interaction.guild.members.cache.get(user.id);

    // Check if the member exists in the guild
    if (!member) {
      return interaction.reply({
        content: 'That user is not in this server.',
        ephemeral: true
      });
    }

    // Check if the member is kickable
    if (!member.kickable) {
      return interaction.reply({
        content: 'Unable to do this action, please move my role above the role of the user who will be kicked.',
        ephemeral: true
      });
    }

    await interaction.deferReply();

    try {
      // If days > 0, try to delete messages from this user
      if (days > 0) {
        try {
          const channels = interaction.guild.channels.cache.filter(ch => ch.isTextBased());

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - days);

          for (const [, channel] of channels) {
            try {
              // Bulk delete messages if possible
              const messages = await channel.messages.fetch({ limit: 100 });
              const userMessages = messages.filter(msg => 
                msg.author.id === user.id && msg.createdAt > yesterday
              );

              if (userMessages.size > 0) {
                // Delete messages - note this is limited by Discord API
                for (const [, msg] of userMessages) {
                  await msg.delete().catch(() => {}); // Ignore errors for individual message deletions
                }
              }
            } catch (channelError) {
              console.error(`Failed to delete messages in ${channel.name}: ${channelError}`);
            }
          }
        } catch (deleteError) {
          console.error(`Failed to delete messages for ${user.tag}: ${deleteError}`);
        }
      }

      // Try to DM the user
      try {
        await user.send(`You have been kicked from ${interaction.guild.name} for the following reason: ${reason}`);
      } catch (dmError) {
        console.error(`Failed to DM user ${user.tag}: ${dmError}`);
      }

      // Kick the member
      await member.kick(`${reason} - Executed by ${interaction.user.tag} using /kick`);

      // Reply with success message
      await interaction.editReply(`Successfully kicked ${user.tag}${days > 0 ? ` and deleted their messages from the last ${days} days` : ''}.`);
    } catch (error) {
      console.error(`Error in /kick command: ${error}`);
      await interaction.editReply(`Failed to kick ${user.tag}: ${error.message}`);
    }
  }

  if (interaction.commandName === 'ban') {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const days = interaction.options.getInteger('days') || 0;

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ 
        content: 'I don\'t have permission to ban members!', 
        ephemeral: true 
      });
    }

    // Get the GuildMember object if they're in the guild
    const member = interaction.guild.members.cache.get(user.id);

    // If the user is in the guild, check if they're bannable
    if (member && !member.bannable) {
      return interaction.reply({
        content: 'Unable to do this action, please move my role above the role of the user who will be banned.',
        ephemeral: true
      });
    }

    await interaction.deferReply();

    try {
      // Try to DM the user if they're in the guild
      try {
        await user.send(`You have been banned from ${interaction.guild.name} for the following reason: ${reason}`);
      } catch (dmError) {
        console.error(`Failed to DM user ${user.tag}: ${dmError}`);
      }

      // Ban the user with delete message days option
      await interaction.guild.members.ban(user, {
        deleteMessageDays: days,
        reason: `${reason} - Executed by ${interaction.user.tag} using /ban`
      });

      // Reply with success message
      await interaction.editReply(`Successfully banned ${user.tag}${days > 0 ? ` and deleted their messages from the last ${days} days` : ''}.`);
    } catch (error) {
      console.error(`Error in /ban command: ${error}`);
      await interaction.editReply(`Failed to ban ${user.tag}: ${error.message}`);
    }
  }

  if (interaction.commandName === 'rkick') {
    const role = interaction.options.getRole('role');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const days = interaction.options.getInteger('days') || 0;

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ 
        content: 'I don\'t have permission to kick members!', 
        ephemeral: true 
      });
    }

    // Also check for message management permission if days > 0
    if (days > 0 && !interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ 
        content: 'I don\'t have permission to delete messages! Either set days to 0 or give me the Manage Messages permission.', 
        ephemeral: true 
      });
    }

    // Check role hierarchy
    const botMember = interaction.guild.members.me;
    const targetRole = role;

    // Bot's highest role position
    const botHighestRole = botMember.roles.highest;

    // Check if the bot's highest role is lower than the target role
    if (botHighestRole.position <= targetRole.position) {
      return interaction.reply({
        content: 'Unable to do this action, please move my role above the role of whose members will be kicked.',
        ephemeral: true
      });
    }

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

          // If days > 0, try to delete messages from this user
          if (days > 0) {
            try {
              // We'll need to iterate through channels to delete messages
              // Note: This is a basic implementation and might not be as thorough as the ban command's built-in message deletion
              const channels = interaction.guild.channels.cache.filter(ch => ch.isTextBased());

              const yesterday = new Date();
              yesterday.setDate(yesterday.getDate() - days);

              for (const [, channel] of channels) {
                try {
                  // Bulk delete messages if possible
                  const messages = await channel.messages.fetch({ limit: 100 });
                  const userMessages = messages.filter(msg => 
                    msg.author.id === member.id && msg.createdAt > yesterday
                  );

                  if (userMessages.size > 0) {
                    // Delete messages - note this is limited by Discord API
                    for (const [, msg] of userMessages) {
                      await msg.delete().catch(() => {}); // Ignore errors for individual message deletions
                    }
                  }
                } catch (channelError) {
                  // Ignore errors for individual channels
                  console.error(`Failed to delete messages in ${channel.name}: ${channelError}`);
                }
              }
            } catch (deleteError) {
              console.error(`Failed to delete messages for ${member.user.tag}: ${deleteError}`);
              // Continue with kick even if message deletion fails
            }
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
        `Operation completed:\n- Kicked: ${kickedCount} members\n- Failed: ${failedCount} members\n- Reason: ${reason}\n- Message deletion: ${days} days`
      );
    } catch (error) {
      console.error(`Error in /rkick command: ${error}`);
      await interaction.editReply(`An error occurred while executing the command: ${error.message}`);
    }
  }

  if (interaction.commandName === 'rban') {
    const role = interaction.options.getRole('role');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const days = interaction.options.getInteger('days') || 0;

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ 
        content: 'I don\'t have permission to ban members!', 
        ephemeral: true 
      });
    }

    // Check role hierarchy
    const botMember = interaction.guild.members.me;
    const targetRole = role;

    // Bot's highest role position
    const botHighestRole = botMember.roles.highest;

    // Check if the bot's highest role is lower than the target role
    if (botHighestRole.position <= targetRole.position) {
      return interaction.reply({
        content: 'Unable to do this action, please move my role above the role of whose members will be banned.',
        ephemeral: true
      });
    }

    await interaction.deferReply();

    try {
      // Fetch all guild members to ensure the cache is up to date
      await interaction.guild.members.fetch();

      const membersWithRole = interaction.guild.members.cache.filter(
        member => member.roles.cache.has(role.id) && member.bannable
      );

      if (membersWithRole.size === 0) {
        return interaction.editReply(`No bannable members found with the role ${role.name}.`);
      }

      let bannedCount = 0;
      let failedCount = 0;

      // Send a confirmation message for large bans
      if (membersWithRole.size > 5) {
        await interaction.editReply(`Starting to ban ${membersWithRole.size} members with the role ${role.name}. This may take a while...`);
      }

      // Process bans
      for (const [, member] of membersWithRole) {
        try {
          // Try to DM the user first
          try {
            await member.send(`You have been banned from ${interaction.guild.name} for the following reason: ${reason}`);
          } catch (dmError) {
            console.error(`Failed to DM user ${member.user.tag}: ${dmError}`);
            // Continue with ban even if DM fails
          }

          // Ban the member
          await member.ban({
            deleteMessageDays: days,
            reason: `${reason} - Executed by ${interaction.user.tag} using /rban`
          });
          bannedCount++;
        } catch (banError) {
          console.error(`Failed to ban ${member.user.tag}: ${banError}`);
          failedCount++;
        }
      }

      // Update the reply with the results
      await interaction.editReply(
        `Operation completed:\n- Banned: ${bannedCount} members\n- Failed: ${failedCount} members\n- Reason: ${reason}\n- Message deletion: ${days} days`
      );
    } catch (error) {
      console.error(`Error in /rban command: ${error}`);
      await interaction.editReply(`An error occurred while executing the command: ${error.message}`);
    }
  }
});

client.login(token);

