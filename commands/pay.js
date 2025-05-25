const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mysql = require('mysql2/promise');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('Send flares to another user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to send flares to')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('The number of flares to send')
        .setRequired(true)
        .setMinValue(1)
    ),

  async execute(interaction) {
    const sender = interaction.user;
    const recipient = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    if (recipient.id === sender.id) {
      return interaction.reply({ content: '❌ You cannot pay yourself.', flags: 64 });
    }

    const connection = await mysql.createConnection({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQL_DATABASE,
      port: 3306
    });

    try {
      await connection.beginTransaction();

      // Get sender balance
      const [senderRows] = await connection.execute(
        'SELECT flares FROM currency WHERE user_id = ? FOR UPDATE',
        [sender.id]
      );

      const senderFlares = senderRows[0]?.flares ?? 0;

      if (senderFlares < amount) {
        await connection.rollback();
        return interaction.reply({ content: '❌ You do not have enough flares.', flags: 64 });
      }

      // Deduct from sender
      await connection.execute(
        'INSERT INTO currency (user_id, flares) VALUES (?, ?) ON DUPLICATE KEY UPDATE flares = flares - ?',
        [sender.id, senderFlares - amount, amount]
      );

      // Add to recipient
      await connection.execute(
        'INSERT INTO currency (user_id, flares) VALUES (?, ?) ON DUPLICATE KEY UPDATE flares = flares + ?',
        [recipient.id, amount, amount]
      );

      await connection.commit();

      const embed = new EmbedBuilder()
        .setTitle('Flares Payed 🔥')
        .setColor('#00BFFF')
        .setDescription(`${sender.username} sent **${amount.toLocaleString()}** flares to ${recipient.username}.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      await connection.rollback();
      console.error(err);
      await interaction.reply({ content: '❌ Something went wrong while processing the payment.', flags: 64 });
    } finally {
      await connection.end();
    }
  }
};
