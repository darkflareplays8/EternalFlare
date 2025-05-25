const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.post('/dblwebhook', async (req, res) => {
  const userId = req.body.user;
  if (!userId) return res.sendStatus(400);

  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    await connection.execute(
      `INSERT INTO currency (user_id, flares)
       VALUES (?, 100)
       ON DUPLICATE KEY UPDATE flares = flares + 5000`,
      [userId]
    );

    await connection.end();
    console.log(`✅ ${userId} voted and received 5000 flares!`);
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Error handling vote:', err);
    res.sendStatus(500);
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`[INFO] Webhook server running on port ${port}`);
});

module.exports = app;
