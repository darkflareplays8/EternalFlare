const { SlashCommandBuilder } = require('discord.js');
const mysql = require('mysql2/promise');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Get yo daily flares!'),

  async execute(interaction) {
    const connection = await mysql.createConnection({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: 4000,
      ssl: { rejectUnauthorized: true } // <-- Required for TiDB Serverless
    });

    const userId = interaction.user.id;
    const now = Date.now();
    const dailyAmount = 5000;
    const cooldown = 24 * 60 * 60 * 1000; // 24h in ms

    try {
      // Get last claim time
      const [rows] = await connection.execute(
        'SELECT last_daily FROM cooldowns WHERE user_id = ?',
        [userId]
      );

      if (rows.length > 0 && now - rows[0].last_daily < cooldown) {
        const nextClaim = new Date(rows[0].last_daily + cooldown);
        return interaction.reply({
          content: `🕒 You already claimed your daily flares! Try again <t:${Math.floor(nextClaim.getTime() / 1000)}:R>.`,
          flags: 64,
        });
      }

      // Add/update cooldown entry
      await connection.execute(
        'INSERT INTO cooldowns (user_id, last_daily) VALUES (?, ?) ON DUPLICATE KEY UPDATE last_daily = ?',
        [userId, now, now]
      );

      // Create currency entry if needed
      await connection.execute(
        'INSERT INTO currency (user_id, flares) VALUES (?, ?) ON DUPLICATE KEY UPDATE flares = flares + ?',
        [userId, dailyAmount, dailyAmount]
      );

      await interaction.reply({
        content: `🌟 You received **${dailyAmount.toLocaleString()} flares**!`
      });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: '❌ Something went wrong while processing your daily reward.',
        flags: 64,
      });
    } finally {
      await connection.end();
    }
  },
};
