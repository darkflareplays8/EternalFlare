const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed-attach")
    .setDescription("Attch a customizable embed to an existing message.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addSubcommand(sub =>
      sub
        .setName("attach")
        .setDescription("Attach an embed to an existing message.")
        .addStringOption(option =>
          option.setName("message_id").setDescription("ID of the target message").setRequired(true)
        )
        .addStringOption(option =>
          option.setName("title").setDescription("Title of the embed").setRequired(true)
        )
        .addStringOption(option =>
          option.setName("description").setDescription("Description/body of the embed").setRequired(true)
        )
        .addStringOption(option =>
          option.setName("color").setDescription("Hex color (e.g., #ff0000)").setRequired(false)
        )
        .addStringOption(option =>
          option.setName("image").setDescription("Image URL").setRequired(false)
        )
        .addStringOption(option =>
          option.setName("footer").setDescription("Footer text").setRequired(false)
        )
    ),

  async execute(interaction) {
    if (interaction.options.getSubcommand() === "attach") {
      const messageId = interaction.options.getString("message_id");
      const title = interaction.options.getString("title");
      const description = interaction.options.getString("description");
      const color = interaction.options.getString("color") || "#FF4500";
      const image = interaction.options.getString("image");
      const footer = interaction.options.getString("footer");

      // Attempt to fetch the message
      let targetMessage;
      try {
        targetMessage = await interaction.channel.messages.fetch(messageId);
      } catch (err) {
        return interaction.reply({
          content: "❌ Could not find a message with that ID in this channel.",
          flags: 64, // Ephemeral
        });
      }

      // Check if the bot can edit the message
      if (!targetMessage.editable) {
        return interaction.reply({
          content: "❌ I do not have permission to edit that message.",
          flags: 64, // Ephemeral
        });
      }

      // Build the embed
      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();

      if (image) embed.setImage(image);
      if (footer) {
        embed.setFooter({
          text: footer,
          iconURL: interaction.user.displayAvatarURL(),
        });
      }

      // Edit the target message to add the embed
      try {
        await targetMessage.edit({ embeds: [embed] });
        await interaction.reply({
          content: "✅ Embed successfully attached to the message!",
          flags: 64, // Ephemeral
        });
      } catch (err) {
        await interaction.reply({
          content: "❌ Failed to edit the message. I may not have permission or the message is too old.",
          flags: 64, // Ephemeral
        });
      }
    }
  },
};
