const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your or someone else\'s flare balance')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user whose flares you want to check')
        .setRequired(false)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;

    const connection = await mysql.createConnection({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: 3306
    });

    const [rows] = await connection.execute(
      'SELECT flares FROM currency WHERE user_id = ?',
      [targetUser.id]
    );

    let flares = 0;
    let hasRecord = false;
    if (rows.length > 0) {
      flares = rows[0].flares;
      hasRecord = true;
    }

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${targetUser.username}'s Balance`, iconURL: targetUser.displayAvatarURL() })
      .setColor('#FF4500')
      .addFields({
        name: '🔥 Flares',
        value: hasRecord ? `**${flares.toLocaleString()}**` : '*No record found*',
        inline: true
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      flags: 64
    });

    await connection.end();
  }
};
