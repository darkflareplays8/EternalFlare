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
    // Show the modal on slash command execution
    const modal = new ModalBuilder()
      .setCustomId("embedModal")
      .setTitle("Create a Custom Embed");

    // Title input (required)
    const titleInput = new TextInputBuilder()
      .setCustomId("embedTitle")
      .setLabel("Embed Title")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Enter the embed title")
      .setRequired(true);

    // Description input (required)
    const descriptionInput = new TextInputBuilder()
      .setCustomId("embedDescription")
      .setLabel("Embed Description")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Enter the embed description")
      .setRequired(true);

    // Color input (optional)
    const colorInput = new TextInputBuilder()
      .setCustomId("embedColor")
      .setLabel("Embed Color (Hex, e.g. #FF4500)")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("#FF4500 or leave blank for default")
      .setRequired(false);

    // Image URL input (optional)
    const imageInput = new TextInputBuilder()
      .setCustomId("embedImage")
      .setLabel("Image URL")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("https://example.com/image.png")
      .setRequired(false);

    // Footer input (optional)
    const footerInput = new TextInputBuilder()
      .setCustomId("embedFooter")
      .setLabel("Footer Text")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Footer text or leave blank")
      .setRequired(false);

    // Add inputs to action rows (max 1 input per ActionRow)
    const firstRow = new ActionRowBuilder().addComponents(titleInput);
    const secondRow = new ActionRowBuilder().addComponents(descriptionInput);
    const thirdRow = new ActionRowBuilder().addComponents(colorInput);
    const fourthRow = new ActionRowBuilder().addComponents(imageInput);
    const fifthRow = new ActionRowBuilder().addComponents(footerInput);

    modal.addComponents(firstRow, secondRow, thirdRow, fourthRow, fifthRow);

    await interaction.showModal(modal);
  },

  // This function should be called in your main bot file's interactionCreate event
  async handleModalSubmit(interaction) {
    if (interaction.customId !== "embedModal") return;

    // Extract modal inputs
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

    // Build the embed
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

    // Send the embed to the channel where the command was triggered
    await interaction.channel.send({ embeds: [embed] });

    // Confirm to the user privately
    await interaction.reply({
      content: "✅ Embed sent to the channel!",
      ephemeral: true,
    });
  },
};
