const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your current flares balance'),
  async execute(interaction) {
    const connection = await mysql.createConnection({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE,
      port: 3306
    });

    const [rows] = await connection.execute(
      'SELECT flares FROM currency WHERE user_id = ?',
      [interaction.user.id]
    );

    let flares = 0;
    if (rows.length > 0) {
      flares = rows[0].flares;
    }

    await interaction.reply({
      content: `🔥 You have **${flares.toLocaleString()}** flares.`,
      flags: 64
    });

    await connection.end();
  }
};
