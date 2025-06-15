const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const LOCK_NOTICE = ' • Locked by EternalFlare • Run /lock disable to unlock';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Enable or disable message deletion in this channel')
    .addSubcommand(sub =>
      sub.setName('enable').setDescription('Start deleting all messages in this channel')
    )
    .addSubcommand(sub =>
      sub.setName('disable').setDescription('Stop deleting messages in this channel')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const channel = interaction.channel;
    const channelId = channel.id;

    global.lockedChannels = global.lockedChannels || new Set();

    if (subcommand === 'enable') {
      global.lockedChannels.add(channelId);

      let topicUpdated = true;
      let newTopic = channel.topic || '';
      if (!newTopic.includes(LOCK_NOTICE)) {
        newTopic += (newTopic ? '\n' : '') + LOCK_NOTICE;
        try {
          await channel.setTopic(newTopic);
        } catch (err) {
          topicUpdated = false;
          console.error('[LOCK] Failed to update topic:', err);
        }
      }

      return await interaction.reply({
        content: `🔒 Channel locked. All messages will be deleted.${!topicUpdated ? '\n⚠️ Could not update channel topic (missing permissions?).' : ''}`,
        flags: 64
      });
    }

    if (subcommand === 'disable') {
      global.lockedChannels.delete(channelId);

      let topicUpdated = true;
      let newTopic = (channel.topic || '').split('\n').filter(line => line.trim() !== LOCK_NOTICE).join('\n');
      try {
        await channel.setTopic(newTopic);
      } catch (err) {
        topicUpdated = false;
        console.error('[LOCK] Failed to update topic:', err);
      }

      return await interaction.reply({
        content: `🔓 Channel unlocked. Messages will no longer be deleted.${!topicUpdated ? '\n⚠️ Could not update channel topic (missing permissions?).' : ''}`,
        flags: 64
      });
    }
  }
};
