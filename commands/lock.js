const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

const LOCK_NOTICE = 'Locked by EternalFlare • Run /lock disable to unlock';

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
    const sub = interaction.options.getSubcommand();
    const channel = interaction.channel;
    global.lockedChannels = global.lockedChannels || new Set();

    if (sub === 'enable') {
      // Set lock state immediately
      global.lockedChannels.add(channel.id);

      // Update topic
      const topicLines = (channel.topic || '').split('\n').map(l => l.trim());
      if (!topicLines.includes(LOCK_NOTICE)) {
        topicLines.push(LOCK_NOTICE);
        try {
          await channel.setTopic(topicLines.filter(Boolean).join('\n'));
        } catch (err) {
          console.error('[LOCK] Failed to update topic:', err);
        }
      }

      // Reply with ephemeral message using flags: 64
      return interaction.reply({
        content: `🔒 Channel locked. All new messages will be deleted.`,
        flags: 64
      });
    }

    if (sub === 'disable') {
      // Remove lock state immediately
      global.lockedChannels.delete(channel.id);

      // Remove lock notice from topic
      const topicLines = (channel.topic || '').split('\n').map(l => l.trim());
      const newLines = topicLines.filter(line => line !== LOCK_NOTICE);
      try {
        await channel.setTopic(newLines.join('\n'));
      } catch (err) {
        console.error('[UNLOCK] Failed to update topic:', err);
      }

      // Reply with ephemeral message using flags: 64
      return interaction.reply({
        content: `🔓 Channel unlocked. Messages will no longer be deleted.`,
        flags: 64
      });
    }
  }
};
