const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Send a custom embed message.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption((option) =>
      option.setName("title").setDescription("Title of the embed").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("description").setDescription("Description/body of the embed").setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("color").setDescription("Hex color (e.g., #ff0000)").setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("image").setDescription("Image URL").setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("footer").setDescription("Footer text").setRequired(false)
    ),

  async execute(interaction) {
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const color = interaction.options.getString("color") || "#FF4500";
    const image = interaction.options.getString("image");
    const footer = interaction.options.getString("footer");

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)
      .setTimestamp();

    if (image) embed.setImage(image);

    if (footer) {
      embed.setFooter({
        text: `${footer} | EternalFlare Embeds`,
        iconURL: interaction.user.displayAvatarURL(),
      });
    } else {
      embed.setFooter({
        text: "EternalFlare Embeds",
        iconURL: interaction.user.displayAvatarURL(),
      });
    }

    // 1. Ephemeral confirmation to the user
    await interaction.reply({
      content: "✅ Embed sent to the channel!",
      ephemeral: true,
    });

    // 2. Send the embed as a normal message to the channel
    await interaction.channel.send({ embeds: [embed] });
  },
};
