// commands/lock.js
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

      // Append lock notice to topic
      let newTopic = channel.topic || '';
      if (!newTopic.includes(LOCK_NOTICE)) {
        newTopic += (newTopic ? '\n' : '') + LOCK_NOTICE;
        await channel.setTopic(newTopic).catch(console.error);
      }

      await interaction.reply({
        content: `🔒 This channel is now locked. All messages will be deleted immediately.`,
        flags: 64
      });
    }

    if (subcommand === 'disable') {
      global.lockedChannels.delete(channelId);

      // Remove lock notice from topic
      let newTopic = (channel.topic || '').split('\n').filter(line => line.trim() !== LOCK_NOTICE).join('\n');
      await channel.setTopic(newTopic).catch(console.error);

      await interaction.reply({
        content: `🔓 This channel is now unlocked. Messages will no longer be deleted.`,
        flags: 64
      });
    }
  }
};
