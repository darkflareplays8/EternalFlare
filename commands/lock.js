// commands/lock.js
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

    // Clean up each line for consistent handling
    const topicLines = (channel.topic || '').split('\n').map(l => l.trim());

    if (sub === 'enable') {
      global.lockedChannels.add(channel.id);

      if (!topicLines.includes(LOCK_NOTICE)) {
        topicLines.push(LOCK_NOTICE);
        try {
          await channel.setTopic(topicLines.filter(Boolean).join('\n'));
        } catch (err) {
          console.error('[LOCK] Failed to update topic:', err);
        }
      }

      return interaction.reply({
        content: `🔒 Channel locked. All new messages will be deleted.`,
        flags: 64
      });
    }

    if (sub === 'disable') {
      global.lockedChannels.delete(channel.id);

      // Remove any instance of the LOCK_NOTICE
      const newLines = topicLines.filter(line => line !== LOCK_NOTICE);

      try {
        await channel.setTopic(newLines.join('\n'));
      } catch (err) {
        console.error('[UNLOCK] Failed to update topic:', err);
      }

      return interaction.reply({
        content: `🔓 Channel unlocked. Messages will no longer be deleted.`,
        flags: 64
      });
    }
  }
};
