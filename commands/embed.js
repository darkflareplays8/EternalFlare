const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Send a custom embed message via modal form.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId("embedModal")
      .setTitle("Create a Custom Embed");

    const titleInput = new TextInputBuilder()
      .setCustomId("embedTitle")
      .setLabel("Embed Title")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Enter the embed title")
      .setRequired(true);

    const descriptionInput = new TextInputBuilder()
      .setCustomId("embedDescription")
      .setLabel("Embed Description (supports mentions)")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Type your message here, mentions like @User or @Role will ping")
      .setRequired(true);

    const colorInput = new TextInputBuilder()
      .setCustomId("embedColor")
      .setLabel("Embed Color (Hex, e.g. #FF4500)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("#FF4500 or leave blank for default")
      .setRequired(false);

    const imageInput = new TextInputBuilder()
      .setCustomId("embedImage")
      .setLabel("Image URL")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("https://example.com/image.png")
      .setRequired(false);

    const footerInput = new TextInputBuilder()
      .setCustomId("embedFooter")
      .setLabel("Footer Text")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Footer text or leave blank")
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(titleInput),
      new ActionRowBuilder().addComponents(descriptionInput),
      new ActionRowBuilder().addComponents(colorInput),
      new ActionRowBuilder().addComponents(imageInput),
      new ActionRowBuilder().addComponents(footerInput)
    );

    await interaction.showModal(modal);
  },

  async handleModalSubmit(interaction) {
    if (interaction.customId !== "embedModal") return;

    const title = interaction.fields.getTextInputValue("embedTitle");
    const description = interaction.fields.getTextInputValue("embedDescription");
    let color = interaction.fields.getTextInputValue("embedColor");
    const image = interaction.fields.getTextInputValue("embedImage");
    const footer = interaction.fields.getTextInputValue("embedFooter");

    // Validate and normalize color
    if (!color || !/^#?[0-9A-Fa-f]{6}$/.test(color)) {
      color = "#FF4500"; // default color
    }
    if (color[0] !== "#") color = "#" + color;

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

    // Extract user mentions from description (<@123456789012345678> or <@!123456789012345678>)
    const userMentions = [...description.matchAll(/<@!?(\d+)>/g)].map(m => m[1]);
    // Extract role mentions from description (<@&123456789012345678>)
    const roleMentions = [...description.matchAll(/<@&(\d+)>/g)].map(m => m[1]);

    // Filter IDs to those existing in the guild cache (optional but recommended)
    const validUserMentions = userMentions.filter(id => interaction.guild.members.cache.has(id));
    const validRoleMentions = roleMentions.filter(id => interaction.guild.roles.cache.has(id));

    await interaction.channel.send({
      embeds: [embed],
      allowedMentions: {
        users: validUserMentions,
        roles: validRoleMentions,
      },
    });

    await interaction.reply({
      content: "✅ Embed sent to the channel!",
      flags: 64, // ephemeral reply
    });
  },
};
