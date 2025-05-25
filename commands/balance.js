const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your flare balance.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to check')
        .setRequired(false)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const userId = targetUser.id;

    try {
      const connection = await mysql.createConnection({
        host: process.env.MYSQLHOST,
        user: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE,
        port: 3306
      });

      const [rows] = await connection.execute(
        'SELECT flares FROM currency WHERE user_id = ?',
        [userId]
      );

      let flares = 0;
      if (rows.length > 0) {
        flares = rows[0].flares;
      }

      await connection.end();

      await interaction.reply({
        content: `💰 ${targetUser.username} has **${flares.toLocaleString()}** flares.`,
      });

    } catch (error) {
      console.error('[ERROR] /balance failed:', error);
      await interaction.reply({
        content: '⚠️ Could not retrieve balance. Please try again later.',
        flags: 64
      });
    }
  }
};
