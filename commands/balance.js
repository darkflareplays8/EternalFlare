const { SlashCommandBuilder } = require('discord.js');
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
    if (rows.length > 0) {
      flares = rows[0].flares;
    }

    const replyText =
      targetUser.id === interaction.user.id
        ? `🔥 You have **${flares.toLocaleString()}** flares.`
        : `🔥 ${targetUser.username} has **${flares.toLocaleString()}** flares.`;

    await interaction.reply({
      content: replyText,
      flags: 64
    });

    await connection.end();
  }
};
